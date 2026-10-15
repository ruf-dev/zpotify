package pg

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/storages_q"
)

type StoragesStorage struct {
	q storages_q.Querier
}

func NewStoragesStorage(db sqldb.DB) *StoragesStorage {
	return &StoragesStorage{q: storages_q.New(db)}
}

func (s *StoragesStorage) List(ctx context.Context) ([]storage.StorageRow, error) {
	rows, err := s.q.ListStorages(ctx)
	if err != nil {
		return nil, rerrors.Wrap(wrapPgErr(err), "error listing storages")
	}

	out := make([]storage.StorageRow, 0, len(rows))
	for _, row := range rows {
		out = append(out, toStorageRow(
			row.ID, row.Name, row.Kind, row.ConfigEnc, row.IsDefault, row.OwnerUserID, row.QuotaBytes, row.UsedBytes,
		))
	}

	return out, nil
}

func (s *StoragesStorage) Get(ctx context.Context, id uuid.UUID) (sql.Null[storage.StorageRow], error) {
	row, err := s.q.GetStorageById(ctx, id)
	if errors.Is(err, sql.ErrNoRows) {
		return sql.Null[storage.StorageRow]{}, nil
	}
	if err != nil {
		return sql.Null[storage.StorageRow]{}, rerrors.Wrap(wrapPgErr(err), "error getting storage")
	}

	storageRow := toStorageRow(row.ID, row.Name, row.Kind, row.ConfigEnc, row.IsDefault, row.OwnerUserID, row.QuotaBytes, 0)

	return sql.Null[storage.StorageRow]{V: storageRow, Valid: true}, nil
}

func (s *StoragesStorage) GetDefault(ctx context.Context) (storage.StorageRow, error) {
	row, err := s.q.GetDefaultStorage(ctx)
	if err != nil {
		return storage.StorageRow{}, rerrors.Wrap(wrapPgErr(err), "error getting default storage")
	}

	return toStorageRow(row.ID, row.Name, row.Kind, row.ConfigEnc, row.IsDefault, row.OwnerUserID, row.QuotaBytes, 0), nil
}

func (s *StoragesStorage) Create(
	ctx context.Context,
	name string,
	kind domain.StorageKind,
	configEnc []byte,
) (storage.StorageRow, error) {
	params := storages_q.CreateStorageParams{
		Name:      name,
		Kind:      storages_q.StorageKind(kind),
		ConfigEnc: configEnc,
	}

	row, err := s.q.CreateStorage(ctx, params)
	if err != nil {
		return storage.StorageRow{}, rerrors.Wrap(wrapPgErr(err), "error creating storage")
	}

	return toStorageRow(row.ID, row.Name, row.Kind, row.ConfigEnc, row.IsDefault, row.OwnerUserID, row.QuotaBytes, 0), nil
}

func (s *StoragesStorage) Update(ctx context.Context, id uuid.UUID, name string, configEnc []byte) error {
	params := storages_q.UpdateStorageParams{
		ID:        id,
		Name:      name,
		ConfigEnc: configEnc,
	}

	err := s.q.UpdateStorage(ctx, params)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error updating storage")
	}

	return nil
}

func (s *StoragesStorage) Delete(ctx context.Context, id uuid.UUID) error {
	err := s.q.DeleteStorageById(ctx, id)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error deleting storage")
	}

	return nil
}

func (s *StoragesStorage) SetDefault(ctx context.Context, id uuid.UUID) error {
	err := s.q.ClearDefaultStorage(ctx)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error clearing default storage")
	}

	err = s.q.SetDefaultStorageById(ctx, id)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "error setting default storage")
	}

	return nil
}

func (s *StoragesStorage) CountFiles(ctx context.Context, id uuid.UUID) (int64, error) {
	count, err := s.q.CountFilesByStorage(ctx, id)
	if err != nil {
		return 0, rerrors.Wrap(wrapPgErr(err), "error counting storage files")
	}

	return count, nil
}

func (s *StoragesStorage) GetUsedBytes(ctx context.Context, id uuid.UUID) (int64, error) {
	used, err := s.q.GetStorageUsageBytes(ctx, id)
	if err != nil {
		return 0, rerrors.Wrap(wrapPgErr(err), "error getting storage usage")
	}

	return used, nil
}

func (s *StoragesStorage) WithTx(tx *sql.Tx) storage.StoragesStorage {
	return NewStoragesStorage(tx)
}

func toStorageRow(
	id uuid.UUID,
	name string,
	kind storages_q.StorageKind,
	configEnc []byte,
	isDefault bool,
	ownerUserId sql.NullInt64,
	quotaBytes sql.NullInt64,
	usedBytes int64,
) storage.StorageRow {
	row := storage.StorageRow{
		Uuid:      id,
		Name:      name,
		Kind:      domain.StorageKind(kind),
		ConfigEnc: configEnc,
		IsDefault: isDefault,
		UsedBytes: usedBytes,
	}

	if ownerUserId.Valid {
		row.OwnerUserId = &ownerUserId.Int64
	}
	if quotaBytes.Valid {
		row.QuotaBytes = &quotaBytes.Int64
	}

	return row
}
