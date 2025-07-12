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
			   (tg_unique_id, tg_file_id, added_by_tg_id, title, author)
		VALUES (          $1,         $2,             $3,    $4,     $5)
`, req.TgUniqueId, req.TgFileId, req.AddedByTgId, req.Title, req.Author)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error saving file meta")
	}

	return nil
}
