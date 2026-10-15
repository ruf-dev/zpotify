package tests

import (
	"bytes"
	"context"
	"crypto/rand"
	"io"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"testing"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"

	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
)

const (
	mpegFrameSize   = 417
	mpegFramesCount = 20
	mpegNonceOffset = 100
	mpegNonceSize   = 16

	bucketNameSuffixLen = 8
)

var mpegFrameHeader = []byte{0xFF, 0xFB, 0x90, 0x64}

// defaultStorageMutex serializes tests that change the global default storage.
var defaultStorageMutex sync.Mutex

type apiClient struct {
	baseUrl string
	token   string
}

func newApiClient(baseUrl, token string) apiClient {
	return apiClient{baseUrl: baseUrl, token: token}
}

func (c apiClient) postRaw(t *testing.T, path string, request proto.Message) (int, []byte) {
	t.Helper()

	payload, err := protojson.Marshal(request)
	require.NoError(t, err)

	httpRequest, err := http.NewRequestWithContext(
		context.Background(), http.MethodPost, c.baseUrl+path, bytes.NewReader(payload),
	)
	require.NoError(t, err)
	httpRequest.Header.Set("Authorization", c.token)
	httpRequest.Header.Set("Content-Type", "application/json")

	httpResponse, err := http.DefaultClient.Do(httpRequest)
	require.NoError(t, err)
	defer closeBody(t, httpResponse)

	body, err := io.ReadAll(httpResponse.Body)
	require.NoError(t, err)

	return httpResponse.StatusCode, body
}

func (c apiClient) postStatus(t *testing.T, path string, request proto.Message) int {
	t.Helper()

	status, _ := c.postRaw(t, path, request)

	return status
}

func (c apiClient) mustPost(t *testing.T, path string, request, response proto.Message) {
	t.Helper()

	status, body := c.postRaw(t, path, request)
	require.Equal(t, http.StatusOK, status, string(body))

	if response == nil {
		return
	}

	options := protojson.UnmarshalOptions{DiscardUnknown: true}
	err := options.Unmarshal(body, response)
	require.NoError(t, err)
}

func closeBody(t *testing.T, response *http.Response) {
	t.Helper()

	err := response.Body.Close()
	require.NoError(t, err)
}

func (c apiClient) uploadFile(t *testing.T, fileName string, content []byte) int64 {
	t.Helper()

	var form bytes.Buffer
	writer := multipart.NewWriter(&form)

	err := writer.WriteField("folder", "")
	require.NoError(t, err)

	part, err := writer.CreateFormFile("file", fileName)
	require.NoError(t, err)

	_, err = part.Write(content)
	require.NoError(t, err)

	err = writer.Close()
	require.NoError(t, err)

	httpRequest, err := http.NewRequestWithContext(
		context.Background(), http.MethodPost, c.baseUrl+"/wapi/files/upload", &form,
	)
	require.NoError(t, err)
	httpRequest.Header.Set("Authorization", c.token)
	httpRequest.Header.Set("Content-Type", writer.FormDataContentType())

	httpResponse, err := http.DefaultClient.Do(httpRequest)
	require.NoError(t, err)
	defer closeBody(t, httpResponse)

	body, err := io.ReadAll(httpResponse.Body)
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, httpResponse.StatusCode, string(body))

	idText := strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(string(body)), `{"id": `), "}")
	fileId, err := strconv.ParseInt(idText, 10, 64)
	require.NoError(t, err, string(body))

	return fileId
}

type mediaResponse struct {
	Status int
	Header http.Header
	Body   []byte
}

func getMedia(t *testing.T, baseUrl, filePath string) mediaResponse {
	t.Helper()

	httpRequest, err := http.NewRequestWithContext(
		context.Background(), http.MethodGet, baseUrl+"/wapi/media/"+filePath, nil,
	)
	require.NoError(t, err)

	httpResponse, err := http.DefaultClient.Do(httpRequest)
	require.NoError(t, err)
	defer closeBody(t, httpResponse)

	body, err := io.ReadAll(httpResponse.Body)
	require.NoError(t, err)

	return mediaResponse{Status: httpResponse.StatusCode, Header: httpResponse.Header, Body: body}
}

func getRange(t *testing.T, targetUrl string, byteRange string) mediaResponse {
	t.Helper()

	httpRequest, err := http.NewRequestWithContext(context.Background(), http.MethodGet, targetUrl, nil)
	require.NoError(t, err)
	httpRequest.Header.Set("Range", byteRange)

	httpResponse, err := http.DefaultClient.Do(httpRequest)
	require.NoError(t, err)
	defer closeBody(t, httpResponse)

	body, err := io.ReadAll(httpResponse.Body)
	require.NoError(t, err)

	return mediaResponse{Status: httpResponse.StatusCode, Header: httpResponse.Header, Body: body}
}

func newMp3Fixture(t *testing.T) []byte {
	t.Helper()

	nonce := make([]byte, mpegNonceSize)
	_, err := rand.Read(nonce)
	require.NoError(t, err)

	var stream bytes.Buffer
	for i := 0; i < mpegFramesCount; i++ {
		frame := make([]byte, mpegFrameSize)
		copy(frame, mpegFrameHeader)
		if i == 0 {
			copy(frame[mpegNonceOffset:], nonce)
		}
		stream.Write(frame)
	}

	return stream.Bytes()
}

func newGarageClient(t *testing.T) *minio.Client {
	t.Helper()

	credential := credentials.NewStaticV4(S3AccessKey, S3SecretKey, "")
	options := &minio.Options{
		Creds:        credential,
		Secure:       false,
		Region:       S3Region,
		BucketLookup: minio.BucketLookupPath,
	}

	client, err := minio.New(S3Endpoint, options)
	require.NoError(t, err)

	return client
}

func createGarageBucket(t *testing.T, client *minio.Client) string {
	t.Helper()

	bucket := "zp-e2e-" + strings.ReplaceAll(uuid.NewString(), "-", "")[:bucketNameSuffixLen]

	options := minio.MakeBucketOptions{Region: S3Region}
	err := client.MakeBucket(context.Background(), bucket, options)
	require.NoError(t, err)

	return bucket
}

func newListStoragesRequest() *zpotify_api.ListStorages_Request {
	return &zpotify_api.ListStorages_Request{}
}

func newCreateS3StorageRequest(name, bucket, secretKey string) *zpotify_api.CreateStorage_Request {
	s3Config := &zpotify_api.S3Config{
		Endpoint:        "http://" + S3Endpoint,
		Region:          S3Region,
		Bucket:          bucket,
		AccessKeyId:     S3AccessKey,
		SecretAccessKey: secretKey,
		IsPathStyle:     true,
	}
	config := &zpotify_api.StorageConfig{
		Config: &zpotify_api.StorageConfig_S3{S3: s3Config},
	}

	return &zpotify_api.CreateStorage_Request{Name: name, Config: config}
}

func newTestStorageRequest(storageId string) *zpotify_api.TestStorage_Request {
	return &zpotify_api.TestStorage_Request{Id: storageId}
}

func newDeleteStorageRequest(storageId string) *zpotify_api.DeleteStorage_Request {
	return &zpotify_api.DeleteStorage_Request{Id: storageId}
}

func newSetDefaultStorageRequest(storageId string) *zpotify_api.SetDefaultStorage_Request {
	return &zpotify_api.SetDefaultStorage_Request{Id: storageId}
}

func newCreateArtistRequest(name string) *zpotify_api.CreateArtist_Request {
	return &zpotify_api.CreateArtist_Request{Name: name}
}

func newCreateSongRequest(title, artistUuid string, fileId int64) *zpotify_api.CreateSong_Request {
	return &zpotify_api.CreateSong_Request{
		Title:       title,
		ArtistUuids: []string{artistUuid},
		FileId:      fileId,
	}
}

func newCreatePlaylistRequest(name string) *zpotify_api.CreatePlaylist_Request {
	return &zpotify_api.CreatePlaylist_Request{
		Name: name,
		Kind: zpotify_api.PlaylistKind_PLAYLIST_KIND_PLAYLIST,
	}
}

func newAddSongToPlaylistRequest(playlistUuid string, songId int64) *zpotify_api.AddSongToPlaylist_Request {
	return &zpotify_api.AddSongToPlaylist_Request{PlaylistUuid: playlistUuid, SongId: int32(songId)}
}

func newListPlaylistSongsRequest(playlistUuid string) *zpotify_api.ListSongs_Request {
	paging := &zpotify_api.Paging{Limit: 100}

	return &zpotify_api.ListSongs_Request{Paging: paging, PlaylistUuid: &playlistUuid}
}

type songFixture struct {
	Content  []byte
	FileId   int64
	SongId   int64
	FilePath string
	Storage  uuid.UUID
}
