package tests

import (
	"context"
	"database/sql"
	"net/http"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/require"
	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox/closer"

	"go.zpotify.ru/zpotify/internal/app"
)

const (
	readyTimeout     = 30 * time.Second
	readyPollPeriod  = 100 * time.Millisecond
	shutdownTimeout  = 30 * time.Second
	sessionLifetime  = 24 * time.Hour
	maxPendingTracks = 100
)

type TestEnv struct {
	App     *app.App
	BaseUrl string
	Db      *sql.DB
}

var (
	sharedOnce     sync.Once
	sharedEnv      *TestEnv
	errSharedStart error

	appDoneC chan struct{}
)

func TestMain(m *testing.M) {
	code := m.Run()

	stopSharedApp()

	os.Exit(code)
}

// NewTestEnv returns the one app instance shared by every test in the package: the app binds a
// fixed port and runs migrations, so it is started once and torn down in TestMain.
func NewTestEnv(t *testing.T) *TestEnv {
	t.Helper()

	sharedOnce.Do(func() {
		sharedEnv, errSharedStart = startSharedApp()
	})
	require.NoError(t, errSharedStart)

	return sharedEnv
}

func startSharedApp() (*TestEnv, error) {
	application, err := app.New()
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating app")
	}

	te := &TestEnv{
		App:     &application,
		BaseUrl: "http://localhost:" + application.Cfg.Servers.MASTER.Port,
	}

	appDoneC = make(chan struct{})
	go runApp(te.App)

	err = waitReady(te.BaseUrl + "/readyz")
	if err != nil {
		return nil, rerrors.Wrap(err, "error waiting for app readiness")
	}

	te.Db, err = sql.Open("postgres", application.Cfg.DataSources.Postgres.ConnectionString())
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening postgres connection")
	}

	return te, nil
}

func runApp(application *app.App) {
	defer close(appDoneC)

	err := application.Start()
	if err != nil {
		log.Err(err).Msg("test app stopped with error")
	}
}

func waitReady(readyUrl string) error {
	ctx, cancel := context.WithTimeout(context.Background(), readyTimeout)
	defer cancel()

	for {
		request, err := http.NewRequestWithContext(ctx, http.MethodGet, readyUrl, nil)
		if err != nil {
			return rerrors.Wrap(err, "error building readiness request")
		}

		response, err := http.DefaultClient.Do(request)
		if err == nil {
			_ = response.Body.Close()
			if response.StatusCode == http.StatusOK {
				return nil
			}
		}

		select {
		case <-ctx.Done():
			return rerrors.Wrap(ctx.Err(), "app did not become ready in time")
		case <-appDoneC:
			return rerrors.New("app stopped before becoming ready")
		case <-time.After(readyPollPeriod):
		}
	}
}

func stopSharedApp() {
	if sharedEnv == nil {
		return
	}

	if sharedEnv.Db != nil {
		_ = sharedEnv.Db.Close()
	}

	err := closer.Close()
	if err != nil {
		log.Err(err).Msg("error closing test app")
	}

	select {
	case <-appDoneC:
	case <-time.After(shutdownTimeout):
		log.Warn().Msg("test app did not stop in time")
	}
}

// CreateAdminUser inserts a user with every permission, including is_administrator, and a live session.
func (te *TestEnv) CreateAdminUser(t *testing.T) (userId int64, accessToken string) {
	t.Helper()

	return te.createUser(t, true)
}

// CreateRegularUser inserts a user with upload permissions but without is_administrator, and a live session.
func (te *TestEnv) CreateRegularUser(t *testing.T) (userId int64, accessToken string) {
	t.Helper()

	return te.createUser(t, false)
}

func (te *TestEnv) createUser(t *testing.T, isAdministrator bool) (userId int64, accessToken string) {
	t.Helper()

	ctx := context.Background()

	username := "e2e-" + uuid.NewString()
	err := te.Db.QueryRowContext(ctx,
		`INSERT INTO users (username) VALUES ($1) RETURNING id`,
		username,
	).Scan(&userId)
	require.NoError(t, err)

	_, err = te.Db.ExecContext(ctx,
		`INSERT INTO user_settings (user_id) VALUES ($1)`,
		userId,
	)
	require.NoError(t, err)

	_, err = te.Db.ExecContext(ctx,
		`INSERT INTO user_permissions
		     (user_id, can_upload, early_access, can_create_playlist, max_pending_tracks, is_administrator)
		 VALUES ($1, $4, $4, $4, $2, $3)`,
		userId, maxPendingTracks, isAdministrator, true,
	)
	require.NoError(t, err)

	accessToken = uuid.NewString()
	refreshToken := uuid.NewString()
	now := time.Now().UTC()
	accessExpireAt := now.Add(sessionLifetime)
	refreshExpireAt := now.Add(2 * sessionLifetime)

	_, err = te.Db.ExecContext(ctx,
		`INSERT INTO user_sessions (user_id, access_token, refresh_token, access_expire_at, refresh_expire_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		userId, accessToken, refreshToken, accessExpireAt, refreshExpireAt,
	)
	require.NoError(t, err)

	return userId, accessToken
}
