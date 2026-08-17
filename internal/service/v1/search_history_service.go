package v1

import (
	"context"
	"database/sql"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type SearchHistoryService struct {
	searchHistoryStorage storage.SearchHistoryStorage

	txManager *tx_manager.TxManager
}

func NewSearchHistoryService(dataStorage storage.Storage) *SearchHistoryService {
	return &SearchHistoryService{
		searchHistoryStorage: dataStorage.SearchHistory(),
		txManager:            dataStorage.TxManager(),
	}
}

// RecordQuery records a new search query for the caller and trims their
// history back down to the 5 most-recent entries, atomically.
func (s *SearchHistoryService) RecordQuery(ctx context.Context, query string) error {
	userId, err := s.currentUserId(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	query = strings.TrimSpace(query)
	if query == "" {
		return rerrors.Wrap(service_errors.ErrEmptySearchQuery)
	}

	err = s.txManager.Execute(
		func(tx *sql.Tx) error {
			return s.recordQueryTx(ctx, s.searchHistoryStorage.WithTx(tx), userId, query)
		})
	if err != nil {
		return rerrors.Wrap(err, "error recording search query")
	}

	return nil
}

// recordQueryTx inserts the query and trims history through the given
// (already tx-scoped) storage. Split out of RecordQuery so the
// insert+trim orchestration can be unit tested without a real
// transaction/DB.
func (s *SearchHistoryService) recordQueryTx(ctx context.Context, searchHistoryStorage storage.SearchHistoryStorage, userId int64, query string) error {
	_, err := searchHistoryStorage.InsertQuery(ctx, userId, query)
	if err != nil {
		return rerrors.Wrap(err, "error inserting search query")
	}

	err = searchHistoryStorage.Trim(ctx, userId)
	if err != nil {
		return rerrors.Wrap(err, "error trimming search history")
	}

	return nil
}

// RecordFinding attaches a finding (the item clicked after a search) to the
// caller's most-recent matching query entry. If no matching entry exists, it
// falls back to inserting a new entry with the finding already populated.
// Trims history back down to the 5 most-recent entries, atomically.
func (s *SearchHistoryService) RecordFinding(ctx context.Context, query string, finding domain.SearchHistoryEntry) error {
	userId, err := s.currentUserId(ctx)
	if err != nil {
		return rerrors.Wrap(err)
	}

	query = strings.TrimSpace(query)
	if query == "" {
		return rerrors.Wrap(service_errors.ErrEmptySearchQuery)
	}

	err = s.txManager.Execute(
		func(tx *sql.Tx) error {
			return s.recordFindingTx(ctx, s.searchHistoryStorage.WithTx(tx), userId, query, finding)
		})
	if err != nil {
		return rerrors.Wrap(err, "error recording search finding")
	}

	return nil
}

// recordFindingTx attaches the finding to the most-recent matching row,
// falling back to inserting a new row when none matched, then trims
// history - all through the given (already tx-scoped) storage. Split out of
// RecordFinding so the attach/fallback/trim orchestration can be unit
// tested without a real transaction/DB.
func (s *SearchHistoryService) recordFindingTx(
	ctx context.Context,
	searchHistoryStorage storage.SearchHistoryStorage,
	userId int64,
	query string,
	finding domain.SearchHistoryEntry,
) error {
	matched, err := searchHistoryStorage.AttachFinding(ctx, userId, query, finding)
	if err != nil {
		return rerrors.Wrap(err, "error attaching search finding")
	}

	if !matched {
		finding.Query = query

		_, err = searchHistoryStorage.InsertQuery(ctx, userId, query)
		if err != nil {
			return rerrors.Wrap(err, "error inserting fallback search query")
		}

		_, err = searchHistoryStorage.AttachFinding(ctx, userId, query, finding)
		if err != nil {
			return rerrors.Wrap(err, "error attaching search finding to fallback query")
		}
	}

	err = searchHistoryStorage.Trim(ctx, userId)
	if err != nil {
		return rerrors.Wrap(err, "error trimming search history")
	}

	return nil
}

// List returns up to the 5 most-recent search history entries for the
// caller, newest first.
func (s *SearchHistoryService) List(ctx context.Context) ([]domain.SearchHistoryEntry, error) {
	userId, err := s.currentUserId(ctx)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	entries, err := s.searchHistoryStorage.List(ctx, userId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing search history from storage")
	}

	return entries, nil
}

// currentUserId reads the caller's user id from context. Shared by every
// caller-scoped method above.
func (s *SearchHistoryService) currentUserId(ctx context.Context) (int64, error) {
	uc, ok := user_context.GetUserContext(ctx)
	if !ok {
		return 0, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	return uc.UserId, nil
}
