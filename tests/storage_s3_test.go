package tests

import (
	"context"
	"io"
	"net/http"
	"testing"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

const (
	remoteRedirectValue = "/_remote"
	remoteUrlHeader     = "X-Remote-Url"
	accelRedirectHeader = "X-Accel-Redirect"
	rangePrefixBytes    = 10
	rangeHeaderValue    = "bytes=0-9"
)

type S3StorageTestSuite struct {
	suite.Suite

	env    *TestEnv
	admin  apiClient
	user   apiClient
	garage *minio.Client
}

func (s *S3StorageTestSuite) SetupSuite() {
	s.env = NewTestEnv(s.T())

	_, adminToken := s.env.CreateAdminUser(s.T())
	s.admin = newApiClient(s.env.BaseUrl, adminToken)

	_, userToken := s.env.CreateRegularUser(s.T())
	s.user = newApiClient(s.env.BaseUrl, userToken)

	s.garage = newGarageClient(s.T())
}

func (s *S3StorageTestSuite) Test_S3Storage_AdminCreatesAndTestsStorage() {
	t := s.T()

	bucket := createGarageBucket(t, s.garage)
	created := s.createS3Storage(t, bucket, S3SecretKey)

	require.Empty(t, created.GetConfig().GetS3().GetSecretAccessKey())
	require.Equal(t, bucket, created.GetConfig().GetS3().GetBucket())
	require.Equal(t, zpotify_api.StorageKind_STORAGE_KIND_S3, created.GetKind())

	s.admin.mustPost(t, "/api/admin/storage/test", newTestStorageRequest(created.GetId()), nil)

	listed := s.findStorage(t, created.GetId())
	require.True(t, listed.GetIsConnected())
}

func (s *S3StorageTestSuite) Test_S3Storage_TestFailsOnBadCredentials() {
	t := s.T()

	bucket := createGarageBucket(t, s.garage)
	created := s.createS3Storage(t, bucket, "wrong-secret-"+uuid.NewString())

	status := s.admin.postStatus(t, "/api/admin/storage/test", newTestStorageRequest(created.GetId()))
	require.GreaterOrEqual(t, status, http.StatusBadRequest)

	listed := s.findStorage(t, created.GetId())
	require.True(t, listed.GetIsConnected(), "S3 isConnected only reflects that the config is complete")
}

func (s *S3StorageTestSuite) Test_S3Storage_NonAdminForbidden() {
	t := s.T()

	bucket := createGarageBucket(t, s.garage)

	listStatus := s.user.postStatus(t, "/api/admin/storage/list", newListStoragesRequest())
	createRequest := newCreateS3StorageRequest("e2e-"+uuid.NewString(), bucket, S3SecretKey)
	createStatus := s.user.postStatus(t, "/api/admin/storage/create", createRequest)
	deleteRequest := newDeleteStorageRequest(uuid.NewString())
	deleteStatus := s.user.postStatus(t, "/api/admin/storage/delete", deleteRequest)

	require.Equal(t, http.StatusForbidden, listStatus)
	require.Equal(t, http.StatusForbidden, createStatus)
	require.Equal(t, http.StatusForbidden, deleteStatus)
}

func (s *S3StorageTestSuite) Test_S3Storage_UploadLandsOnDefaultS3AndIsServed() {
	t := s.T()

	bucket := createGarageBucket(t, s.garage)
	s3Storage := s.createS3Storage(t, bucket, S3SecretKey)
	s.lockDefaultStorage(t)
	s.setDefault(t, s3Storage.GetId())

	song := s.publishSong(t)

	require.Equal(t, s3Storage.GetId(), song.Storage.String())
	s.requireObjectEquals(t, bucket, song.FilePath, song.Content)

	media := getMedia(t, s.env.BaseUrl, song.FilePath)
	require.Equal(t, http.StatusOK, media.Status)
	require.Empty(t, media.Body)
	require.Equal(t, remoteRedirectValue, media.Header.Get(accelRedirectHeader))
	remoteUrl := media.Header.Get(remoteUrlHeader)
	require.NotEmpty(t, remoteUrl)

	ranged := getRange(t, remoteUrl, rangeHeaderValue)
	require.Equal(t, http.StatusPartialContent, ranged.Status)
	require.Equal(t, song.Content[:rangePrefixBytes], ranged.Body)
}

func (s *S3StorageTestSuite) Test_S3Storage_MixedPlaylist() {
	t := s.T()

	bucket := createGarageBucket(t, s.garage)
	s3Storage := s.createS3Storage(t, bucket, S3SecretKey)
	s.lockDefaultStorage(t)

	s.setDefault(t, s3Storage.GetId())
	remoteSong := s.publishSong(t)

	s.setDefault(t, domain.LocalStorageUuid.String())
	localSong := s.publishSong(t)

	require.Equal(t, s3Storage.GetId(), remoteSong.Storage.String())
	require.Equal(t, domain.LocalStorageUuid, localSong.Storage)

	playlistUuid := s.createPlaylist(t)
	s.admin.mustPost(t, "/api/playlist/add_song", newAddSongToPlaylistRequest(playlistUuid, remoteSong.SongId), nil)
	s.admin.mustPost(t, "/api/playlist/add_song", newAddSongToPlaylistRequest(playlistUuid, localSong.SongId), nil)

	songs := &zpotify_api.ListSongs_Response{}
	s.admin.mustPost(t, "/api/playlist/songs", newListPlaylistSongsRequest(playlistUuid), songs)
	require.ElementsMatch(t, []int64{remoteSong.SongId, localSong.SongId}, songIdsOf(songs))

	remoteMedia := getMedia(t, s.env.BaseUrl, remoteSong.FilePath)
	require.Equal(t, http.StatusOK, remoteMedia.Status)
	require.Equal(t, remoteRedirectValue, remoteMedia.Header.Get(accelRedirectHeader))

	localMedia := getMedia(t, s.env.BaseUrl, localSong.FilePath)
	require.Equal(t, http.StatusNotFound, localMedia.Status)
	require.Empty(t, localMedia.Header.Get(accelRedirectHeader))
}

func (s *S3StorageTestSuite) Test_S3Storage_DeleteNonEmptyRejected() {
	t := s.T()

	bucket := createGarageBucket(t, s.garage)
	filled := s.createS3Storage(t, bucket, S3SecretKey)
	s.lockDefaultStorage(t)

	s.setDefault(t, filled.GetId())
	s.publishSong(t)
	s.setDefault(t, domain.LocalStorageUuid.String())

	status, body := s.admin.postRaw(t, "/api/admin/storage/delete", newDeleteStorageRequest(filled.GetId()))
	require.Equal(t, http.StatusBadRequest, status)
	require.Contains(t, string(body), "storage still holds files")
	require.NotNil(t, s.findStorage(t, filled.GetId()))

	emptyBucket := createGarageBucket(t, s.garage)
	empty := s.createS3Storage(t, emptyBucket, S3SecretKey)

	s.admin.mustPost(t, "/api/admin/storage/delete", newDeleteStorageRequest(empty.GetId()), nil)
	require.Nil(t, s.lookupStorage(t, empty.GetId()))
}

func (s *S3StorageTestSuite) createS3Storage(t *testing.T, bucket, secretKey string) *zpotify_api.StorageInfo {
	t.Helper()

	request := newCreateS3StorageRequest("e2e-s3-"+uuid.NewString(), bucket, secretKey)
	response := &zpotify_api.CreateStorage_Response{}
	s.admin.mustPost(t, "/api/admin/storage/create", request, response)

	return response.GetStorage()
}

func (s *S3StorageTestSuite) lookupStorage(t *testing.T, storageId string) *zpotify_api.StorageInfo {
	t.Helper()

	response := &zpotify_api.ListStorages_Response{}
	s.admin.mustPost(t, "/api/admin/storage/list", newListStoragesRequest(), response)

	for _, info := range response.GetStorages() {
		if info.GetId() == storageId {
			return info
		}
	}

	return nil
}

func (s *S3StorageTestSuite) findStorage(t *testing.T, storageId string) *zpotify_api.StorageInfo {
	t.Helper()

	info := s.lookupStorage(t, storageId)
	require.NotNil(t, info, "storage %s is not listed", storageId)

	return info
}

func (s *S3StorageTestSuite) currentDefaultId(t *testing.T) string {
	t.Helper()

	response := &zpotify_api.ListStorages_Response{}
	s.admin.mustPost(t, "/api/admin/storage/list", newListStoragesRequest(), response)

	for _, info := range response.GetStorages() {
		if info.GetIsDefault() {
			return info.GetId()
		}
	}

	require.FailNow(t, "no default storage")

	return ""
}

func (s *S3StorageTestSuite) setDefault(t *testing.T, storageId string) {
	t.Helper()

	s.admin.mustPost(t, "/api/admin/storage/set_default", newSetDefaultStorageRequest(storageId), nil)
}

func (s *S3StorageTestSuite) lockDefaultStorage(t *testing.T) {
	t.Helper()

	defaultStorageMutex.Lock()
	t.Cleanup(defaultStorageMutex.Unlock)

	previousDefaultId := s.currentDefaultId(t)
	t.Cleanup(func() {
		s.setDefault(t, previousDefaultId)
	})
}

func (s *S3StorageTestSuite) createPlaylist(t *testing.T) string {
	t.Helper()

	request := newCreatePlaylistRequest("e2e-playlist-" + uuid.NewString())
	response := &zpotify_api.CreatePlaylist_Response{}
	s.admin.mustPost(t, "/api/playlist/create", request, response)

	return response.GetUuid()
}

func (s *S3StorageTestSuite) publishSong(t *testing.T) songFixture {
	t.Helper()

	suffix := uuid.NewString()
	content := newMp3Fixture(t)
	fileId := s.admin.uploadFile(t, "e2e-"+suffix+".mp3", content)

	artist := &zpotify_api.CreateArtist_Response{}
	s.admin.mustPost(t, "/api/artists/create", newCreateArtistRequest("e2e-artist-"+suffix), artist)

	song := &zpotify_api.CreateSong_Response{}
	songRequest := newCreateSongRequest("e2e-song-"+suffix, artist.GetArtist().GetUuid(), fileId)
	s.admin.mustPost(t, "/api/song/create", songRequest, song)

	fixture := songFixture{Content: content, FileId: fileId, SongId: song.GetId()}
	s.loadFileLocation(t, &fixture)

	return fixture
}

func (s *S3StorageTestSuite) loadFileLocation(t *testing.T, fixture *songFixture) {
	t.Helper()

	err := s.env.Db.QueryRowContext(
		context.Background(),
		`SELECT file_path, storage_id FROM files_meta WHERE id = $1`,
		fixture.FileId,
	).Scan(&fixture.FilePath, &fixture.Storage)
	require.NoError(t, err)
}

func (s *S3StorageTestSuite) requireObjectEquals(t *testing.T, bucket, objectPath string, want []byte) {
	t.Helper()

	ctx := context.Background()

	options := minio.GetObjectOptions{}
	object, err := s.garage.GetObject(ctx, bucket, objectPath, options)
	require.NoError(t, err)
	defer func() {
		closeErr := object.Close()
		require.NoError(t, closeErr)
	}()

	got, err := io.ReadAll(object)
	require.NoError(t, err)
	require.Equal(t, want, got)
}

func songIdsOf(response *zpotify_api.ListSongs_Response) []int64 {
	ids := make([]int64, 0, len(response.GetSongs()))
	for _, song := range response.GetSongs() {
		ids = append(ids, song.GetId())
	}

	return ids
}

func Test_S3Storage(t *testing.T) {
	suite.Run(t, new(S3StorageTestSuite))
}
