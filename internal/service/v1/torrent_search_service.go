package v1

import (
	"context"
	"strings"
	"sync/atomic"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/prowlarr"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type TorrentSearchServiceConfig struct {
	ProwlarrUrl    string
	ProwlarrApiKey string
}

type torrentImporter interface {
	AddTorrentMagnet(ctx context.Context, magnetUri string) (domain.TorrentMagnetAdd, error)
	UploadTorrentFile(ctx context.Context, torrentFileBytes []byte) (domain.TorrentFile, error)
}

type TorrentSearchService struct {
	torrentStorage storage.TorrentDownloadStorage
	importer       torrentImporter
	// prowlarr is nil when no Prowlarr url is configured.
	prowlarr  *prowlarr.Client
	isHealthy atomic.Bool
}

func NewTorrentSearchService(
	dataStorage storage.Storage,
	importer torrentImporter,
	cfg TorrentSearchServiceConfig,
) (*TorrentSearchService, error) {
	s := &TorrentSearchService{
		torrentStorage: dataStorage.TorrentDownloads(),
		importer:       importer,
	}

	if cfg.ProwlarrUrl == "" {
		return s, nil
	}

	client, err := prowlarr.New(cfg.ProwlarrUrl, cfg.ProwlarrApiKey)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating prowlarr client")
	}
	s.prowlarr = client

	return s, nil
}

// Status reports the caller's view of torrent search: hidden, configured but unreachable, or usable.
func (s *TorrentSearchService) Status(ctx context.Context) domain.TorrentSearchStatus {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok || !uCtx.Permissions.CanUpload || s.prowlarr == nil {
		return domain.TorrentSearchStatusDisabled
	}

	if !s.isHealthy.Load() {
		return domain.TorrentSearchStatusUnreachable
	}

	return domain.TorrentSearchStatusAvailable
}

// CheckHealth pings Prowlarr and records the result; a no-op when Prowlarr is not configured.
func (s *TorrentSearchService) CheckHealth(ctx context.Context) error {
	if s.prowlarr == nil {
		s.isHealthy.Store(false)
		return nil
	}

	err := s.prowlarr.Ping(ctx)
	s.isHealthy.Store(err == nil)
	if err != nil {
		return rerrors.Wrap(err, "error pinging prowlarr")
	}

	return nil
}

func (s *TorrentSearchService) Search(ctx context.Context, query string) ([]domain.TorrentSearchResult, error) {
	err := authorizeTorrentSearch(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	if strings.TrimSpace(query) == "" {
		return nil, rerrors.Wrap(service_errors.ErrInvalidTorrentSearchQuery)
	}

	if s.prowlarr == nil || !s.isHealthy.Load() {
		return nil, rerrors.Wrap(service_errors.ErrTorrentSearchUnavailable)
	}

	releases, err := s.prowlarr.Search(ctx, query)
	if err != nil {
		return nil, rerrors.Wrap(service_errors.ErrTorrentSearchIndexerFailed, err.Error())
	}

	results := s.filterReleases(releases)

	err = s.markImported(ctx, results)
	if err != nil {
		return nil, rerrors.Wrap(err, "error marking imported torrent search results")
	}

	return toTorrentSearchResults(results), nil
}

func (s *TorrentSearchService) AddResult(ctx context.Context, resultId string) (domain.TorrentMagnetAdd, error) {
	err := authorizeTorrentSearch(ctx)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(err)
	}

	if s.prowlarr == nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(service_errors.ErrTorrentSearchUnavailable)
	}

	source, err := parseTorrentSearchResultId(resultId)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(err)
	}

	added, err := s.importSource(ctx, source)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(err, "error importing torrent search result")
	}

	return added, nil
}

type searchedRelease struct {
	resultId string
	infoHash string
	release  prowlarr.Release
	imported bool
}

func authorizeTorrentSearch(ctx context.Context) error {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	if !uCtx.Permissions.CanUpload {
		return rerrors.Wrap(user_errors.ErrPermissionDenied, "not allowed to upload file")
	}

	return nil
}

func (s *TorrentSearchService) filterReleases(releases []prowlarr.Release) []searchedRelease {
	kept := make([]searchedRelease, 0, len(releases))
	for _, release := range releases {
		if !strings.EqualFold(release.Protocol, "torrent") {
			continue
		}
		if release.Seeders != nil && *release.Seeders == 0 {
			continue
		}

		resultId, ok := torrentSearchResultIdOf(release, s.prowlarr.BaseUrl())
		if !ok {
			continue
		}

		searched := searchedRelease{
			resultId: resultId,
			infoHash: strings.ToLower(release.InfoHash),
			release:  release,
		}
		kept = append(kept, searched)
	}

	return kept
}

func (s *TorrentSearchService) markImported(ctx context.Context, results []searchedRelease) error {
	infoHashes := make([]string, 0, len(results))
	for _, result := range results {
		if result.infoHash != "" {
			infoHashes = append(infoHashes, result.infoHash)
		}
	}
	if len(infoHashes) == 0 {
		return nil
	}

	imported, err := s.torrentStorage.ListImportedInfoHashes(ctx, infoHashes)
	if err != nil {
		return rerrors.Wrap(err, "error listing imported info hashes")
	}

	importedSet := make(map[string]struct{}, len(imported))
	for _, infoHash := range imported {
		importedSet[strings.ToLower(infoHash)] = struct{}{}
	}

	for i := range results {
		_, isImported := importedSet[results[i].infoHash]
		results[i].imported = results[i].infoHash != "" && isImported
	}

	return nil
}

func toTorrentSearchResults(results []searchedRelease) []domain.TorrentSearchResult {
	mapped := make([]domain.TorrentSearchResult, 0, len(results))
	for _, result := range results {
		item := domain.TorrentSearchResult{
			Id:                result.resultId,
			Title:             result.release.Title,
			SizeBytes:         result.release.SizeBytes,
			Indexer:           result.release.Indexer,
			PublishedAt:       result.release.PublishedAt,
			IsAlreadyImported: result.imported,
		}
		mapped = append(mapped, item)
	}

	return mapped
}

func (s *TorrentSearchService) importSource(
	ctx context.Context,
	source torrentSearchResultSource,
) (domain.TorrentMagnetAdd, error) {
	if source.magnetUri != "" {
		return s.importMagnet(ctx, source.magnetUri)
	}

	grab, err := s.prowlarr.Grab(ctx, source.downloadPathAndQuery)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(service_errors.ErrTorrentSearchIndexerFailed, err.Error())
	}

	if grab.MagnetUri != "" {
		return s.importMagnet(ctx, grab.MagnetUri)
	}

	file, err := s.importer.UploadTorrentFile(ctx, grab.TorrentBytes)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(err, "error uploading torrent file")
	}

	return domain.TorrentMagnetAdd{UploadId: file.Id}, nil
}

func (s *TorrentSearchService) importMagnet(ctx context.Context, magnetUri string) (domain.TorrentMagnetAdd, error) {
	added, err := s.importer.AddTorrentMagnet(ctx, magnetUri)
	if err != nil {
		return domain.TorrentMagnetAdd{}, rerrors.Wrap(err, "error adding torrent magnet")
	}

	return added, nil
}
