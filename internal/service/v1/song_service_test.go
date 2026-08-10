package v1

import (
	"context"
	"database/sql"
	"errors"
	"io"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	tgclient "go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
)

// fakeTelegramIdentityStorage is an in-memory test double for
// storage.TelegramIdentityStorage. Only GetByUserId is exercised by
// AudioService.SendToTelegram tests.
type fakeTelegramIdentityStorage struct {
	getByUserIdFn func(ctx context.Context, userId int64) (domain.TelegramIdentity, error)
}

func (f *fakeTelegramIdentityStorage) WithTx(_ *sql.Tx) storage.TelegramIdentityStorage {
	return f
}

func (f *fakeTelegramIdentityStorage) Upsert(_ context.Context, _ int64, _ int64, _ string) (int64, error) {
	return 0, nil
}

func (f *fakeTelegramIdentityStorage) GetByTgId(_ context.Context, _ int64) (domain.TelegramIdentity, error) {
	return domain.TelegramIdentity{}, nil
}

func (f *fakeTelegramIdentityStorage) GetByTgIdTx(_ context.Context, _ int64) (sql.Null[domain.TelegramIdentity], error) {
	return sql.Null[domain.TelegramIdentity]{}, nil
}

func (f *fakeTelegramIdentityStorage) GetByUserId(ctx context.Context, userId int64) (domain.TelegramIdentity, error) {
	if f.getByUserIdFn == nil {
		return domain.TelegramIdentity{}, nil
	}
	return f.getByUserIdFn(ctx, userId)
}

// fakeTelegramSender is an in-memory test double for the TelegramSender
// interface consumed by AudioService. It captures the arguments of the last
// SendTrack call for assertions.
type fakeTelegramSender struct {
	sendTrackFn func(chatId int64, audio tgclient.TrackAudio) error

	calledChatId int64
	calledAudio  tgclient.TrackAudio
	callCount    int
}

func (f *fakeTelegramSender) SendTrack(chatId int64, audio tgclient.TrackAudio) error {
	f.callCount++
	f.calledChatId = chatId
	f.calledAudio = audio

	if f.sendTrackFn == nil {
		return nil
	}
	return f.sendTrackFn(chatId, audio)
}

// fakeReadCloser is a pointer-identity-preserving io.ReadCloser test double,
// used so tests can assert the exact reader instance was passed through
// unchanged (assert.Same requires pointer types).
type fakeReadCloser struct {
	io.Reader
}

func (f *fakeReadCloser) Close() error {
	return nil
}

// fakeBinaryFileStorage is an in-memory test double for
// storage.BinaryFileStorage. Only GetFile is exercised by AudioService
// tests.
type fakeBinaryFileStorage struct {
	getFileFn func(ctx context.Context, path string) (io.ReadCloser, error)
}

func (f *fakeBinaryFileStorage) SaveToTempFolder(_ context.Context, _ int64, _ string, _ io.Reader) (string, error) {
	return "", nil
}

func (f *fakeBinaryFileStorage) ListFiles(_ context.Context, _ int64) ([]string, error) {
	return nil, nil
}

func (f *fakeBinaryFileStorage) Move(_ context.Context, _ string, _ string) error {
	return nil
}

func (f *fakeBinaryFileStorage) Copy(_ context.Context, _ string, _ string) error {
	return nil
}

func (f *fakeBinaryFileStorage) Delete(_ context.Context, _ string) error {
	return nil
}

func (f *fakeBinaryFileStorage) GetFile(ctx context.Context, path string) (io.ReadCloser, error) {
	if f.getFileFn == nil {
		return io.NopCloser(strings.NewReader("")), nil
	}
	return f.getFileFn(ctx, path)
}

func (f *fakeBinaryFileStorage) DeleteTempFile(_ context.Context, _ string) error {
	return nil
}

func TestAudioService_SendToTelegram_NoUserContext(t *testing.T) {
	sender := &fakeTelegramSender{}
	svc := &AudioService{
		telegramSender: sender,
	}

	err := svc.SendToTelegram(context.Background(), 1)
	require.Error(t, err, "expected an error when no user context is present")
	assert.Equal(t, 0, sender.callCount, "SendTrack must not be called without an authenticated user")
}

func TestAudioService_SendToTelegram_TelegramNotLinked(t *testing.T) {
	identityStorage := &fakeTelegramIdentityStorage{
		getByUserIdFn: func(_ context.Context, _ int64) (domain.TelegramIdentity, error) {
			return domain.TelegramIdentity{}, storage.ErrNotFound
		},
	}
	sender := &fakeTelegramSender{}
	svc := &AudioService{
		telegramIdentityStorage: identityStorage,
		telegramSender:          sender,
	}

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.SendToTelegram(ctx, 1)
	require.Error(t, err)
	assert.True(t, errors.Is(err, service_errors.ErrTelegramNotLinked), "expected ErrTelegramNotLinked, got %v", err)
	assert.Equal(t, 0, sender.callCount, "SendTrack must not be called when telegram isn't linked")
}

func TestAudioService_SendToTelegram_SongNotFound(t *testing.T) {
	identityStorage := &fakeTelegramIdentityStorage{
		getByUserIdFn: func(_ context.Context, _ int64) (domain.TelegramIdentity, error) {
			return domain.TelegramIdentity{TelegramId: 555, UserId: 7}, nil
		},
	}
	songStorage := &fakeSongStorage{
		getByIdFn: func(_ context.Context, _ int64) (domain.Song, error) {
			return domain.Song{}, storage.ErrNotFound
		},
	}
	sender := &fakeTelegramSender{}
	svc := &AudioService{
		telegramIdentityStorage: identityStorage,
		telegramSender:          sender,
		songsStorage:            songStorage,
	}

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.SendToTelegram(ctx, 42)
	require.Error(t, err)
	assert.Equal(t, 0, sender.callCount, "SendTrack must not be called when the song isn't found")
}

func TestAudioService_SendToTelegram_HappyPath(t *testing.T) {
	identityStorage := &fakeTelegramIdentityStorage{
		getByUserIdFn: func(_ context.Context, userId int64) (domain.TelegramIdentity, error) {
			assert.Equal(t, int64(7), userId)
			return domain.TelegramIdentity{TelegramId: 555, UserId: 7}, nil
		},
	}

	fileContent := &fakeReadCloser{Reader: strings.NewReader("audio-bytes")}
	songStorage := &fakeSongStorage{
		getByIdFn: func(_ context.Context, songId int64) (domain.Song, error) {
			assert.Equal(t, int64(42), songId)
			song := domain.Song{
				SongBase: domain.SongBase{
					Id:       42,
					Title:    "Test Track",
					Duration: 200 * time.Second,
					FilePath: "artist/Test_Track-abcd1234.mp3",
				},
				Artists: []domain.ArtistsBase{{Uuid: "artist-uuid", Name: "Test Artist"}},
			}
			return song, nil
		},
		getSongTagsFn: func(_ context.Context, _ int64) ([]domain.SongTag, error) {
			return nil, nil
		},
	}

	binaryStorage := &fakeBinaryFileStorage{
		getFileFn: func(_ context.Context, path string) (io.ReadCloser, error) {
			assert.Equal(t, "artist/Test_Track-abcd1234.mp3", path)
			return fileContent, nil
		},
	}

	sender := &fakeTelegramSender{}
	svc := &AudioService{
		telegramIdentityStorage: identityStorage,
		telegramSender:          sender,
		songsStorage:            songStorage,
		binaryStorage:           binaryStorage,
	}

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.SendToTelegram(ctx, 42)
	require.NoError(t, err)

	require.Equal(t, 1, sender.callCount)
	assert.Equal(t, int64(555), sender.calledChatId)
	assert.Equal(t, "Test Track", sender.calledAudio.Title)
	assert.Equal(t, "Test Artist", sender.calledAudio.Performer)
	assert.Equal(t, 200, sender.calledAudio.DurationSec)
	assert.Same(t, io.Reader(fileContent), sender.calledAudio.Content, "the passed-through content reader should be the one from the file storage fake")
}

func TestAudioService_SendToTelegram_SendTrackError(t *testing.T) {
	identityStorage := &fakeTelegramIdentityStorage{
		getByUserIdFn: func(_ context.Context, _ int64) (domain.TelegramIdentity, error) {
			return domain.TelegramIdentity{TelegramId: 555, UserId: 7}, nil
		},
	}
	songStorage := &fakeSongStorage{
		getByIdFn: func(_ context.Context, _ int64) (domain.Song, error) {
			song := domain.Song{
				SongBase: domain.SongBase{
					Id:       42,
					Title:    "Test Track",
					FilePath: "artist/Test_Track-abcd1234.mp3",
				},
			}
			return song, nil
		},
	}
	binaryStorage := &fakeBinaryFileStorage{}
	sender := &fakeTelegramSender{
		sendTrackFn: func(_ int64, _ tgclient.TrackAudio) error {
			return errors.New("telegram is down")
		},
	}

	svc := &AudioService{
		telegramIdentityStorage: identityStorage,
		telegramSender:          sender,
		songsStorage:            songStorage,
		binaryStorage:           binaryStorage,
	}

	ctx := contextWithPermissions(7, domain.UserPermissions{})

	err := svc.SendToTelegram(ctx, 42)
	require.Error(t, err, "expected the service to wrap and return SendTrack's error")
}
