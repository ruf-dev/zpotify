package wapi

import (
	"fmt"
	"io"
	"net/http"

	"github.com/rs/zerolog/log"
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

	stream, err := s.audioService.Stream(ctx, fileId)
	if err != nil {
		unwrapError(w, err)
		return
	}

	w.Header().Set("Content-Type", "audio/ogg")
	w.Header().Set("Content-Disposition",
		fmt.Sprintf("inline; filename=\"%s - %s.ogg\"", track.Artists, track.Title))
	w.Header().Set("Transfer-Encoding", "chunked")

	_, err = io.Copy(w, stream)
	if err != nil {
		log.Err(err).Msg("error streaming audio")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
