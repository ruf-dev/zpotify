package pg

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/garbage_collector_q"
)

type GarbageCollectorStorage struct {
	db sqldb.DB
	q  garbage_collector_q.Querier
}

func NewGarbageCollectorStorage(db sqldb.DB) *GarbageCollectorStorage {
	return &GarbageCollectorStorage{
		db: db,
		q:  garbage_collector_q.New(db),
	}
}

func (s *GarbageCollectorStorage) WithTx(tx *sql.Tx) storage.GarbageCollectorStorage {
	return &GarbageCollectorStorage{
		db: &txWrapper{tx},
		q:  garbage_collector_q.New(tx),
	}
}

func (s *GarbageCollectorStorage) Add(ctx context.Context, filePath string) error {
	err := s.q.AddGarbageFile(ctx, filePath)
	if err != nil {
		return rerrors.Wrap(err, "error adding file to garbage collector")
	}
	return nil
}

func (s *GarbageCollectorStorage) Claim(ctx context.Context, limit int32) ([]domain.GarbageFile, error) {
	rows, err := s.q.ClaimGarbageFiles(ctx, limit)
	if err != nil {
		return nil, rerrors.Wrap(err, "error claiming garbage files")
	}

	files := make([]domain.GarbageFile, 0, len(rows))
	for _, row := range rows {
		file := domain.GarbageFile{
			Id:       row.ID,
			FilePath: row.FilePath,
			AddedAt:  row.AddedAt,
		}
		if row.DeletedAt.Valid {
			file.DeletedAt = &row.DeletedAt.Time
		}
		files = append(files, file)
	}

	return files, nil
}

func (s *GarbageCollectorStorage) List(ctx context.Context) ([]domain.GarbageFile, error) {
	rows, err := s.q.ListGarbageFiles(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing garbage files")
	}

	files := make([]domain.GarbageFile, 0, len(rows))
	for _, row := range rows {
		file := domain.GarbageFile{
			Id:       row.ID,
			FilePath: row.FilePath,
			AddedAt:  row.AddedAt,
		}
		if row.DeletedAt.Valid {
			file.DeletedAt = &row.DeletedAt.Time
		}
		files = append(files, file)
	}

	return files, nil
}

func (s *GarbageCollectorStorage) MarkDeleted(ctx context.Context, id int64) error {
	err := s.q.MarkGarbageFileDeleted(ctx, id)
	if err != nil {
		return rerrors.Wrap(err, "error marking garbage file as deleted")
	}
	return nil
}
