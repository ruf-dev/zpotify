package pg

import (
	"context"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	querier "go.zpotify.ru/zpotify/internal/storage/pg/generated"
)

type UserSettingsStorage struct {
	db sqldb.DB

	querier querier.Querier
}

func NewUserSettingsStorage(db sqldb.DB) *UserSettingsStorage {
	return &UserSettingsStorage{
		db:      db,
		querier: querier.New(db),
	}
}

func (u *UserSettingsStorage) GetHomeSegments(ctx context.Context, userId int64) ([]domain.UserHomeSegment, error) {
	segs, err := u.querier.GetHomeSegments(ctx, userId)
	if err != nil {
		return nil, wrapPgErr(err)
	}

	out := make([]domain.UserHomeSegment, 0, len(segs))

	for _, v := range segs {
		out = append(out, domain.UserHomeSegment(v))
	}

	return out, nil
}

func (u *UserSettingsStorage) GetUiSettings(ctx context.Context, userId int64) (domain.UserUiSettings, error) {
	uiSettings, err := u.querier.GetUiSettings(ctx, userId)
	if err != nil {
		return domain.UserUiSettings{}, wrapPgErr(err)
	}

	return domain.UserUiSettings{
		Locale: uiSettings.Locale,
	}, nil
}
