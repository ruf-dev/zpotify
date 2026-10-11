package v1

import (
	"encoding/base64"
	"net/url"
	"regexp"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/prowlarr"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

const (
	torrentSearchMagnetPrefix   = "m:"
	torrentSearchProxyPrefix    = "p:"
	torrentSearchMagnetScheme   = "magnet:"
	torrentSearchApiKeyQueryKey = "apikey"
)

// Restricts proxied downloads to Prowlarr's download endpoint so a crafted id
// cannot make the server call arbitrary Prowlarr API paths with its key.
var torrentSearchDownloadPath = regexp.MustCompile(`^/\d+/download$`)

type torrentSearchResultSource struct {
	magnetUri            string
	downloadPathAndQuery string
}

func torrentSearchResultIdOf(release prowlarr.Release, baseUrl *url.URL) (string, bool) {
	if strings.HasPrefix(release.MagnetUrl, torrentSearchMagnetScheme) {
		return encodeTorrentSearchResultId(torrentSearchMagnetPrefix + release.MagnetUrl), true
	}

	if release.DownloadUrl != "" {
		return proxyTorrentSearchResultId(release.DownloadUrl, baseUrl)
	}

	if release.MagnetUrl != "" {
		return proxyTorrentSearchResultId(release.MagnetUrl, baseUrl)
	}

	if release.InfoHash != "" {
		magnetUri := magnetUriOfInfoHash(release.InfoHash, release.Title)
		return encodeTorrentSearchResultId(torrentSearchMagnetPrefix + magnetUri), true
	}

	return "", false
}

func proxyTorrentSearchResultId(rawUrl string, baseUrl *url.URL) (string, bool) {
	parsed, err := url.Parse(rawUrl)
	if err != nil {
		return "", false
	}

	path := parsed.Path
	basePath := strings.TrimRight(baseUrl.Path, "/")
	if basePath != "" {
		path = strings.TrimPrefix(path, basePath)
	}

	query := parsed.Query()
	query.Del(torrentSearchApiKeyQueryKey)

	pathAndQuery := path
	if len(query) > 0 {
		pathAndQuery += "?" + query.Encode()
	}

	return encodeTorrentSearchResultId(torrentSearchProxyPrefix + pathAndQuery), true
}

func magnetUriOfInfoHash(infoHash string, title string) string {
	return torrentSearchMagnetScheme + "?xt=urn:btih:" + strings.ToLower(infoHash) + "&dn=" + url.QueryEscape(title)
}

func encodeTorrentSearchResultId(payload string) string {
	return base64.RawURLEncoding.EncodeToString([]byte(payload))
}

func parseTorrentSearchResultId(id string) (torrentSearchResultSource, error) {
	decoded, err := base64.RawURLEncoding.DecodeString(id)
	if err != nil {
		return torrentSearchResultSource{}, rerrors.Wrap(service_errors.ErrInvalidTorrentSearchResultId)
	}
	payload := string(decoded)

	magnetUri, isMagnet := strings.CutPrefix(payload, torrentSearchMagnetPrefix)
	if isMagnet {
		return parseMagnetSource(magnetUri)
	}

	pathAndQuery, isProxy := strings.CutPrefix(payload, torrentSearchProxyPrefix)
	if isProxy {
		return parseProxySource(pathAndQuery)
	}

	return torrentSearchResultSource{}, rerrors.Wrap(service_errors.ErrInvalidTorrentSearchResultId)
}

func parseMagnetSource(magnetUri string) (torrentSearchResultSource, error) {
	if !strings.HasPrefix(magnetUri, torrentSearchMagnetScheme) {
		return torrentSearchResultSource{}, rerrors.Wrap(service_errors.ErrInvalidTorrentSearchResultId)
	}

	return torrentSearchResultSource{magnetUri: magnetUri}, nil
}

func parseProxySource(pathAndQuery string) (torrentSearchResultSource, error) {
	path, _, _ := strings.Cut(pathAndQuery, "?")
	if !torrentSearchDownloadPath.MatchString(path) {
		return torrentSearchResultSource{}, rerrors.Wrap(service_errors.ErrInvalidTorrentSearchResultId)
	}

	return torrentSearchResultSource{downloadPathAndQuery: pathAndQuery}, nil
}
