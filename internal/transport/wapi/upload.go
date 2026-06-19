package wapi

import (
	"fmt"
	"net/http"

	"github.com/rs/zerolog"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/middleware"
	"go.zpotify.ru/zpotify/internal/utils"
)

func (s *Server) Upload(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	method := r.Method
	if method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte("error getting file from form: " + err.Error()))
		return
	}
	defer utils.CloseWithLog(file, "File "+header.Filename+" uploaded by user")

	id, err := s.fileService.SaveFile(ctx, header.Filename, file)
	if err != nil {
		unwrapError(w, rerrors.Wrap(err, "error in file service StoreToLocalStorage"))
		return
	}

	middleware.AddLogField(ctx, func(e *zerolog.Event) *zerolog.Event {
		return e.
			Str("filename", header.Filename).
			Int64("size_bytes", header.Size).
			Int64("file_id", id)
	})

	response := fmt.Sprintf(`{"id": %d}`, id)
	_, _ = w.Write([]byte(response))
}
