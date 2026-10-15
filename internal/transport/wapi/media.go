package wapi

import (
	"net/http"
	"path"
	"strings"
)

const (
	mediaPathPrefix       = "/wapi/media/"
	remoteRedirectPath    = "/_remote"
	remoteUrlHeader       = "X-Remote-Url"
	remoteAuthHeader      = "X-Remote-Authorization"
	imageCacheControl     = "public, max-age=86400"
	redirectHeaderAccel   = "X-Accel-Redirect"
	contentTypeHeader     = "Content-Type"
	cacheControlHeader    = "Cache-Control"
	pathParentDirSegment  = ".."
	pathSegmentsSeparator = "/"
	jpegMIMEType          = "image/jpeg"
)

func (s *Server) GetMedia(writer http.ResponseWriter, req *http.Request) {
	filePath := strings.TrimPrefix(req.URL.Path, mediaPathPrefix)
	if !isSafeMediaPath(filePath) {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	ctx := req.Context()

	target, err := s.mediaService.Resolve(ctx, filePath)
	if err != nil {
		unwrapError(ctx, writer, err)
		return
	}

	header := writer.Header()
	header.Set(redirectHeaderAccel, remoteRedirectPath)
	header.Set(remoteUrlHeader, target.Url)
	if target.AuthorizationHeader != "" {
		header.Set(remoteAuthHeader, target.AuthorizationHeader)
	}

	ext := path.Ext(filePath)
	imageMIMEType, isImage := imageMIMETypes[strings.ToLower(ext)]
	if isImage {
		header.Set(contentTypeHeader, imageMIMEType)
		header.Set(cacheControlHeader, imageCacheControl)
	} else {
		header.Set(contentTypeHeader, audioMIMEType(ext))
	}

	writer.WriteHeader(http.StatusOK)
}

var imageMIMETypes = map[string]string{
	".jpg":  jpegMIMEType,
	".jpeg": jpegMIMEType,
	".png":  "image/png",
	".webp": "image/webp",
	".gif":  "image/gif",
}

func isSafeMediaPath(filePath string) bool {
	if filePath == "" {
		return false
	}

	for _, segment := range strings.Split(filePath, pathSegmentsSeparator) {
		if segment == pathParentDirSegment {
			return false
		}
	}

	return true
}
