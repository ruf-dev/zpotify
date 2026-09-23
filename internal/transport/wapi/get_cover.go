package wapi

import (
	"io"
	"net/http"
	"strconv"
	"strings"
	"syscall"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/utils"
)

// GetCover serves a song's cover art unauthenticated, over a public URL -
// Telegram fetches inline result thumbnails server-side, with no auth
// headers, so this mirrors GetAudio's unauthenticated pattern.
func (s *Server) GetCover(writer http.ResponseWriter, req *http.Request) {
	ctx := req.Context()

	songIdStr := req.URL.Query().Get("songId")

	songId, err := strconv.ParseInt(songIdStr, 10, 64)
	if err != nil {
		unwrapError(ctx, writer, err)
		return
	}

	stream, ext, ok, err := s.audioService.GetCoverImage(ctx, songId)
	if err != nil {
		unwrapError(ctx, writer, err)
		return
	}
	if !ok {
		writer.WriteHeader(http.StatusNotFound)
		return
	}
	defer utils.CloseWithLog(stream, "cover stream")

	writer.Header().Set("Content-Type", imageMIMEType(ext))
	writer.Header().Set("Cache-Control", "public, max-age=86400")

	_, err = io.Copy(writer, stream)
	if err != nil {
		if !rerrors.Is(err, syscall.EPIPE) {
			log.Err(err).Msg("error streaming cover image")
		}
		return
	}
}

func imageMIMEType(ext string) string {
	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	default:
		return "application/octet-stream"
	}
}
