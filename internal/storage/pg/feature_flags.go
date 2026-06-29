package pg

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/feature_flags_q"
)

type FeatureFlagsStorage struct {
	db sqldb.DB
}

func NewFeatureFlagsStorage(db sqldb.DB) *FeatureFlagsStorage {
	return &FeatureFlagsStorage{db: db}
}

func (s *FeatureFlagsStorage) GetAll(ctx context.Context) ([]domain.FeatureFlag, error) {
	q := feature_flags_q.New(s.db)

	rows, err := q.GetAllFeatureFlags(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	flags := make([]domain.FeatureFlag, 0, len(rows))
	for _, row := range rows {
		flag := domain.FeatureFlag{
			ID:        string(row.ID),
			IsEnabled: row.IsEnabled,
			Value:     row.Value,
		}
		flags = append(flags, flag)
	}

	return flags, nil
}

func (s *FeatureFlagsStorage) WithTx(tx *sql.Tx) storage.FeatureFlagsStorage {
	return NewFeatureFlagsStorage(tx)
}
