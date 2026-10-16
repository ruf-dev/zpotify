package tests

import (
	"context"
	"database/sql"
	"os"
	"path/filepath"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/config"
	"go.zpotify.ru/zpotify/internal/utils"
)

const (
	e2eConfigPath = "./config/config.yaml"
	e2eDbName     = "zpotify_e2e"
	gitKeepName   = ".gitkeep"
)

var errNotE2eDatabase = rerrors.New("e2e config must point at the " + e2eDbName + " database")

// requireE2eDatabase stops the run before the app migrates anything, so a misconfigured e2e
// config can never write into the dev database.
func requireE2eDatabase() error {
	cfg, err := config.Load(e2eConfigPath)
	if err != nil {
		return rerrors.Wrap(err, "error loading e2e config")
	}

	if cfg.DataSources.Postgres.DbName != e2eDbName {
		return rerrors.Wrap(errNotE2eDatabase)
	}

	return nil
}

// resetE2eState leaves the e2e database empty and the local storage directory without test
// media, so every run starts from migrations on a clean slate.
func resetE2eState(connectionString, localStoragePath string) {
	err := resetE2eDatabase(connectionString)
	if err != nil {
		log.Err(err).Msg("error resetting e2e database")
	}

	err = clearLocalStorage(localStoragePath)
	if err != nil {
		log.Err(err).Msg("error clearing e2e local storage")
	}
}

func resetE2eDatabase(connectionString string) error {
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return rerrors.Wrap(err, "error opening postgres connection")
	}
	defer utils.CloseWithLog(db, "e2e database")

	ctx := context.Background()

	_, err = db.ExecContext(ctx, `DROP SCHEMA public CASCADE`)
	if err != nil {
		return rerrors.Wrap(err, "error dropping public schema")
	}

	_, err = db.ExecContext(ctx, `CREATE SCHEMA public`)
	if err != nil {
		return rerrors.Wrap(err, "error creating public schema")
	}

	return nil
}

func clearLocalStorage(path string) error {
	entries, err := os.ReadDir(path)
	if err != nil {
		return rerrors.Wrap(err, "error reading local storage directory")
	}

	for _, entry := range entries {
		if entry.Name() == gitKeepName {
			continue
		}

		err = os.RemoveAll(filepath.Join(path, entry.Name()))
		if err != nil {
			return rerrors.Wrap(err, "error removing "+entry.Name())
		}
	}

	return nil
}
