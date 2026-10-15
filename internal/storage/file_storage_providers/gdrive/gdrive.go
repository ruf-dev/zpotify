package gdrive

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net"
	"net/http"
	"net/textproto"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

const (
	defaultApiBase    = "https://www.googleapis.com/drive/v3"
	defaultUploadBase = "https://www.googleapis.com/upload/drive/v3"

	driveFileScope = "https://www.googleapis.com/auth/drive.file"
	driveRootAlias = "root"
	maxCachedIds   = 50_000

	dialTimeout           = 10 * time.Second
	tlsHandshakeTimeout   = 10 * time.Second
	responseHeaderTimeout = 2 * time.Minute
)

type fileRef struct {
	Id string `json:"id"`
}

type fileList struct {
	Files []fileRef `json:"files"`
}

type fileMetadata struct {
	Name    string   `json:"name"`
	Parents []string `json:"parents"`
}

type Storage struct {
	client     *http.Client
	tokens     oauth2.TokenSource
	rootId     string
	apiBase    string
	uploadBase string

	mu  sync.Mutex
	ids map[string]string
}

func New(ctx context.Context, cfg domain.GoogleDriveConfig) (storage.ContentStorage, error) {
	s := newWithEndpoints(ctx, cfg, defaultApiBase, defaultUploadBase, google.Endpoint.TokenURL)

	return s, nil
}

func newWithEndpoints(
	ctx context.Context,
	cfg domain.GoogleDriveConfig,
	apiBase, uploadBase, tokenUrl string,
) *Storage {
	transport := newTransport()

	rootId := cfg.RootFolderId
	if rootId == "" {
		rootId = driveRootAlias
	}

	s := &Storage{
		client:     &http.Client{Transport: transport},
		rootId:     rootId,
		apiBase:    apiBase,
		uploadBase: uploadBase,
		ids:        map[string]string{},
	}

	if cfg.RefreshToken == "" {
		return s
	}

	config := newOauthConfig(cfg, "", tokenUrl)
	token := &oauth2.Token{RefreshToken: cfg.RefreshToken}

	// The token source outlives the caller's request-scoped context.
	tokenCtx := context.WithoutCancel(ctx)
	s.tokens = oauth2.ReuseTokenSource(nil, config.TokenSource(tokenCtx, token))

	return s
}

func newTransport() *http.Transport {
	base, ok := http.DefaultTransport.(*http.Transport)
	if !ok {
		base = &http.Transport{}
	}

	dialer := &net.Dialer{Timeout: dialTimeout}
	transport := base.Clone()
	transport.DialContext = dialer.DialContext
	transport.TLSHandshakeTimeout = tlsHandshakeTimeout
	transport.ResponseHeaderTimeout = responseHeaderTimeout

	return transport
}

func AuthCodeUrl(cfg domain.GoogleDriveConfig, redirectUrl, state string) string {
	config := newOauthConfig(cfg, redirectUrl, google.Endpoint.TokenURL)
	prompt := oauth2.SetAuthURLParam("prompt", "consent")

	return config.AuthCodeURL(state, oauth2.AccessTypeOffline, prompt)
}

func Exchange(
	ctx context.Context,
	cfg domain.GoogleDriveConfig,
	redirectUrl, code string,
) (refreshToken string, err error) {
	config := newOauthConfig(cfg, redirectUrl, google.Endpoint.TokenURL)

	token, err := config.Exchange(ctx, code)
	if err != nil {
		return "", rerrors.Wrap(err, "error exchanging authorization code")
	}

	if token.RefreshToken == "" {
		return "", rerrors.Wrap(ErrEmptyRefreshToken)
	}

	return token.RefreshToken, nil
}

func newOauthConfig(cfg domain.GoogleDriveConfig, redirectUrl, tokenUrl string) *oauth2.Config {
	endpoint := google.Endpoint
	endpoint.TokenURL = tokenUrl

	return &oauth2.Config{
		ClientID:     cfg.ClientId,
		ClientSecret: cfg.ClientSecret,
		Endpoint:     endpoint,
		Scopes:       []string{driveFileScope},
		RedirectURL:  redirectUrl,
	}
}

func (s *Storage) Put(ctx context.Context, path string, content io.Reader) error {
	err := s.deleteByName(ctx, path)
	if err != nil {
		return rerrors.Wrap(err, "error removing existing file")
	}

	meta := fileMetadata{Name: path, Parents: []string{s.rootId}}

	pipeReader, pipeWriter := io.Pipe()
	defer utils.CloseWithLog(pipeReader, "google drive upload pipe")

	multipartWriter := multipart.NewWriter(pipeWriter)
	go s.writeMultipart(pipeWriter, multipartWriter, meta, content)

	// Drive accepts only multipart/related; mime/multipart emits form-data by default.
	contentType := "multipart/related; boundary=" + multipartWriter.Boundary()
	target := s.uploadBase + "/files?uploadType=multipart&supportsAllDrives=true&fields=id"

	created, err := s.callRef(ctx, http.MethodPost, target, contentType, pipeReader)
	if err != nil {
		return rerrors.Wrap(err, "error uploading file")
	}

	s.remember(path, created.Id)

	return nil
}

func (s *Storage) writeMultipart(
	pipeWriter *io.PipeWriter,
	multipartWriter *multipart.Writer,
	meta fileMetadata,
	content io.Reader,
) {
	err := writeMultipartParts(multipartWriter, meta, content)
	if err != nil {
		_ = pipeWriter.CloseWithError(err)
		return
	}

	_ = pipeWriter.Close()
}

func writeMultipartParts(multipartWriter *multipart.Writer, meta fileMetadata, content io.Reader) error {
	metaHeader := textproto.MIMEHeader{}
	metaHeader.Set("Content-Type", "application/json; charset=UTF-8")

	metaPart, err := multipartWriter.CreatePart(metaHeader)
	if err != nil {
		return rerrors.Wrap(err, "error creating metadata part")
	}

	err = json.NewEncoder(metaPart).Encode(meta)
	if err != nil {
		return rerrors.Wrap(err, "error writing metadata part")
	}

	mediaHeader := textproto.MIMEHeader{}
	mediaHeader.Set("Content-Type", "application/octet-stream")

	mediaPart, err := multipartWriter.CreatePart(mediaHeader)
	if err != nil {
		return rerrors.Wrap(err, "error creating media part")
	}

	_, err = io.Copy(mediaPart, content)
	if err != nil {
		return rerrors.Wrap(err, "error writing media part")
	}

	err = multipartWriter.Close()
	if err != nil {
		return rerrors.Wrap(err, "error closing multipart")
	}

	return nil
}

func (s *Storage) Get(ctx context.Context, path string) (io.ReadCloser, error) {
	id, err := s.requireId(ctx, path)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	target := s.apiBase + "/files/" + url.PathEscape(id) + "?alt=media&supportsAllDrives=true"

	resp, err := s.call(ctx, http.MethodGet, target, "", nil)
	if err != nil {
		return nil, rerrors.Wrap(err, "error downloading file")
	}

	err = s.checkStatus(resp, path)
	if err != nil {
		utils.CloseWithLog(resp.Body, "google drive get response")
		return nil, rerrors.Wrap(err)
	}

	return resp.Body, nil
}

func (s *Storage) Copy(ctx context.Context, fromPath, toPath string) error {
	srcId, err := s.requireId(ctx, fromPath)
	if err != nil {
		return rerrors.Wrap(err)
	}

	err = s.deleteByName(ctx, toPath)
	if err != nil {
		return rerrors.Wrap(err, "error removing existing destination")
	}

	meta := fileMetadata{Name: toPath, Parents: []string{s.rootId}}

	body, err := json.Marshal(meta)
	if err != nil {
		return rerrors.Wrap(err, "error encoding metadata")
	}

	target := s.apiBase + "/files/" + url.PathEscape(srcId) + "/copy?supportsAllDrives=true&fields=id"

	created, err := s.callRef(ctx, http.MethodPost, target, "application/json", bytes.NewReader(body))
	if err != nil {
		return rerrors.Wrap(err, "error copying file")
	}

	s.remember(toPath, created.Id)

	return nil
}

func (s *Storage) Delete(ctx context.Context, path string) error {
	err := s.deleteByName(ctx, path)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return nil
}

func (s *Storage) Resolve(ctx context.Context, path string) (domain.RemoteTarget, error) {
	id, err := s.requireId(ctx, path)
	if err != nil {
		return domain.RemoteTarget{}, rerrors.Wrap(err)
	}

	token, err := s.token()
	if err != nil {
		return domain.RemoteTarget{}, rerrors.Wrap(err)
	}

	target := domain.RemoteTarget{
		Url:                 s.apiBase + "/files/" + url.PathEscape(id) + "?alt=media&supportsAllDrives=true",
		AuthorizationHeader: "Bearer " + token.AccessToken,
	}

	return target, nil
}

func (s *Storage) Probe(ctx context.Context) error {
	path := ".probe-" + uuid.NewString()
	payload := []byte(path)

	err := s.Put(ctx, path, bytes.NewReader(payload))
	if err != nil {
		return rerrors.Wrap(err, "error putting probe")
	}
	defer s.cleanup(ctx, path)

	reader, err := s.Get(ctx, path)
	if err != nil {
		return rerrors.Wrap(err, "error getting probe")
	}
	defer utils.CloseWithLog(reader, "google drive probe")

	got, err := io.ReadAll(reader)
	if err != nil {
		return rerrors.Wrap(err, "error reading probe")
	}

	if !bytes.Equal(got, payload) {
		return rerrors.Wrap(ErrProbeMismatch)
	}

	err = s.Delete(ctx, path)
	if err != nil {
		return rerrors.Wrap(err, "error deleting probe")
	}

	return nil
}

func (s *Storage) cleanup(ctx context.Context, path string) {
	_ = s.Delete(ctx, path)
}

func (s *Storage) deleteByName(ctx context.Context, path string) error {
	id, isFound, err := s.lookup(ctx, path)
	if err != nil {
		return rerrors.Wrap(err, "error looking up file")
	}

	if !isFound {
		return nil
	}

	target := s.apiBase + "/files/" + url.PathEscape(id) + "?supportsAllDrives=true"

	resp, err := s.call(ctx, http.MethodDelete, target, "", nil)
	if err != nil {
		return rerrors.Wrap(err, "error deleting file")
	}
	defer closeResponse(ctx, resp, "google drive delete response")

	s.forget(path)

	if resp.StatusCode == http.StatusNotFound {
		return nil
	}

	return s.checkStatus(resp, path)
}

func (s *Storage) requireId(ctx context.Context, path string) (string, error) {
	id, isFound, err := s.lookup(ctx, path)
	if err != nil {
		return "", rerrors.Wrap(err, "error looking up file")
	}

	if !isFound {
		return "", rerrors.Wrap(ErrNotFound)
	}

	return id, nil
}

func (s *Storage) lookup(ctx context.Context, path string) (id string, isFound bool, err error) {
	cachedId, isCached := s.cached(path)
	if isCached {
		return cachedId, true, nil
	}

	query := "name = '" + escapeQueryLiteral(path) + "' and '" + escapeQueryLiteral(s.rootId) +
		"' in parents and trashed = false"

	params := url.Values{}
	params.Set("q", query)
	params.Set("fields", "files(id)")
	params.Set("pageSize", "1")
	params.Set("supportsAllDrives", "true")
	params.Set("includeItemsFromAllDrives", "true")

	raw, err := s.callBytes(ctx, http.MethodGet, s.apiBase+"/files?"+params.Encode(), "", nil)
	if err != nil {
		return "", false, rerrors.Wrap(err, "error listing files")
	}

	var list fileList
	err = json.Unmarshal(raw, &list)
	if err != nil {
		return "", false, rerrors.Wrap(err, "error decoding file list")
	}

	if len(list.Files) == 0 {
		return "", false, nil
	}

	s.remember(path, list.Files[0].Id)

	return list.Files[0].Id, true, nil
}

func (s *Storage) callRef(
	ctx context.Context,
	method, target, contentType string,
	body io.Reader,
) (fileRef, error) {
	var ref fileRef

	raw, err := s.callBytes(ctx, method, target, contentType, body)
	if err != nil {
		return ref, rerrors.Wrap(err)
	}

	err = json.Unmarshal(raw, &ref)
	if err != nil {
		return ref, rerrors.Wrap(err, "error decoding file reference")
	}

	return ref, nil
}

func (s *Storage) callBytes(
	ctx context.Context,
	method, target, contentType string,
	body io.Reader,
) ([]byte, error) {
	resp, err := s.call(ctx, method, target, contentType, body)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}
	defer closeResponse(ctx, resp, "google drive response")

	err = s.checkStatus(resp, "")
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, rerrors.Wrap(err, "error reading response")
	}

	return raw, nil
}

func (s *Storage) call(
	ctx context.Context,
	method, target, contentType string,
	body io.Reader,
) (*http.Response, error) {
	token, err := s.token()
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	req, err := http.NewRequestWithContext(ctx, method, target, body)
	if err != nil {
		return nil, rerrors.Wrap(err, "error building request")
	}

	req.Header.Set("Authorization", "Bearer "+token.AccessToken)
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error sending request")
	}

	return resp, nil
}

func (s *Storage) token() (*oauth2.Token, error) {
	if s.tokens == nil {
		return nil, rerrors.Wrap(ErrNotConnected)
	}

	token, err := s.tokens.Token()
	if err != nil {
		return nil, rerrors.Wrap(err, "error refreshing access token")
	}

	return token, nil
}

func (s *Storage) checkStatus(resp *http.Response, path string) error {
	if resp.StatusCode == http.StatusNotFound {
		s.forget(path)
		return rerrors.Wrap(ErrNotFound)
	}

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return rerrors.Wrap(ErrUnexpectedStatus, fmt.Sprintf("status %d", resp.StatusCode))
	}

	return nil
}

func (s *Storage) cached(path string) (string, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	id, ok := s.ids[path]

	return id, ok
}

func (s *Storage) remember(path, id string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.ids) >= maxCachedIds {
		s.ids = map[string]string{}
	}

	s.ids[path] = id
}

func (s *Storage) forget(path string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.ids, path)
}

func escapeQueryLiteral(value string) string {
	value = strings.ReplaceAll(value, `\`, `\\`)

	return strings.ReplaceAll(value, `'`, `\'`)
}

func closeResponse(ctx context.Context, resp *http.Response, subject string) {
	err := resp.Body.Close()
	if err != nil {
		log.Error(ctx).
			Err(err).
			Str("subject", subject).
			Msg("error closing response body")
	}
}
