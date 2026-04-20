package pg

import (
	"context"
	"database/sql"
	"time"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type FileMetaStorage struct {
	db sqldb.DB
	q  querier.Querier
}

func NewFileMetaStorage(db sqldb.DB) *FileMetaStorage {
	return &FileMetaStorage{
		db: db,
		q:  querier.New(db),
	}
}

func (s *FileMetaStorage) Add(ctx context.Context, req domain.FileMeta) (int64, error) {
	params := querier.CreateFileParams{
		FilePath:    req.FilePath,
		DurationSec: int64(req.Duration.Seconds()),
		AddedByID:   req.AddedById,
		SizeBytes:   req.SizeBytes,
		Verified:    req.Verified,
	}

	id, err := s.q.CreateFile(ctx, params)
	if err != nil {
		return 0, wrapPgErr(err)
	}

	return id, nil
}

func (s *FileMetaStorage) Get(ctx context.Context, fileId int64) (file domain.FileMeta, err error) {
	fileDb, err := s.q.GetFileById(ctx, fileId)
	if err != nil {
		return domain.FileMeta{}, err
	}

	return toFileDomain(fileDb), nil
}
func (s *FileMetaStorage) GetBySongId(ctx context.Context, songId int32) (domain.FileMeta, error) {
	fileDb, err := s.q.GetFileBySongId(ctx, int64(songId))
	if err != nil {
		return domain.FileMeta{}, err
	}

	return toFileDomain(fileDb), nil
}

func (s *FileMetaStorage) List(ctx context.Context, listReq domain.ListFileMeta) ([]domain.FileMeta, error) {
	//TODO
	//builder := sq.Select(`
	//		tg_unique_id,
	//		tg_file_id,
	//		tg_file_path,
	//		added_by_tg_id,
	//		COALESCE(size_bytes, 0)`).
	//	From("files_meta").
	//	Offset(listReq.Offset).
	//	PlaceholderFormat(sq.Dollar)
	//
	//if listReq.Limit != 0 {
	//	builder = builder.Limit(listReq.Limit)
	//}
	//
	//if listReq.NoSizeBytesFilter {
	//	builder = builder.Where(sq.Eq{"size_bytes": nil})
	//}
	//
	//query, args, err := builder.ToSql()
	//if err != nil {
	//	return nil, rerrors.Wrap(err)
	//}
	//
	//rowScanner, err := s.db.QueryContext(ctx, query, args...)
	//if err != nil {
	//	return nil, wrapPgErr(err)
	//}
	//
	//defer rowScanner.Close()
	//
	files := make([]domain.FileMeta, 0, listReq.Limit)
	//
	//for rowScanner.Next() {
	//	file, err := s.scan(rowScanner)
	//	if err != nil {
	//		return nil, wrapPgErr(err)
	//	}
	//
	//	files = append(files, file)
	//}

	return files, nil

}

func (s *FileMetaStorage) Delete(ctx context.Context, fileId int64) error {
	err := s.q.DeleteFileById(ctx, fileId)
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *FileMetaStorage) Update(ctx context.Context, fileId int64, file domain.File) error {
	err := s.q.UpdateFile(ctx, querier.UpdateFileParams{
		ID:          fileId,
		DurationSec: int64(file.Duration.Seconds()),
		SizeBytes:   file.SizeBytes,
		Verified:    file.Verified,
	})
	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

//func (s *FileMetaStorage) scan(rs scanner) (file domain.FileMeta, err error) {
//	return file, rs.Scan(
//		&file.UniqueFileId,
//		&file.FileId,
//		&file.FilePath,
//		&file.AddedByTgId,
//		&file.SizeBytes,
//	)
//}

func toFileDomain(f querier.FilesMetum) domain.FileMeta {
	return domain.FileMeta{
		File: domain.File{
			FilePath:  f.FilePath,
			SizeBytes: int64(f.SizeBytes),
			Duration:  time.Duration(f.DurationSec) * time.Second,
			Verified:  f.Verified,
		},
		AddedById: int64(f.AddedByID),
	}
}

func (s *FileMetaStorage) WithTx(tx *sql.Tx) storage.FileMetaStorage {
	return &FileMetaStorage{
		db: tx,
		q:  querier.New(tx),
	}
}
