package pg

import (
	"context"
	"database/sql"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/sqldb"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/search_history_q"
)

type SearchHistoryStorage struct {
	db      sqldb.DB
	querier search_history_q.Querier
}

func NewSearchHistoryStorage(db sqldb.DB) *SearchHistoryStorage {
	return &SearchHistoryStorage{
		db:      db,
		querier: search_history_q.New(db),
	}
}

func (s *SearchHistoryStorage) InsertQuery(ctx context.Context, userId int64, query string) (domain.SearchHistoryEntry, error) {
	params := search_history_q.InsertSearchQueryParams{
		UserID: userId,
		Query:  query,
	}

	row, err := s.querier.InsertSearchQuery(ctx, params)
	if err != nil {
		return domain.SearchHistoryEntry{}, rerrors.Wrap(wrapPgErr(err), "insert search query")
	}

	entry := searchHistoryEntryFromRow(row)

	return entry, nil
}

func (s *SearchHistoryStorage) AttachFinding(ctx context.Context, userId int64, query string, finding domain.SearchHistoryEntry) (bool, error) {
	params := search_history_q.AttachSearchFindingParams{
		FindingType:     toNullString(finding.FindingType),
		FindingID:       toNullString(finding.FindingID),
		FindingName:     toNullString(finding.FindingName),
		FindingCoverUrl: toNullString(finding.FindingCoverUrl),
		UserID:          userId,
		Query:           query,
	}

	rowsAffected, err := s.querier.AttachSearchFinding(ctx, params)
	if err != nil {
		return false, rerrors.Wrap(wrapPgErr(err), "attach search finding")
	}

	return rowsAffected > 0, nil
}

func (s *SearchHistoryStorage) List(ctx context.Context, userId int64) ([]domain.SearchHistoryEntry, error) {
	rows, err := s.querier.ListSearchHistory(ctx, userId)
	if err != nil {
		return nil, rerrors.Wrap(wrapPgErr(err), "list search history")
	}

	entries := make([]domain.SearchHistoryEntry, 0, len(rows))
	for _, row := range rows {
		entry := searchHistoryEntryFromRow(row)
		entries = append(entries, entry)
	}

	return entries, nil
}

func (s *SearchHistoryStorage) Trim(ctx context.Context, userId int64) error {
	err := s.querier.TrimSearchHistory(ctx, userId)
	if err != nil {
		return rerrors.Wrap(wrapPgErr(err), "trim search history")
	}

	return nil
}

func (s *SearchHistoryStorage) WithTx(tx *sql.Tx) storage.SearchHistoryStorage {
	return NewSearchHistoryStorage(tx)
}

func searchHistoryEntryFromRow(row search_history_q.SearchHistory) domain.SearchHistoryEntry {
	entry := domain.SearchHistoryEntry{
		Query:           row.Query,
		FindingType:     row.FindingType.String,
		FindingID:       row.FindingID.String,
		FindingName:     row.FindingName.String,
		FindingCoverUrl: row.FindingCoverUrl.String,
		CreatedAt:       row.CreatedAt,
	}

	return entry
}

func toNullString(s string) sql.NullString {
	nullString := sql.NullString{
		String: s,
		Valid:  s != "",
	}

	return nullString
}
