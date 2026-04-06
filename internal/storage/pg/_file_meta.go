package pg

import (
	"context"
	"database/sql"

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

func (s *FileMetaStorage) Add(ctx context.Context, req domain.FileMeta) error {
	return nil
}

func (s *FileMetaStorage) Upsert(ctx context.Context, req domain.FileMeta) error {
	return nil
}

func (s *FileMetaStorage) Get(ctx context.Context, fileId int64) (file domain.FileMeta, err error) {
	fileDb, err := s.q.GetFileById(ctx, int32(fileId))
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
	err := s.q.DeleteFileById(ctx, int32(fileId))
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

func (s *FileMetaStorage) WithTx(tx *sql.Tx) storage.FileMetaStorage {
	return NewFileMetaStorage(tx)
}

func toFileDomain(f querier.FilesMetum) domain.FileMeta {
	return domain.FileMeta{
		File: domain.File{
			FilePath:  f.FilePath,
			SizeBytes: int64(f.SizeBytes),
		},
		AddedByTgId: int64(f.AddedByID),
	}
}
