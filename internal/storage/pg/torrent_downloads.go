package pg

import (
	"context"
	"database/sql"
	"encoding/json"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/torrent_downloads_q"
)

type TorrentDownloadsStorage struct {
	db sqldb.DB
	q  torrent_downloads_q.Querier
}

func NewTorrentDownloadsStorage(db sqldb.DB) *TorrentDownloadsStorage {
	s := &TorrentDownloadsStorage{
		db: db,
		q:  torrent_downloads_q.New(db),
	}

	return s
}

func (s *TorrentDownloadsStorage) WithTx(tx *sql.Tx) storage.TorrentDownloadStorage {
	dbWrapper := &txWrapper{tx}
	newStorage := &TorrentDownloadsStorage{
		db: dbWrapper,
		q:  torrent_downloads_q.New(tx),
	}

	return newStorage
}

func (s *TorrentDownloadsStorage) Add(ctx context.Context, download domain.TorrentDownload) (domain.TorrentDownload, error) {
	params := torrent_downloads_q.InsertTorrentDownloadParams{
		UserID:      download.UserId,
		FolderName:  download.FolderName,
		InfoHash:    download.InfoHash,
		TorrentName: download.TorrentName,
	}

	row, err := s.q.InsertTorrentDownload(ctx, params)
	if err != nil {
		return domain.TorrentDownload{}, wrapPgErr(err)
	}

	dl, err := toTorrentDownloadDomain(row)
	if err != nil {
		return domain.TorrentDownload{}, rerrors.Wrap(err)
	}

	return dl, nil
}

func (s *TorrentDownloadsStorage) Get(ctx context.Context, id int64, userId int64) (domain.TorrentDownload, error) {
	params := torrent_downloads_q.GetTorrentDownloadByIDParams{
		ID:     id,
		UserID: userId,
	}

	row, err := s.q.GetTorrentDownloadByID(ctx, params)
	if err != nil {
		return domain.TorrentDownload{}, wrapPgErr(err)
	}

	dl, err := toTorrentDownloadDomain(row)
	if err != nil {
		return domain.TorrentDownload{}, rerrors.Wrap(err)
	}

	return dl, nil
}

func (s *TorrentDownloadsStorage) ListByUser(ctx context.Context, userId int64, folderName string) ([]domain.TorrentDownload, error) {
	params := torrent_downloads_q.ListTorrentDownloadsByUserParams{
		UserID:     userId,
		FolderName: folderName,
	}

	rows, err := s.q.ListTorrentDownloadsByUser(ctx, params)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	downloads, err := toTorrentDownloadDomainList(rows)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return downloads, nil
}

func (s *TorrentDownloadsStorage) ListActive(ctx context.Context) ([]domain.TorrentDownload, error) {
	rows, err := s.q.ListActiveTorrentDownloads(ctx)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	downloads, err := toTorrentDownloadDomainList(rows)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return downloads, nil
}

func (s *TorrentDownloadsStorage) UpdateProgress(ctx context.Context, id int64, downloadedBytes int64, totalBytes int64) error {
	params := torrent_downloads_q.UpdateTorrentDownloadProgressParams{
		ID:              id,
		DownloadedBytes: downloadedBytes,
		TotalBytes:      totalBytes,
	}

	err := s.q.UpdateTorrentDownloadProgress(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *TorrentDownloadsStorage) UpdateStatus(ctx context.Context, id int64, status domain.TorrentDownloadStatus) error {
	params := torrent_downloads_q.UpdateTorrentDownloadStatusParams{
		ID:     id,
		Status: torrent_downloads_q.TorrentDownloadStatus(status),
	}

	err := s.q.UpdateTorrentDownloadStatus(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *TorrentDownloadsStorage) SetError(ctx context.Context, id int64, errMsg string) error {
	errValue := sql.NullString{String: errMsg, Valid: errMsg != ""}
	params := torrent_downloads_q.SetTorrentDownloadErrorParams{
		ID:    id,
		Error: errValue,
	}

	err := s.q.SetTorrentDownloadError(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *TorrentDownloadsStorage) SetImportedFiles(ctx context.Context, id int64, importedFiles []string) error {
	if importedFiles == nil {
		importedFiles = []string{}
	}

	raw, err := json.Marshal(importedFiles)
	if err != nil {
		return rerrors.Wrap(err, "marshal imported files")
	}

	params := torrent_downloads_q.SetTorrentDownloadImportedFilesParams{
		ID:            id,
		ImportedFiles: raw,
	}

	err = s.q.SetTorrentDownloadImportedFiles(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *TorrentDownloadsStorage) Delete(ctx context.Context, id int64, userId int64) error {
	params := torrent_downloads_q.DeleteTorrentDownloadParams{
		ID:     id,
		UserID: userId,
	}

	err := s.q.DeleteTorrentDownload(ctx, params)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func toTorrentDownloadDomainList(rows []torrent_downloads_q.TorrentDownload) ([]domain.TorrentDownload, error) {
	downloads := make([]domain.TorrentDownload, 0, len(rows))
	for _, row := range rows {
		dl, err := toTorrentDownloadDomain(row)
		if err != nil {
			return nil, rerrors.Wrap(err)
		}

		downloads = append(downloads, dl)
	}

	return downloads, nil
}

func toTorrentDownloadDomain(row torrent_downloads_q.TorrentDownload) (domain.TorrentDownload, error) {
	importedFiles := []string{}
	if len(row.ImportedFiles) != 0 {
		err := json.Unmarshal(row.ImportedFiles, &importedFiles)
		if err != nil {
			return domain.TorrentDownload{}, rerrors.Wrap(err, "unmarshal imported files")
		}
	}

	dl := domain.TorrentDownload{
		Id:              row.ID,
		UserId:          row.UserID,
		FolderName:      row.FolderName,
		InfoHash:        row.InfoHash,
		TorrentName:     row.TorrentName,
		Status:          domain.TorrentDownloadStatus(row.Status),
		TotalBytes:      row.TotalBytes,
		DownloadedBytes: row.DownloadedBytes,
		ImportedFiles:   importedFiles,
		Error:           row.Error.String,
		CreatedAt:       row.CreatedAt,
		UpdatedAt:       row.UpdatedAt,
	}

	return dl, nil
}
