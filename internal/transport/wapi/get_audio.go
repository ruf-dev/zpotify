package wapi

import (
	"fmt"
	"io"
	"net/http"
	"path"
	"strconv"
	"strings"
	"syscall"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/middleware"
)

type GetAudioReq struct {
	FileId string
}

func (s *Server) GetAudio(w http.ResponseWriter, r *http.Request) {
	fileIdStr := r.URL.Query().Get("fileId")

	start, end, err := extractStartEnd(r)
	if err != nil {
		unwrapError(w, err)
		return
	}

	fileId, err := strconv.Atoi(fileIdStr)
	if err != nil {
		unwrapError(w, err)
		return
	}

	track, stream, err := s.audioService.Get(int64(fileId), start, end)
	if err != nil {
		unwrapError(w, err)
		return
	}

	defer stream.Close()
	if end == -1 {
		end = track.SizeBytes - 1
	}

	w.Header().Set("Content-Range",
		fmt.Sprintf("bytes %d-%d/%d", start, end, track.SizeBytes))

	ext := path.Ext(track.FilePath)
	w.Header().
		Set("Content-Type", audioMIMEType(ext))

	w.Header().
		Set("Content-Disposition",
			fmt.Sprintf("inline; filename=\"%s - %s%s\"", "AlexSkilled", track.Title, ext))
	w.Header().
		Set("Content-Length", strconv.FormatInt(end-start+1, 10))
	w.Header().
		Set("Accept-Ranges", "bytes")

	w.WriteHeader(http.StatusPartialContent)

	bytesWritten, err := io.Copy(w, stream)
	if err != nil {
		if !rerrors.Is(err, syscall.EPIPE) {
			log.Err(err).
				Msg("error streaming audio")
			w.WriteHeader(http.StatusInternalServerError)
		}

		return
	}

	middleware.AddLogField(r.Context(), func(e *zerolog.Event) *zerolog.Event {
		return e.
			Str("file_id", fileIdStr).
			Int64("range_start", start).
			Int64("range_end", end).
			Int64("bytes_sent", bytesWritten).
			Str("content_type", audioMIMEType(path.Ext(track.FilePath)))
	})
}

func audioMIMEType(ext string) string {
	switch strings.ToLower(ext) {
	case ".mp3":
		return "audio/mpeg"
	case ".flac":
		return "audio/flac"
	case ".aac":
		return "audio/aac"
	case ".ogg", ".oga":
		return "audio/ogg"
	case ".wav":
		return "audio/wav"
	case ".m4a":
		return "audio/x-m4a"
	default:
		return "application/octet-stream"
	}
}

func extractStartEnd(r *http.Request) (start, end int64, err error) {
	rangeHeader := r.Header.Get("Range")
	if rangeHeader == "" {
		return 0, -1, nil
	}

	// parse "bytes=start-end"
	if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-%d", &start, &end); err != nil {
		if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-", &start); err != nil {
			return 0, 0, rerrors.New("invalid range", http.StatusRequestedRangeNotSatisfiable)
		}
		end = -1
	}

	if start > end && end != -1 {
		return 0, 0, rerrors.New("invalid range", http.StatusRequestedRangeNotSatisfiable)
	}

	return start, end, nil
}
