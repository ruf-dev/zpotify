package v1

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"regexp"
	"strings"
	"sync"
	"testing"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/bencode"
	"github.com/anacrolix/torrent/metainfo"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/file_storage_providers"
	"go.zpotify.ru/zpotify/internal/storage/pg"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

const (
	searchTestApiKey        = "test-api-key"
	searchTestStatusPath    = "/api/v1/system/status"
	searchTestSearchPath    = "/api/v1/search"
	searchTestIndexerPath   = "/api/v1/indexer"
	searchTestBodyMarker    = "upstream-secret-body-marker"
	searchTestDownloadPath  = "/12/download"
	searchTestAlbumName     = "Album"
	searchTestAlbumTrack1   = "01.flac"
	searchTestAlbumTrack2   = "02.flac"
	searchTestPieceLength   = int64(16384)
	searchTestTrackSize     = int64(20000)
	searchTestMagnetPeerSet = "magnet:?xt=urn:btih:"
)

var searchTestDownloadRoute = regexp.MustCompile(`^/\d+/download$`)

type searchRecordedRequest struct {
	Path   string
	Query  url.Values
	Header http.Header
}

type searchWireRelease struct {
	Guid        string `json:"guid"`
	Title       string `json:"title"`
	Size        int64  `json:"size"`
	Indexer     string `json:"indexer"`
	PublishDate string `json:"publishDate"`
	Protocol    string `json:"protocol"`
	Seeders     *int64 `json:"seeders"`
	InfoHash    string `json:"infoHash"`
	MagnetUrl   string `json:"magnetUrl"`
	DownloadUrl string `json:"downloadUrl"`
}

// fakeProwlarr is a hand-written stand-in for the Prowlarr HTTP API.
type fakeProwlarr struct {
	server          *httptest.Server
	statusCode      int
	searchCode      int
	releases        []searchWireRelease
	downloadHandler http.HandlerFunc

	mu       sync.Mutex
	requests []searchRecordedRequest
}

func newFakeProwlarr(t *testing.T) *fakeProwlarr {
	t.Helper()

	p := &fakeProwlarr{
		statusCode: http.StatusOK,
		searchCode: http.StatusOK,
	}
	p.server = httptest.NewServer(http.HandlerFunc(p.serve))
	t.Cleanup(p.server.Close)

	return p
}

func (p *fakeProwlarr) serve(w http.ResponseWriter, r *http.Request) {
	record := searchRecordedRequest{
		Path:   r.URL.Path,
		Query:  r.URL.Query(),
		Header: r.Header.Clone(),
	}
	p.mu.Lock()
	p.requests = append(p.requests, record)
	p.mu.Unlock()

	switch {
	case r.URL.Path == searchTestStatusPath:
		w.WriteHeader(p.statusCode)
	case r.URL.Path == searchTestSearchPath:
		p.serveSearch(w)
	case searchTestDownloadRoute.MatchString(r.URL.Path) && p.downloadHandler != nil:
		p.downloadHandler(w, r)
	default:
		w.WriteHeader(http.StatusNotFound)
	}
}

func (p *fakeProwlarr) serveSearch(w http.ResponseWriter) {
	if p.searchCode != http.StatusOK {
		w.WriteHeader(p.searchCode)
		_, _ = w.Write([]byte(searchTestBodyMarker))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(p.releases)
}

func (p *fakeProwlarr) requestsTo(path string) []searchRecordedRequest {
	p.mu.Lock()
	defer p.mu.Unlock()

	matched := make([]searchRecordedRequest, 0, len(p.requests))
	for _, request := range p.requests {
		if request.Path == path {
			matched = append(matched, request)
		}
	}

	return matched
}

func (p *fakeProwlarr) requestCount() int {
	p.mu.Lock()
	defer p.mu.Unlock()

	return len(p.requests)
}

func (p *fakeProwlarr) downloadUrl(link string) string {
	return p.server.URL + searchTestDownloadPath + "?apikey=" + searchTestApiKey + "&link=" + link + "&file=x"
}

// torrentSearchTestStorage swaps the torrent_downloads storage for one bound to a
// transaction that is rolled back on cleanup; everything else is the real storage.
type torrentSearchTestStorage struct {
	storage.Storage
	downloads storage.TorrentDownloadStorage
}

func (s *torrentSearchTestStorage) TorrentDownloads() storage.TorrentDownloadStorage {
	return s.downloads
}

type torrentSearchFixture struct {
	prowlarr    *fakeProwlarr
	storage     storage.Storage
	importer    *TorrentService
	client      *torrent.Client
	userId      int64
	otherUserId int64
}

func newTorrentSearchFixture(t *testing.T) *torrentSearchFixture {
	t.Helper()

	tx, db := openTorrentImportTestTx(t)

	userId := insertSearchTestUser(t, tx, "torrent-search-user")
	otherUserId := insertSearchTestUser(t, tx, "torrent-search-other-user")

	realStorage := pg.NewStorage(db)
	txStorage := &torrentSearchTestStorage{
		Storage:   realStorage,
		downloads: realStorage.TorrentDownloads().WithTx(tx),
	}

	binaryStorage, err := file_storage_providers.NewLocalStorageProvider(t.TempDir())
	require.NoError(t, err)

	clientCfg := newLocalClientConfig(t, t.TempDir())
	client := newLocalClient(t, clientCfg)

	importerCfg := TorrentServiceConfig{DownloadDir: clientCfg.DataDir, MetadataTimeout: testMagnetNoPeerWait}
	importer := NewTorrentService(txStorage, binaryStorage, client, importerCfg)

	fx := &torrentSearchFixture{
		prowlarr:    newFakeProwlarr(t),
		storage:     txStorage,
		importer:    importer,
		client:      client,
		userId:      userId,
		otherUserId: otherUserId,
	}

	return fx
}

func insertSearchTestUser(t *testing.T, tx *sql.Tx, username string) int64 {
	t.Helper()

	var userId int64
	err := tx.QueryRowContext(context.Background(), "INSERT INTO users (username) VALUES ($1) RETURNING id", username).
		Scan(&userId)
	require.NoError(t, err)

	return userId
}

func (fx *torrentSearchFixture) newService(t *testing.T, prowlarrUrl string) *TorrentSearchService {
	t.Helper()

	cfg := TorrentSearchServiceConfig{ProwlarrUrl: prowlarrUrl, ProwlarrApiKey: searchTestApiKey}

	svc, err := NewTorrentSearchService(fx.storage, fx.importer, cfg)
	require.NoError(t, err)

	return svc
}

func (fx *torrentSearchFixture) newHealthyService(t *testing.T) *TorrentSearchService {
	t.Helper()

	svc := fx.newService(t, fx.prowlarr.server.URL)

	err := svc.CheckHealth(context.Background())
	require.NoError(t, err)

	return svc
}

func (fx *torrentSearchFixture) userCtx() context.Context {
	return contextWithPermissions(fx.userId, uploadPermissions())
}

func (fx *torrentSearchFixture) addDownload(
	t *testing.T,
	userId int64,
	infoHash string,
	status domain.TorrentDownloadStatus,
) {
	t.Helper()

	ctx := context.Background()
	download := domain.TorrentDownload{UserId: userId, InfoHash: infoHash, TorrentName: "seeded"}

	created, err := fx.storage.TorrentDownloads().Add(ctx, download)
	require.NoError(t, err)

	err = fx.storage.TorrentDownloads().UpdateStatus(ctx, created.Id, status)
	require.NoError(t, err)
}

func (fx *torrentSearchFixture) discardOnCleanup(t *testing.T, uploadId string) {
	t.Helper()

	t.Cleanup(func() {
		_ = fx.importer.DiscardTorrentFile(fx.userCtx(), uploadId)
	})
}

func int64Ptr(v int64) *int64 {
	return &v
}

func newSearchRelease(title string, protocol string, seeders *int64) searchWireRelease {
	release := searchWireRelease{
		Guid:        "guid-" + title,
		Title:       title,
		Size:        1 << 20,
		Indexer:     "TestIndexer",
		PublishDate: "2026-01-02T03:04:05Z",
		Protocol:    protocol,
		Seeders:     seeders,
	}

	return release
}

func newMagnetSearchRelease(title string, seeders *int64, infoHash string) searchWireRelease {
	release := newSearchRelease(title, "torrent", seeders)
	release.InfoHash = infoHash
	release.MagnetUrl = searchTestMagnetPeerSet + infoHash + "&dn=" + url.QueryEscape(title)

	return release
}

func newDownloadSearchRelease(title string, downloadUrl string) searchWireRelease {
	release := newSearchRelease(title, "torrent", int64Ptr(3))
	release.DownloadUrl = downloadUrl

	return release
}

func newTestTorrentFileBytes(t *testing.T) []byte {
	t.Helper()

	files := []metainfo.FileInfo{
		{Length: searchTestTrackSize, Path: []string{searchTestAlbumTrack1}},
		{Length: searchTestTrackSize, Path: []string{searchTestAlbumTrack2}},
	}
	numPieces := (2*searchTestTrackSize + searchTestPieceLength - 1) / searchTestPieceLength

	info := metainfo.Info{
		PieceLength: searchTestPieceLength,
		Name:        searchTestAlbumName,
		Files:       files,
		Pieces:      make([]byte, 20*numPieces),
	}

	infoBytes, err := bencode.Marshal(info)
	require.NoError(t, err)

	metaInfo := metainfo.MetaInfo{InfoBytes: infoBytes}
	encoded, err := bencode.Marshal(metaInfo)
	require.NoError(t, err)

	return encoded
}

func titlesOf(results []domain.TorrentSearchResult) []string {
	titles := make([]string, 0, len(results))
	for _, result := range results {
		titles = append(titles, result.Title)
	}

	return titles
}

func resultByTitle(t *testing.T, results []domain.TorrentSearchResult, title string) domain.TorrentSearchResult {
	t.Helper()

	for _, result := range results {
		if result.Title == title {
			return result
		}
	}
	require.Failf(t, "result not found", "no search result titled %q", title)

	return domain.TorrentSearchResult{}
}

func Test_TorrentSearch_FiltersAndMarksImported(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	hashA := randomInfoHash(t).HexString()
	hashB := randomInfoHash(t).HexString()
	hashC := randomInfoHash(t).HexString()

	fx.addDownload(t, fx.otherUserId, hashB, domain.TorrentDownloadStatusDone)
	fx.addDownload(t, fx.otherUserId, hashC, domain.TorrentDownloadStatusFailed)

	usenet := newDownloadSearchRelease("usenet", fx.prowlarr.downloadUrl("u"))
	usenet.Protocol = "usenet"
	unusable := newSearchRelease("unusable", "torrent", int64Ptr(9))

	fx.prowlarr.releases = []searchWireRelease{
		newMagnetSearchRelease("normal", int64Ptr(5), hashA),
		usenet,
		newMagnetSearchRelease("zero-seeders", int64Ptr(0), randomInfoHash(t).HexString()),
		newMagnetSearchRelease("null-seeders", nil, randomInfoHash(t).HexString()),
		newMagnetSearchRelease("imported", int64Ptr(2), strings.ToUpper(hashB)),
		newMagnetSearchRelease("failed-only", int64Ptr(2), hashC),
		unusable,
	}
	svc := fx.newHealthyService(t)

	results, err := svc.Search(fx.userCtx(), "pink floyd")
	require.NoError(t, err)

	require.Equal(t, []string{"normal", "null-seeders", "imported", "failed-only"}, titlesOf(results))
	require.False(t, resultByTitle(t, results, "normal").IsAlreadyImported)
	require.False(t, resultByTitle(t, results, "null-seeders").IsAlreadyImported)
	require.True(t, resultByTitle(t, results, "imported").IsAlreadyImported)
	require.False(t, resultByTitle(t, results, "failed-only").IsAlreadyImported)

	searches := fx.prowlarr.requestsTo(searchTestSearchPath)
	require.Len(t, searches, 1)
	require.Equal(t, searchTestApiKey, searches[0].Header.Get("X-Api-Key"))
	require.Equal(t, "3000", searches[0].Query.Get("categories"))
	require.Equal(t, "pink floyd", searches[0].Query.Get("query"))
}

func Test_TorrentSearch_UnavailableWhenProwlarrUnhealthy(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	fx.prowlarr.statusCode = http.StatusInternalServerError
	svc := fx.newService(t, fx.prowlarr.server.URL)

	err := svc.CheckHealth(context.Background())
	require.Error(t, err)

	require.False(t, svc.IsAvailable(fx.userCtx()))

	_, err = svc.Search(fx.userCtx(), "query")
	require.ErrorIs(t, err, service_errors.ErrTorrentSearchUnavailable)
	require.Empty(t, fx.prowlarr.requestsTo(searchTestSearchPath))
}

func Test_TorrentSearch_UnavailableWhenNotConfigured(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	svc := fx.newService(t, "")

	err := svc.CheckHealth(context.Background())
	require.NoError(t, err)

	require.False(t, svc.IsAvailable(fx.userCtx()))

	_, err = svc.Search(fx.userCtx(), "query")
	require.ErrorIs(t, err, service_errors.ErrTorrentSearchUnavailable)
}

func Test_TorrentSearch_DeniedWithoutUploadPermission(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	svc := fx.newHealthyService(t)
	deniedCtx := contextWithPermissions(fx.userId, domain.UserPermissions{CanUpload: false})

	require.True(t, svc.IsAvailable(fx.userCtx()))
	require.False(t, svc.IsAvailable(deniedCtx))

	_, err := svc.Search(deniedCtx, "query")
	require.ErrorIs(t, err, user_errors.ErrPermissionDenied)
	require.Empty(t, fx.prowlarr.requestsTo(searchTestSearchPath))
}

func Test_TorrentSearch_IndexerFailureHidesUpstreamBody(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	svc := fx.newHealthyService(t)
	fx.prowlarr.searchCode = http.StatusBadGateway

	_, err := svc.Search(fx.userCtx(), "query")
	require.ErrorIs(t, err, service_errors.ErrTorrentSearchIndexerFailed)
	require.NotContains(t, err.Error(), searchTestBodyMarker)
}

func Test_TorrentSearch_AddResult_Magnet(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	hash := randomInfoHash(t).HexString()
	fx.prowlarr.releases = []searchWireRelease{newMagnetSearchRelease("magnet-only", int64Ptr(4), hash)}
	svc := fx.newHealthyService(t)

	results, err := svc.Search(fx.userCtx(), "query")
	require.NoError(t, err)
	require.Len(t, results, 1)

	added, err := svc.AddResult(fx.userCtx(), results[0].Id)
	require.NoError(t, err)
	fx.discardOnCleanup(t, added.UploadId)

	require.NotEmpty(t, added.UploadId)
	require.Empty(t, fx.prowlarr.requestsTo(searchTestDownloadPath))
}

func Test_TorrentSearch_AddResult_TorrentFileDownload(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	torrentBytes := newTestTorrentFileBytes(t)
	fx.prowlarr.downloadHandler = func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write(torrentBytes)
	}
	fx.prowlarr.releases = []searchWireRelease{
		newDownloadSearchRelease("torrent-only", fx.prowlarr.downloadUrl("abc")),
	}
	svc := fx.newHealthyService(t)

	results, err := svc.Search(fx.userCtx(), "query")
	require.NoError(t, err)
	require.Len(t, results, 1)

	added, err := svc.AddResult(fx.userCtx(), results[0].Id)
	require.NoError(t, err)
	fx.discardOnCleanup(t, added.UploadId)
	require.NotEmpty(t, added.UploadId)

	downloads := fx.prowlarr.requestsTo(searchTestDownloadPath)
	require.Len(t, downloads, 1)
	require.Equal(t, searchTestApiKey, downloads[0].Query.Get("apikey"))
	require.Equal(t, "abc", downloads[0].Query.Get("link"))

	file, err := fx.importer.GetTorrentFile(fx.userCtx(), added.UploadId)
	require.NoError(t, err)
	require.Equal(t, searchTestAlbumName, file.TorrentName)
	require.Len(t, file.Files, 2)
}

func Test_TorrentSearch_AddResult_RedirectToMagnet(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	hash := randomInfoHash(t)
	location := searchTestMagnetPeerSet + hash.HexString() + "&dn=redirected"
	fx.prowlarr.downloadHandler = func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, location, http.StatusFound)
	}
	fx.prowlarr.releases = []searchWireRelease{
		newDownloadSearchRelease("redirecting", fx.prowlarr.downloadUrl("abc")),
	}
	svc := fx.newHealthyService(t)

	results, err := svc.Search(fx.userCtx(), "query")
	require.NoError(t, err)
	require.Len(t, results, 1)

	added, err := svc.AddResult(fx.userCtx(), results[0].Id)
	require.NoError(t, err)
	fx.discardOnCleanup(t, added.UploadId)
	require.NotEmpty(t, added.UploadId)

	require.Len(t, fx.prowlarr.requestsTo(searchTestDownloadPath), 1)
	require.True(t, hasTorrent(fx.client, hash))

	file, err := fx.importer.GetTorrentFile(fx.userCtx(), added.UploadId)
	require.NoError(t, err)
	require.True(t, file.IsResolving)
}

func Test_TorrentSearch_AddResult_RejectsTamperedId(t *testing.T) {
	fx := newTorrentSearchFixture(t)
	svc := fx.newHealthyService(t)
	requestsBefore := fx.prowlarr.requestCount()
	tamperedId := encodeTorrentSearchResultId(torrentSearchProxyPrefix + searchTestIndexerPath)

	_, err := svc.AddResult(fx.userCtx(), tamperedId)
	require.ErrorIs(t, err, service_errors.ErrInvalidTorrentSearchResultId)

	require.Empty(t, fx.prowlarr.requestsTo(searchTestIndexerPath))
	require.Equal(t, requestsBefore, fx.prowlarr.requestCount())
}
