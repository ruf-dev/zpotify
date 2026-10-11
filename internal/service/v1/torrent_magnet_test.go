package v1

import (
	"crypto/rand"
	"errors"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/bencode"
	"github.com/anacrolix/torrent/metainfo"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

const (
	testMagnetAlbumName  = "Album"
	testMagnetFlacPath   = "Album/01.flac"
	testMagnetMp3Path    = "Album/02.mp3"
	testMagnetCoverPath  = "Album/cover.jpg"
	testMagnetWaitTime   = 10 * time.Second
	testMagnetPollPeriod = 25 * time.Millisecond
	testMagnetNoPeerWait = time.Minute
)

func newLocalClientConfig(t *testing.T, dataDir string) *torrent.ClientConfig {
	t.Helper()

	cfg := torrent.NewDefaultClientConfig()
	cfg.DataDir = dataDir
	cfg.NoDHT = true
	cfg.DisableUTP = true
	cfg.DisableIPv6 = true
	cfg.DisableWebtorrent = true
	cfg.DisableWebseeds = true
	cfg.NoDefaultPortForwarding = true
	cfg.ListenPort = 0

	return cfg
}

func newLocalClient(t *testing.T, cfg *torrent.ClientConfig) *torrent.Client {
	t.Helper()

	client, err := torrent.NewClient(cfg)
	require.NoError(t, err)
	t.Cleanup(func() { client.Close() })

	return client
}

func writeRandomFile(t *testing.T, path string, size int) {
	t.Helper()

	content := make([]byte, size)
	_, err := rand.Read(content)
	require.NoError(t, err)

	err = os.MkdirAll(filepath.Dir(path), 0o755)
	require.NoError(t, err)

	err = os.WriteFile(path, content, 0o644)
	require.NoError(t, err)
}

// startAlbumSeeder serves a small three-file album from a localhost client and
// returns that client with the album's info hash, once all data is verified.
func startAlbumSeeder(t *testing.T) (*torrent.Client, metainfo.Hash) {
	t.Helper()

	dataDir := t.TempDir()
	albumDir := filepath.Join(dataDir, testMagnetAlbumName)
	writeRandomFile(t, filepath.Join(albumDir, "01.flac"), 40<<10)
	writeRandomFile(t, filepath.Join(albumDir, "02.mp3"), 30<<10)
	writeRandomFile(t, filepath.Join(albumDir, "cover.jpg"), 5<<10)

	info := metainfo.Info{PieceLength: 16 << 10}
	err := info.BuildFromFilePath(albumDir)
	require.NoError(t, err)

	infoBytes, err := bencode.Marshal(info)
	require.NoError(t, err)
	mi := metainfo.MetaInfo{InfoBytes: infoBytes}

	cfg := newLocalClientConfig(t, dataDir)
	cfg.Seed = true
	cfg.NoUpload = false
	seeder := newLocalClient(t, cfg)

	tor, err := seeder.AddTorrent(&mi)
	require.NoError(t, err)

	require.Eventually(t, func() bool { return tor.Complete().Bool() }, testMagnetWaitTime, testMagnetPollPeriod)

	return seeder, tor.InfoHash()
}

func newMagnetTestService(
	t *testing.T,
	metadataTimeout time.Duration,
) (*TorrentService, *torrent.Client, *fakeTorrentDownloadStorage) {
	t.Helper()

	cfg := newLocalClientConfig(t, t.TempDir())
	client := newLocalClient(t, cfg)

	torrentStorage := newFakeTorrentDownloadStorage()
	svc := &TorrentService{
		torrentStorage: torrentStorage,
		binaryStorage:  newFakePendingBinaryStorage(0),
		torrentClient:  client,
		cfg:            TorrentServiceConfig{MetadataTimeout: metadataTimeout},
		pendingUploads: make(map[string]pendingTorrentUpload),
	}

	return svc, client, torrentStorage
}

func newMagnetUri(infoHash metainfo.Hash, peerPort int) string {
	query := url.Values{}
	query.Set("xt", "urn:btih:"+infoHash.HexString())
	query.Set("dn", testMagnetAlbumName)
	if peerPort != 0 {
		query.Set("x.pe", "127.0.0.1:"+strconv.Itoa(peerPort))
	}

	return "magnet:?" + query.Encode()
}

func randomInfoHash(t *testing.T) metainfo.Hash {
	t.Helper()

	var hash metainfo.Hash
	_, err := rand.Read(hash[:])
	require.NoError(t, err)

	return hash
}

func hasTorrent(client *torrent.Client, infoHash metainfo.Hash) bool {
	_, ok := client.Torrent(infoHash)
	return ok
}

func Test_TorrentService_AddTorrentMagnet_ResolvesFromPeer(t *testing.T) {
	seeder, infoHash := startAlbumSeeder(t)
	svc, _, torrentStorage := newMagnetTestService(t, testMagnetWaitTime/2)
	ctx := contextWithPermissions(1, uploadPermissions())

	added, err := svc.AddTorrentMagnet(ctx, newMagnetUri(infoHash, seeder.LocalPort()))
	require.NoError(t, err)
	require.NotEmpty(t, added.UploadId)
	require.Zero(t, added.ExistingJobId)

	var file domain.TorrentFile
	require.Eventually(t, func() bool {
		var getErr error
		file, getErr = svc.GetTorrentFile(ctx, added.UploadId)
		return getErr == nil && !file.IsResolving
	}, testMagnetWaitTime, testMagnetPollPeriod)

	require.Equal(t, testMagnetAlbumName, file.TorrentName)
	require.Len(t, file.Files, 3)

	supportedByPath := make(map[string]bool, len(file.Files))
	for _, entry := range file.Files {
		supportedByPath[entry.Path] = entry.Supported
	}
	require.True(t, supportedByPath[testMagnetFlacPath])
	require.True(t, supportedByPath[testMagnetMp3Path])
	require.Contains(t, supportedByPath, testMagnetCoverPath)

	selected := []string{testMagnetFlacPath, testMagnetMp3Path}
	jobId, err := svc.SubmitTorrentFile(ctx, added.UploadId, "", selected)
	require.NoError(t, err)

	rows, err := torrentStorage.ListActive(ctx)
	require.NoError(t, err)
	require.Len(t, rows, 1)
	require.Equal(t, jobId, rows[0].Id)
	require.Equal(t, infoHash.HexString(), rows[0].InfoHash)
}

func Test_TorrentService_AddTorrentMagnet_TimesOutWithoutPeers(t *testing.T) {
	svc, client, _ := newMagnetTestService(t, time.Second)
	ctx := contextWithPermissions(1, uploadPermissions())
	infoHash := randomInfoHash(t)

	added, err := svc.AddTorrentMagnet(ctx, newMagnetUri(infoHash, 0))
	require.NoError(t, err)

	require.Eventually(t, func() bool {
		_, getErr := svc.GetTorrentFile(ctx, added.UploadId)
		return getErr != nil && errors.Is(getErr, service_errors.ErrTorrentMetadataTimeout)
	}, testMagnetWaitTime, testMagnetPollPeriod)

	_, err = svc.GetTorrentFile(ctx, added.UploadId)
	require.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)

	require.Eventually(t, func() bool { return !hasTorrent(client, infoHash) }, testMagnetWaitTime, testMagnetPollPeriod)
}

func Test_TorrentService_AddTorrentMagnet_ExistingJob(t *testing.T) {
	svc, client, torrentStorage := newMagnetTestService(t, time.Second)
	ctx := contextWithPermissions(1, uploadPermissions())
	infoHash := randomInfoHash(t)

	download := domain.TorrentDownload{UserId: 1, InfoHash: infoHash.HexString(), TorrentName: testMagnetAlbumName}
	row, err := torrentStorage.Add(ctx, download)
	require.NoError(t, err)

	added, err := svc.AddTorrentMagnet(ctx, newMagnetUri(infoHash, 0))
	require.NoError(t, err)
	require.Equal(t, row.Id, added.ExistingJobId)
	require.Empty(t, added.UploadId)
	require.Empty(t, client.Torrents())
}

func Test_TorrentService_AddTorrentMagnet_InvalidUri(t *testing.T) {
	svc, client, _ := newMagnetTestService(t, time.Second)
	ctx := contextWithPermissions(1, uploadPermissions())

	_, err := svc.AddTorrentMagnet(ctx, "magnet:?xt=urn:sha1:abc")
	require.ErrorIs(t, err, service_errors.ErrInvalidMagnet)

	_, err = svc.AddTorrentMagnet(ctx, "http://x")
	require.ErrorIs(t, err, service_errors.ErrInvalidMagnet)

	require.Empty(t, client.Torrents())
}

func Test_TorrentService_SubmitTorrentFile_MagnetStillResolving(t *testing.T) {
	svc, _, _ := newMagnetTestService(t, testMagnetNoPeerWait)
	ctx := contextWithPermissions(1, uploadPermissions())

	added, err := svc.AddTorrentMagnet(ctx, newMagnetUri(randomInfoHash(t), 0))
	require.NoError(t, err)

	_, err = svc.SubmitTorrentFile(ctx, added.UploadId, "", []string{testMagnetFlacPath})
	require.ErrorIs(t, err, service_errors.ErrTorrentMetadataPending)

	file, err := svc.GetTorrentFile(ctx, added.UploadId)
	require.NoError(t, err)
	require.True(t, file.IsResolving)
}

func Test_TorrentService_DiscardTorrentFile_DropsMagnet(t *testing.T) {
	svc, client, _ := newMagnetTestService(t, testMagnetNoPeerWait)
	ctx := contextWithPermissions(1, uploadPermissions())
	infoHash := randomInfoHash(t)

	added, err := svc.AddTorrentMagnet(ctx, newMagnetUri(infoHash, 0))
	require.NoError(t, err)
	require.True(t, hasTorrent(client, infoHash))

	err = svc.DiscardTorrentFile(ctx, added.UploadId)
	require.NoError(t, err)

	_, err = svc.GetTorrentFile(ctx, added.UploadId)
	require.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
	require.False(t, hasTorrent(client, infoHash))

	err = svc.DiscardTorrentFile(ctx, added.UploadId)
	require.ErrorIs(t, err, service_errors.ErrTorrentUploadNotFound)
}
