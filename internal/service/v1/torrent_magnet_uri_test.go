package v1

import (
	"net/url"
	"testing"

	"github.com/anacrolix/torrent"
	"github.com/anacrolix/torrent/bencode"
	"github.com/anacrolix/torrent/metainfo"
	"github.com/stretchr/testify/require"

	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

const (
	testMagnetInfoHash = "0123456789abcdef0123456789abcdef01234567"
	testTrackerA       = "udp://tracker-a.example:6969/announce"
	testTrackerB       = "http://tracker-b.example/announce"
)

func Test_BuildMagnetUri_Variants(t *testing.T) {
	cases := []struct {
		name         string
		infoHash     string
		torrentName  string
		trackers     []string
		wantTrackers []string
	}{
		{"with trackers", testMagnetInfoHash, "My Album", []string{testTrackerA, testTrackerB}, []string{testTrackerA, testTrackerB}},
		{"without trackers", testMagnetInfoHash, "My Album", nil, nil},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := buildMagnetUri(tc.infoHash, tc.torrentName, tc.trackers)
			require.NoError(t, err)

			parsed, err := url.Parse(got)
			require.NoError(t, err)
			require.Equal(t, "magnet", parsed.Scheme)

			query := parsed.Query()
			require.Equal(t, []string{"urn:btih:" + tc.infoHash}, query["xt"])
			require.Equal(t, []string{tc.torrentName}, query["dn"])
			require.Equal(t, tc.wantTrackers, query["tr"])
		})
	}
}

func Test_BuildMagnetUri_RejectsInvalidInfoHash(t *testing.T) {
	_, err := buildMagnetUri("not-a-hash", "name", nil)
	require.ErrorIs(t, err, service_errors.ErrInvalidInfoHash)
}

func Test_FlattenAnnounceList_DedupesPreservingOrder(t *testing.T) {
	tiers := [][]string{
		{testTrackerA, testTrackerB},
		{testTrackerB, "", "udp://tracker-c.example:80"},
	}

	got := flattenAnnounceList(tiers)

	require.Equal(t, []string{testTrackerA, testTrackerB, "udp://tracker-c.example:80"}, got)
}

func Test_FlattenAnnounceList_EmptyIsNonNil(t *testing.T) {
	got := flattenAnnounceList(nil)

	require.NotNil(t, got)
	require.Empty(t, got)
}

func Test_TrackersOf_CapturesMagnetTrackers(t *testing.T) {
	client := newLocalClient(t, newLocalClientConfig(t, t.TempDir()))

	magnetUri := "magnet:?xt=urn:btih:" + testMagnetInfoHash +
		"&tr=" + url.QueryEscape(testTrackerA) +
		"&tr=" + url.QueryEscape(testTrackerB)

	spec, err := torrent.TorrentSpecFromMagnetUri(magnetUri)
	require.NoError(t, err)

	tor, _, err := client.AddTorrentSpec(spec)
	require.NoError(t, err)

	got := trackersOf(tor)

	require.Equal(t, []string{testTrackerA, testTrackerB}, got)
}

func Test_TrackersOf_CapturesTorrentFileAnnounceList(t *testing.T) {
	client := newLocalClient(t, newLocalClientConfig(t, t.TempDir()))

	info := metainfo.Info{PieceLength: 16384, Name: "announced", Length: 1024, Pieces: make([]byte, 20)}
	infoBytes, err := bencode.Marshal(info)
	require.NoError(t, err)

	mi := metainfo.MetaInfo{
		InfoBytes:    infoBytes,
		Announce:     testTrackerA,
		AnnounceList: [][]string{{testTrackerA}, {testTrackerB}},
	}

	tor, err := client.AddTorrent(&mi)
	require.NoError(t, err)

	got := trackersOf(tor)

	require.Equal(t, []string{testTrackerA, testTrackerB}, got)
}

func Test_IsPrivateTorrent_ReadsInfoDictFlag(t *testing.T) {
	isPrivate := true
	isPublic := false

	cases := []struct {
		name    string
		private *bool
		want    bool
	}{
		{"private flag set", &isPrivate, true},
		{"private flag false", &isPublic, false},
		{"private flag absent", nil, false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			client := newLocalClient(t, newLocalClientConfig(t, t.TempDir()))

			info := metainfo.Info{
				PieceLength: 16384,
				Name:        "flagged",
				Length:      1024,
				Pieces:      make([]byte, 20),
				Private:     tc.private,
			}
			infoBytes, err := bencode.Marshal(info)
			require.NoError(t, err)

			mi := metainfo.MetaInfo{InfoBytes: infoBytes}

			tor, err := client.AddTorrent(&mi)
			require.NoError(t, err)

			require.Equal(t, tc.want, isPrivateTorrent(tor))
		})
	}
}

func Test_IsPrivateTorrent_FalseWithoutMetadata(t *testing.T) {
	client := newLocalClient(t, newLocalClientConfig(t, t.TempDir()))

	spec, err := torrent.TorrentSpecFromMagnetUri("magnet:?xt=urn:btih:" + testMagnetInfoHash)
	require.NoError(t, err)

	tor, _, err := client.AddTorrentSpec(spec)
	require.NoError(t, err)

	require.False(t, isPrivateTorrent(tor))
}
