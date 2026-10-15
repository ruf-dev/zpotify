package storage_config_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage/storage_config"
	"go.zpotify.ru/zpotify/internal/utils/secretbox"
)

func Test_StorageConfig_RoundTrip(t *testing.T) {
	cases := []struct {
		name string
		cfg  domain.StorageConfig
	}{
		{
			name: "s3",
			cfg: domain.StorageConfig{S3: &domain.S3Config{
				Endpoint:        "https://s3.example.com",
				Region:          "eu",
				Bucket:          "music",
				AccessKeyId:     "ak",
				SecretAccessKey: "sk",
				IsPathStyle:     true,
			}},
		},
		{
			name: "webdav",
			cfg: domain.StorageConfig{Webdav: &domain.WebdavConfig{
				Url:      "https://dav.example.com",
				Username: "user",
				Password: "pass",
				RootPath: "/zpotify",
			}},
		},
		{
			name: "google drive keeps refresh token",
			cfg: domain.StorageConfig{GoogleDrive: &domain.GoogleDriveConfig{
				ClientId:     "cid",
				ClientSecret: "csecret",
				RootFolderId: "folder",
				RefreshToken: "refresh",
			}},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			blob, err := storage_config.Encode("key", tc.cfg)
			require.NoError(t, err)

			got, err := storage_config.Decode("key", blob)
			require.NoError(t, err)
			require.Equal(t, tc.cfg, got)
		})
	}
}

func Test_StorageConfig_EmptyBlobDecodesWithoutKey(t *testing.T) {
	got, err := storage_config.Decode("", nil)
	require.NoError(t, err)
	require.Equal(t, domain.StorageConfig{}, got)
}

func Test_StorageConfig_WrongKeyFails(t *testing.T) {
	cfg := domain.StorageConfig{Webdav: &domain.WebdavConfig{Url: "u"}}

	blob, err := storage_config.Encode("key", cfg)
	require.NoError(t, err)

	_, err = storage_config.Decode("other", blob)
	require.ErrorIs(t, err, secretbox.ErrCorrupted)
}
