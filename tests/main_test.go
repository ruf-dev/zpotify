package tests

import (
	"os"
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
	var err error
	te.App, err = app.New()
	require.NoError(t, err)

	return te
}
