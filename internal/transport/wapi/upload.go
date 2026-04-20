package wapi

import (
	"fmt"
	"net/http"

	"go.redsock.ru/rerrors"
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
	defer file.Close()

	id, err := s.fileService.SaveFile(ctx, header.Filename, file)
	if err != nil {
		unwrapError(w, rerrors.Wrap(err, "error in file service StoreToLocalStorage"))
		return
	}

	response := fmt.Sprintf(`{"id": %d}`, id)
	_, _ = w.Write([]byte(response))
}
