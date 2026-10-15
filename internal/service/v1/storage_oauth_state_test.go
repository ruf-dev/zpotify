package v1

import (
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

func Test_OauthState_ValidRoundTrip(t *testing.T) {
	storageUuid := uuid.New()
	now := time.Now()

	state := signOauthState("key", storageUuid, now)

	got, err := verifyOauthState("key", state, now.Add(time.Minute))
	require.NoError(t, err)
	require.Equal(t, storageUuid, got)
}

func Test_OauthState_ExpiredIsUnauthorized(t *testing.T) {
	now := time.Now()

	state := signOauthState("key", uuid.New(), now)

	_, err := verifyOauthState("key", state, now.Add(oauthStateTtl+time.Minute))
	require.ErrorIs(t, err, service_errors.ErrUnauthorized)
}

func Test_OauthState_TamperedPayloadIsUnauthorized(t *testing.T) {
	now := time.Now()

	state := signOauthState("key", uuid.New(), now)
	other := signOauthState("key", uuid.New(), now)

	otherPayload, _, _ := strings.Cut(other, oauthStateSignatureSeparator)
	_, signature, _ := strings.Cut(state, oauthStateSignatureSeparator)
	forged := otherPayload + oauthStateSignatureSeparator + signature

	_, err := verifyOauthState("key", forged, now)
	require.ErrorIs(t, err, service_errors.ErrUnauthorized)
}

func Test_OauthState_WrongKeyIsUnauthorized(t *testing.T) {
	now := time.Now()

	state := signOauthState("key", uuid.New(), now)

	_, err := verifyOauthState("other", state, now)
	require.ErrorIs(t, err, service_errors.ErrUnauthorized)
}

func Test_OauthState_GarbageIsUnauthorized(t *testing.T) {
	cases := []string{"", "no-separator", "a.b", "!!!.???"}

	for _, state := range cases {
		t.Run(state, func(t *testing.T) {
			_, err := verifyOauthState("key", state, time.Now())
			require.ErrorIs(t, err, service_errors.ErrUnauthorized)
		})
	}
}
