package webdav

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

const (
	methodMkcol = "MKCOL"
	methodCopy  = "COPY"

	dialTimeout           = 10 * time.Second
	tlsHandshakeTimeout   = 10 * time.Second
	responseHeaderTimeout = 2 * time.Minute
)

type Storage struct {
	client       *http.Client
	serverUrl    string
	rootSegments []string
	authHeader   string
}

func New(cfg domain.WebdavConfig) (storage.ContentStorage, error) {
	serverUrl := strings.TrimRight(strings.TrimSpace(cfg.Url), "/")
	if serverUrl == "" {
		return nil, rerrors.Wrap(ErrUrlRequired)
	}

	transport := newTransport()

	s := &Storage{
		client:       &http.Client{Transport: transport},
		serverUrl:    serverUrl,
		rootSegments: splitSegments(cfg.RootPath),
	}

	if cfg.Username != "" || cfg.Password != "" {
		credentials := base64.StdEncoding.EncodeToString([]byte(cfg.Username + ":" + cfg.Password))
		s.authHeader = "Basic " + credentials
	}

	return s, nil
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

func (s *Storage) Put(ctx context.Context, path string, content io.Reader) error {
	segments := splitSegments(path)

	err := s.ensureParents(ctx, segments)
	if err != nil {
		return rerrors.Wrap(err, "error ensuring parent collections")
	}

	resp, err := s.do(ctx, http.MethodPut, s.urlOf(segments), content, nil)
	if err != nil {
		return rerrors.Wrap(err, "error putting resource")
	}
	defer closeResponse(ctx, resp, "webdav put response")

	return checkStatus(resp)
}

func (s *Storage) Get(ctx context.Context, path string) (io.ReadCloser, error) {
	resp, err := s.do(ctx, http.MethodGet, s.urlOf(splitSegments(path)), nil, nil)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting resource")
	}

	err = checkStatus(resp)
	if err != nil {
		utils.CloseWithLog(resp.Body, "webdav get response")
		return nil, rerrors.Wrap(err)
	}

	return resp.Body, nil
}

func (s *Storage) Copy(ctx context.Context, fromPath, toPath string) error {
	dstSegments := splitSegments(toPath)

	err := s.ensureParents(ctx, dstSegments)
	if err != nil {
		return rerrors.Wrap(err, "error ensuring parent collections")
	}

	headers := http.Header{}
	headers.Set("Destination", s.urlOf(dstSegments))
	headers.Set("Overwrite", "T")

	resp, err := s.do(ctx, methodCopy, s.urlOf(splitSegments(fromPath)), nil, headers)
	if err != nil {
		return rerrors.Wrap(err, "error copying resource")
	}
	defer closeResponse(ctx, resp, "webdav copy response")

	return checkStatus(resp)
}

func (s *Storage) Delete(ctx context.Context, path string) error {
	resp, err := s.do(ctx, http.MethodDelete, s.urlOf(splitSegments(path)), nil, nil)
	if err != nil {
		return rerrors.Wrap(err, "error deleting resource")
	}
	defer closeResponse(ctx, resp, "webdav delete response")

	if resp.StatusCode == http.StatusNotFound {
		return nil
	}

	return checkStatus(resp)
}

func (s *Storage) Resolve(_ context.Context, path string) (domain.RemoteTarget, error) {
	target := domain.RemoteTarget{
		Url:                 s.urlOf(splitSegments(path)),
		AuthorizationHeader: s.authHeader,
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
	defer utils.CloseWithLog(reader, "webdav probe")

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

func (s *Storage) ensureParents(ctx context.Context, segments []string) error {
	if len(segments) == 0 {
		return nil
	}

	parents := make([]string, 0, len(s.rootSegments)+len(segments)-1)
	parents = append(parents, s.rootSegments...)
	parents = append(parents, segments[:len(segments)-1]...)

	for i := range parents {
		collectionUrl := s.serverUrl + "/" + escapeSegments(parents[:i+1])

		resp, err := s.do(ctx, methodMkcol, collectionUrl, nil, nil)
		if err != nil {
			return rerrors.Wrap(err, "error creating collection")
		}

		status := resp.StatusCode
		closeResponse(ctx, resp, "webdav mkcol response")

		if status == http.StatusMethodNotAllowed {
			continue
		}

		err = checkStatusCode(status)
		if err != nil {
			return rerrors.Wrap(err, "error creating collection")
		}
	}

	return nil
}

func (s *Storage) do(
	ctx context.Context,
	method, target string,
	body io.Reader,
	headers http.Header,
) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, target, body)
	if err != nil {
		return nil, rerrors.Wrap(err, "error building request")
	}

	for key, values := range headers {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	if s.authHeader != "" {
		req.Header.Set("Authorization", s.authHeader)
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error sending request")
	}

	return resp, nil
}

func (s *Storage) urlOf(segments []string) string {
	all := make([]string, 0, len(s.rootSegments)+len(segments))
	all = append(all, s.rootSegments...)
	all = append(all, segments...)

	if len(all) == 0 {
		return s.serverUrl
	}

	return s.serverUrl + "/" + escapeSegments(all)
}

func checkStatus(resp *http.Response) error {
	return checkStatusCode(resp.StatusCode)
}

func checkStatusCode(status int) error {
	if status == http.StatusNotFound {
		return rerrors.Wrap(ErrNotFound)
	}

	if status < http.StatusOK || status >= http.StatusMultipleChoices {
		return rerrors.Wrap(ErrUnexpectedStatus, fmt.Sprintf("status %d", status))
	}

	return nil
}

func splitSegments(path string) []string {
	parts := strings.Split(path, "/")
	segments := make([]string, 0, len(parts))

	for _, part := range parts {
		if part != "" {
			segments = append(segments, part)
		}
	}

	return segments
}

func escapeSegments(segments []string) string {
	escaped := make([]string, len(segments))
	for i, segment := range segments {
		escaped[i] = url.PathEscape(segment)
	}

	return strings.Join(escaped, "/")
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
