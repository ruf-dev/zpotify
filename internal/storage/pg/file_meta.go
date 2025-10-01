package pg

import (
	"context"
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

type FileMetaStorage struct {
	db sqldb.DB
}

func NewFileMetaStorage(db sqldb.DB) *FileMetaStorage {
	return &FileMetaStorage{
		db: db,
	}
}

func (s *FileMetaStorage) Add(ctx context.Context, req domain.FileMeta) error {
	return s.insert(ctx, insertFileMeta{FileMeta: req})
}

func (s *FileMetaStorage) Upsert(ctx context.Context, req domain.FileMeta) error {
	r := insertFileMeta{
		FileMeta:         req,
		onConflictUpdate: true,
	}
	return s.insert(ctx, r)
}

type insertFileMeta struct {
	domain.FileMeta
	onConflictUpdate bool
}

func (s *FileMetaStorage) insert(ctx context.Context, req insertFileMeta) error {
	base := `	
		INSERT INTO files_meta 
			   (tg_unique_id, tg_file_id, tg_file_path, added_by_tg_id, size_bytes)
		VALUES (          $1,         $2,           $3,             $4,         $5)`

	if req.onConflictUpdate {
		base += `
		ON CONFLICT (tg_unique_id) DO UPDATE SET  
			tg_file_id     = excluded.tg_file_id,
			tg_file_path   = excluded.tg_file_path,
			added_by_tg_id = excluded.added_by_tg_id,
			size_bytes     = excluded.size_bytes
`
	}

	_, err := s.db.ExecContext(ctx, base,
		req.UniqueFileId, req.FileId, req.FilePath, req.AddedByTgId, req.SizeBytes)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error saving file meta")
	}

	return nil
}

func (s *FileMetaStorage) Get(ctx context.Context, uniqueFileId string) (file domain.FileMeta, err error) {
	rowScanner := s.db.QueryRowContext(ctx, `
		SELECT
		    tg_unique_id,
			tg_file_id,
			tg_file_path,
			added_by_tg_id, 
			COALESCE(size_bytes, 0)
		FROM files_meta
		WHERE tg_unique_id = $1`, uniqueFileId)

	file, err = s.scan(rowScanner)
	if err != nil {
		return domain.FileMeta{}, wrapPgErr(rerrors.Wrap(err, "error getting file from storage"))
	}

	return file, nil
}

func (s *FileMetaStorage) List(ctx context.Context, listReq domain.ListFileMeta) ([]domain.FileMeta, error) {
	builder := sq.Select(`
			tg_unique_id,
			tg_file_id,
			tg_file_path,
			added_by_tg_id, 
			COALESCE(size_bytes, 0)`).
		From("files_meta").
		Offset(listReq.Offset).
		PlaceholderFormat(sq.Dollar)

	if listReq.Limit != 0 {
		builder = builder.Limit(listReq.Limit)
	}

	if listReq.NoSizeBytesFilter {
		builder = builder.Where(sq.Eq{"size_bytes": nil})
	}

	query, args, err := builder.ToSql()
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	rowScanner, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	defer rowScanner.Close()

	files := make([]domain.FileMeta, 0, listReq.Limit)

	for rowScanner.Next() {
		file, err := s.scan(rowScanner)
		if err != nil {
			return nil, wrapPgErr(err)
		}

		files = append(files, file)
	}

	return files, nil

}

func (s *FileMetaStorage) Delete(ctx context.Context, uniqueFileId string) error {
	_, err := s.db.ExecContext(ctx, `
			DELETE FROM files_meta
			WHERE tg_unique_id = $1`, uniqueFileId)

	if err != nil {
		return wrapPgErr(err)
	}

	return nil
}

func (s *FileMetaStorage) scan(rs scanner) (file domain.FileMeta, err error) {
	return file, rs.Scan(
		&file.UniqueFileId,
		&file.FileId,
		&file.FilePath,
		&file.AddedByTgId,
		&file.SizeBytes,
	)
}

func (s *FileMetaStorage) WithTx(tx *sql.Tx) storage.FileMetaStorage {
	return NewFileMetaStorage(tx)
}
