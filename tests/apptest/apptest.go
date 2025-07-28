package apptest

import (
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/app"
)

type TestEnv struct {
	App app.App
}

func NewTestEnv(t *testing.T) (te TestEnv) {
	var err error
	te.App, err = app.New()
	require.NoError(t, err)

	return te
}
