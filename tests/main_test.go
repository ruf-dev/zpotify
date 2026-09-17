package tests

import (
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/app"
)

type TestEnv struct {
	App app.App
}

func TestMain(m *testing.M) {
	code := m.Run()

	os.Exit(code)
}

func NewTestEnv(t *testing.T) (te TestEnv) {
	t.Helper()

	var err error
	te.App, err = app.New()
	if err != nil && strings.Contains(err.Error(), "tg bot connection") {
		t.Skip("skipping: no telegram bot credentials configured in this environment")
	}
	require.NoError(t, err)

	return te
}
