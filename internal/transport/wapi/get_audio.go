package wapi

import (
	"fmt"
	"io"
	"net/http"
	"strconv"

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

	offset, limit, err := extractOffsetLimit(r, track.SizeBytes)
	if err != nil {
		unwrapError(w, err)
		return
	}

	stream, err := s.audioService.Get(ctx, fileId, offset, limit)
	if err != nil {
		unwrapError(w, err)
		return
	}

	if track.SizeBytes != 0 {
		w.Header().Set("Content-Range",
			fmt.Sprintf("bytes %d-%d/%d", offset, offset+limit, track.SizeBytes))
	}

	w.Header().
		Set("Content-Type", "audio/ogg")

	w.Header().
		Set("Content-Disposition",
			fmt.Sprintf("inline; filename=\"%s - %s.ogg\"", track.Artists, track.Title))
	w.Header().
		Set("Transfer-Encoding", "chunked")
	w.Header().
		Set("Content-Length", strconv.FormatInt(track.SizeBytes, 10))
	w.Header().
		Set("Accept-Ranges", "bytes")

	w.WriteHeader(http.StatusPartialContent)

	_, err = io.Copy(w, stream)
	if err != nil {
		log.Err(err).Msg("error streaming audio")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

}

func extractOffsetLimit(r *http.Request, total int64) (offset, limit int64, err error) {
	rangeHeader := r.Header.Get("Range")
	if rangeHeader == "" {
		return 0, 0, nil
	}

	// parse "bytes=start-end"
	var start, end int64
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

	return start, end - start, nil
}
