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

	ilog "go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/utils"
)

type GetAudioReq struct {
	FileId string
}

func (s *Server) GetAudio(writer http.ResponseWriter, req *http.Request) {
	fileIdStr := req.URL.Query().Get("fileId")

	ctx := req.Context()

	start, end, err := extractStartEnd(req)
	if err != nil {
		unwrapError(ctx, writer, err)
		return
	}

	fileId, err := strconv.Atoi(fileIdStr)
	if err != nil {
		unwrapError(ctx, writer, err)
		return
	}

	track, stream, err := s.audioService.Get(int64(fileId), start, end)
	if err != nil {
		unwrapError(ctx, writer, err)
		return
	}

	defer utils.CloseWithLog(stream, "audio stream")
	if end == -1 {
		end = track.SizeBytes - 1
	}

	writer.Header().Set("Content-Range",
		fmt.Sprintf("bytes %d-%d/%d", start, end, track.SizeBytes))

	ext := path.Ext(track.FilePath)
	writer.Header().
		Set("Content-Type", audioMIMEType(ext))

	writer.Header().
		Set("Content-Disposition",
			fmt.Sprintf("inline; filename=\"%s - %s%s\"", "AlexSkilled", track.Title, ext))
	writer.Header().
		Set("Content-Length", strconv.FormatInt(end-start+1, 10))
	writer.Header().
		Set("Accept-Ranges", "bytes")

	writer.WriteHeader(http.StatusPartialContent)

	bytesWritten, err := io.Copy(writer, stream)
	if err != nil {
		if !rerrors.Is(err, syscall.EPIPE) {
			log.Err(err).
				Msg("error streaming audio")
			writer.WriteHeader(http.StatusInternalServerError)
		}

		return
	}

	ilog.AddField(req.Context(), func(e *zerolog.Event) *zerolog.Event {
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
	_, err = fmt.Sscanf(rangeHeader, "bytes=%d-%d", &start, &end)
	if err != nil {
		_, err = fmt.Sscanf(rangeHeader, "bytes=%d-", &start)
		if err != nil {
			return 0, 0, rerrors.New("invalid range", http.StatusRequestedRangeNotSatisfiable)
		}
		end = -1
	}

	if start > end && end != -1 {
		return 0, 0, rerrors.New("invalid range", http.StatusRequestedRangeNotSatisfiable)
	}

	return start, end, nil
}
