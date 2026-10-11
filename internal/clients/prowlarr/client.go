package prowlarr

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/utils"
)

const (
	searchTimeout = 30 * time.Second
	pingTimeout   = 5 * time.Second
	grabTimeout   = 30 * time.Second

	maxSearchResponseBytes = 16 << 20
	maxTorrentBytes        = 10 << 20
	maxStatusResponseBytes = 1 << 20

	searchCategoryAudio = "3000"
	searchLimit         = 100
)

type Release struct {
	Guid        string
	Title       string
	SizeBytes   int64
	Indexer     string
	PublishedAt time.Time
	Protocol    string
	// Seeders is nil when the indexer does not report it.
	Seeders     *int64
	InfoHash    string
	MagnetUrl   string
	DownloadUrl string
}

// Grab is what a Prowlarr download link resolves to: exactly one field is set.
type Grab struct {
	MagnetUri    string
	TorrentBytes []byte
}

type Client struct {
	baseUrl    *url.URL
	apiKey     string
	httpClient *http.Client
}

type wireRelease struct {
	Guid        string `json:"guid"`
	Title       string `json:"title"`
	Size        int64  `json:"size"`
	Indexer     string `json:"indexer"`
	PublishDate string `json:"publishDate"`
	Protocol    string `json:"protocol"`
	Seeders     *int64 `json:"seeders"`
	InfoHash    string `json:"infoHash"`
	MagnetUrl   string `json:"magnetUrl"`
	DownloadUrl string `json:"downloadUrl"`
}

func New(baseUrl string, apiKey string) (*Client, error) {
	parsed, err := url.Parse(baseUrl)
	if err != nil {
		return nil, rerrors.Wrap(err, "error parsing prowlarr url")
	}

	httpClient := &http.Client{CheckRedirect: refuseRedirect}

	c := &Client{
		baseUrl:    parsed,
		apiKey:     apiKey,
		httpClient: httpClient,
	}

	return c, nil
}

func refuseRedirect(_ *http.Request, _ []*http.Request) error {
	return http.ErrUseLastResponse
}

func (c *Client) BaseUrl() *url.URL {
	return c.baseUrl
}

func (c *Client) Search(ctx context.Context, query string) ([]Release, error) {
	ctx, cancel := context.WithTimeout(ctx, searchTimeout)
	defer cancel()

	target := c.baseUrl.JoinPath("api", "v1", "search")
	params := url.Values{}
	params.Set("query", query)
	params.Set("type", "search")
	params.Set("categories", searchCategoryAudio)
	params.Set("limit", strconv.Itoa(searchLimit))
	target.RawQuery = params.Encode()

	res, err := c.fetch(ctx, target, true, maxSearchResponseBytes)
	if err != nil {
		return nil, rerrors.Wrap(err, "error requesting prowlarr search")
	}

	if res.status != http.StatusOK {
		return nil, rerrors.Wrap(errUnexpectedStatus, fmt.Sprintf("unexpected status: %d", res.status))
	}

	var wire []wireRelease
	err = json.Unmarshal(res.body, &wire)
	if err != nil {
		return nil, rerrors.Wrap(err, "error decoding prowlarr search response")
	}

	return mapReleases(wire), nil
}

func (c *Client) Ping(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, pingTimeout)
	defer cancel()

	target := c.baseUrl.JoinPath("api", "v1", "system", "status")

	res, err := c.fetch(ctx, target, true, maxStatusResponseBytes)
	if err != nil {
		return rerrors.Wrap(err, "error requesting prowlarr status")
	}

	if res.status != http.StatusOK {
		return rerrors.Wrap(errUnexpectedStatus, fmt.Sprintf("unexpected status: %d", res.status))
	}

	return nil
}

func (c *Client) Grab(ctx context.Context, downloadPathAndQuery string) (Grab, error) {
	ctx, cancel := context.WithTimeout(ctx, grabTimeout)
	defer cancel()

	relative, err := url.Parse(downloadPathAndQuery)
	if err != nil {
		return Grab{}, rerrors.Wrap(err, "error parsing prowlarr download path")
	}

	target := c.baseUrl.JoinPath(relative.Path)
	params := relative.Query()
	params.Set("apikey", c.apiKey)
	target.RawQuery = params.Encode()

	res, err := c.fetch(ctx, target, false, maxTorrentBytes)
	if err != nil {
		return Grab{}, rerrors.Wrap(err, "error requesting prowlarr download")
	}

	return res.toGrab()
}

type fetched struct {
	status      int
	location    string
	body        []byte
	isTruncated bool
}

func (f fetched) toGrab() (Grab, error) {
	if f.status >= http.StatusMultipleChoices && f.status < http.StatusBadRequest {
		if strings.HasPrefix(f.location, "magnet:") {
			return Grab{MagnetUri: f.location}, nil
		}

		return Grab{}, rerrors.Wrap(errUnexpectedRedirect, fmt.Sprintf("unexpected status: %d", f.status))
	}

	if f.status != http.StatusOK {
		return Grab{}, rerrors.Wrap(errUnexpectedStatus, fmt.Sprintf("unexpected status: %d", f.status))
	}

	if f.isTruncated {
		return Grab{}, rerrors.Wrap(errTorrentTooLarge)
	}

	return Grab{TorrentBytes: f.body}, nil
}

// fetch performs a GET and reads at most limit bytes of a 200 body; the body is always closed.
func (c *Client) fetch(ctx context.Context, target *url.URL, withApiKeyHeader bool, limit int64) (fetched, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target.String(), nil)
	if err != nil {
		return fetched{}, rerrors.Wrap(err, "error building prowlarr request")
	}
	if withApiKeyHeader {
		req.Header.Set("X-Api-Key", c.apiKey)
	}

	resp, err := c.httpClient.Do(req) //nolint:bodyclose // closed below via utils.CloseWithLog
	if err != nil {
		// url.Error carries the request URL, which holds the apikey query param on downloads.
		var urlErr *url.Error
		if errors.As(err, &urlErr) {
			err = urlErr.Err
		}

		return fetched{}, rerrors.Wrap(err, "error performing prowlarr request")
	}
	defer utils.CloseWithLog(resp.Body, "prowlarr response body")

	res := fetched{
		status:   resp.StatusCode,
		location: resp.Header.Get("Location"),
	}
	if resp.StatusCode != http.StatusOK {
		return res, nil
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, limit+1))
	if err != nil {
		return fetched{}, rerrors.Wrap(err, "error reading prowlarr response body")
	}

	res.isTruncated = int64(len(body)) > limit
	if res.isTruncated {
		body = body[:limit]
	}
	res.body = body

	return res, nil
}

func mapReleases(wire []wireRelease) []Release {
	releases := make([]Release, 0, len(wire))
	for _, w := range wire {
		publishedAt, err := time.Parse(time.RFC3339, w.PublishDate)
		if err != nil {
			publishedAt = time.Time{}
		}

		release := Release{
			Guid:        w.Guid,
			Title:       w.Title,
			SizeBytes:   w.Size,
			Indexer:     w.Indexer,
			PublishedAt: publishedAt,
			Protocol:    w.Protocol,
			Seeders:     w.Seeders,
			InfoHash:    w.InfoHash,
			MagnetUrl:   w.MagnetUrl,
			DownloadUrl: w.DownloadUrl,
		}
		releases = append(releases, release)
	}

	return releases
}
