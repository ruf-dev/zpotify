package wapi

import (
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/rs/zerolog"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/log"
)

// uploadReadDeadline bounds how long an upload request body may go without
// the client sending any data. Without it, a client that vanishes mid-upload
// (dropped wifi, sleeping laptop, killed tab) without a clean TCP close
// leaves the handler goroutine blocked in an unbounded Read forever.
const uploadReadDeadline = 5 * time.Minute

func (s *Server) Upload(writer http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	method := r.Method
	if method != http.MethodPost {
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	rc := http.NewResponseController(writer)
	err := rc.SetReadDeadline(time.Now().Add(uploadReadDeadline))
	if err != nil {
		log.Warn(ctx).Err(err).Msg("failed to set upload read deadline")
	}

	filename, folderName, filePart, err := extractUploadParts(r)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	id, err := s.fileService.SaveFile(ctx, filename, folderName, filePart)
	if err != nil {
		unwrapError(ctx, writer, rerrors.Wrap(err, "error in file service StoreToLocalStorage"))
		return
	}

	log.AddField(ctx, func(e *zerolog.Event) *zerolog.Event {
		return e.
			Str("filename", filename).
			Int64("file_id", id)
	})

	response := fmt.Sprintf(`{"id": %d}`, id)
	_, _ = writer.Write([]byte(response))
}

// extractUploadParts reads the multipart form on r and returns the uploaded
// file's name and content, plus an optional folder name.
//
// The frontend sends the "folder" text field before the "file" field, so the
// loop accumulates folderName on earlier iterations and returns as soon as
// it reaches the "file" part.
func extractUploadParts(r *http.Request) (string, string, io.Reader, error) {
	_, params, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil {
		return "", "", nil, rerrors.Wrap(err, "invalid content-type")
	}

	mr := multipart.NewReader(r.Body, params["boundary"])

	var folderName string
	for {
		part, err := mr.NextPart()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", "", nil, rerrors.Wrap(err, "error reading multipart")
		}

		if part.FormName() == "folder" {
			folderNameBytes, readErr := io.ReadAll(part)
			if readErr != nil {
				return "", "", nil, rerrors.Wrap(readErr, "error reading folder field")
			}
			folderName = strings.TrimSpace(string(folderNameBytes))
			continue
		}

		if part.FormName() != "file" {
			continue
		}

		return part.FileName(), folderName, part, nil
	}

	return "", "", nil, rerrors.New("no file field in multipart form")
}
