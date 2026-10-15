package secretbox_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/utils/secretbox"
)

func Test_Secretbox_RoundTrip(t *testing.T) {
	plain := []byte("top secret payload")

	blob, err := secretbox.Encrypt("key", plain)
	require.NoError(t, err)
	require.NotEqual(t, plain, blob)

	got, err := secretbox.Decrypt("key", blob)
	require.NoError(t, err)
	require.Equal(t, plain, got)
}

func Test_Secretbox_EncryptUsesFreshNonce(t *testing.T) {
	first, err := secretbox.Encrypt("key", []byte("same"))
	require.NoError(t, err)

	second, err := secretbox.Encrypt("key", []byte("same"))
	require.NoError(t, err)

	require.NotEqual(t, first, second)
}

func Test_Secretbox_TamperedBlobIsCorrupted(t *testing.T) {
	blob, err := secretbox.Encrypt("key", []byte("payload"))
	require.NoError(t, err)

	blob[len(blob)-1] ^= 0xff

	_, err = secretbox.Decrypt("key", blob)
	require.ErrorIs(t, err, secretbox.ErrCorrupted)
}

func Test_Secretbox_ShortBlobIsCorrupted(t *testing.T) {
	_, err := secretbox.Decrypt("key", []byte{1, 2, 3})
	require.ErrorIs(t, err, secretbox.ErrCorrupted)
}

func Test_Secretbox_WrongKeyIsCorrupted(t *testing.T) {
	blob, err := secretbox.Encrypt("key", []byte("payload"))
	require.NoError(t, err)

	_, err = secretbox.Decrypt("other", blob)
	require.ErrorIs(t, err, secretbox.ErrCorrupted)
}

func Test_Secretbox_EmptyKeyIsMissing(t *testing.T) {
	_, err := secretbox.Encrypt("", []byte("payload"))
	require.ErrorIs(t, err, secretbox.ErrKeyMissing)

	_, err = secretbox.Decrypt("", []byte("payload"))
	require.ErrorIs(t, err, secretbox.ErrKeyMissing)
}
