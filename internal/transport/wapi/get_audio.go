package wapi

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
	"syscall"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"
)

type GetAudioReq struct {
	FileId string
}

func (s *Server) GetAudio(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	fileId := r.URL.Query().Get("fileId")

	track, err := s.audioService.GetInfo(ctx, fileId)
	if err != nil {
		unwrapError(w, err)
		return
	}

	start, end, err := extractStartEnd(r, track.SizeBytes)
	if err != nil {
		unwrapError(w, err)
		return
	}

	stream, err := s.audioService.Get(ctx, fileId, start, end)
	if err != nil {
		unwrapError(w, err)
		return
	}

	defer stream.Close()

	w.Header().Set("Content-Range",
		fmt.Sprintf("bytes %d-%d/%d", start, end, track.SizeBytes))

	w.Header().
		Set("Content-Type", "audio/ogg")

	w.Header().
		Set("Content-Disposition",
			fmt.Sprintf("inline; filename=\"%s - %s.ogg\"", track.Artists, track.Title))
	w.Header().
		Set("Content-Length", strconv.FormatInt(end-start+1, 10))
	w.Header().
		Set("Accept-Ranges", "bytes")

	w.WriteHeader(http.StatusPartialContent)

	_, err = io.Copy(w, stream)
	if err != nil {
		if !rerrors.Is(err, syscall.EPIPE) {
			log.Err(err).
				Msg("error streaming audio")
			w.WriteHeader(http.StatusInternalServerError)
		}

		return
	}

}

func extractStartEnd(r *http.Request, total int64) (start, end int64, err error) {
	rangeHeader := r.Header.Get("Range")
	if rangeHeader == "" {
		return 0, total - 1, nil
	}

	// parse "bytes=start-end"
	if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-%d", &start, &end); err != nil {
		if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-", &start); err != nil {
			return 0, 0, rerrors.New("invalid range", http.StatusRequestedRangeNotSatisfiable)
		}
		end = total - 1
	}

	if end >= total {
		end = total - 1
	}
	if start > end {
		return 0, 0, rerrors.New("invalid range", http.StatusRequestedRangeNotSatisfiable)
	}

	return start, end, nil
}
