package wapi

import (
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net/http"

	"github.com/rs/zerolog"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/log"
)

func (s *Server) Upload(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	method := r.Method
	if method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	filename, filePart, err := extractFilePart(r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(err.Error()))
		return
	}

	id, err := s.fileService.SaveFile(ctx, filename, filePart)
	if err != nil {
		unwrapError(ctx, w, rerrors.Wrap(err, "error in file service StoreToLocalStorage"))
		return
	}

	log.AddField(ctx, func(e *zerolog.Event) *zerolog.Event {
		return e.
			Str("filename", filename).
			Int64("file_id", id)
	})

	response := fmt.Sprintf(`{"id": %d}`, id)
	_, _ = w.Write([]byte(response))
}

func extractFilePart(r *http.Request) (string, io.Reader, error) {
	_, params, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil {
		return "", nil, rerrors.Wrap(err, "invalid content-type")
	}

	mr := multipart.NewReader(r.Body, params["boundary"])
	for {
		part, err := mr.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", nil, rerrors.Wrap(err, "error reading multipart")
		}

		if part.FormName() != "file" {
			continue
		}

		return part.FileName(), part, nil
	}

	return "", nil, rerrors.New("no file field in multipart form")
}
