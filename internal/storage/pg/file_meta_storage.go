package pg

import (
	"context"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
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
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO files_meta 
			   (tg_unique_id, tg_file_id, tg_file_path, added_by_tg_id, title, author)
		VALUES (          $1,         $2,           $3,             $4,    $5,     $6)
`, req.UniqueFileId, req.FileId, req.FilePath, req.AddedByTgId, req.Title, req.Author)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error saving file meta")
	}

	return nil
}

func (s *FileMetaStorage) Get(ctx context.Context, uniqueFileId string) (file domain.FileMeta, err error) {
	err = s.db.QueryRowContext(ctx, `
		SELECT
		    tg_unique_id,
			tg_file_id,
			tg_file_path,
			added_by_tg_id,
			title,
			author
		FROM files_meta
		WHERE tg_unique_id = $1`, uniqueFileId).
		Scan(
			&file.UniqueFileId,
			&file.FileId,
			&file.FilePath,
			&file.AddedByTgId,
			&file.Title,
			&file.Author,
		)
	if err != nil {
		return domain.FileMeta{}, wrapPgErr(rerrors.Wrap(err, "error getting file from storage"))
	}

	return file, nil
}
