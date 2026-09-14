package wapi

import (
	"fmt"
	"net/http"
	"path"
	"strings"
	"time"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/log"
)

// UploadTorrentFile accepts a .torrent file and caches it under an opaque
// handle, without submitting it for download. The frontend later lists its
// files (GetTorrentFile) and submits a selection (SubmitTorrentFile) via the
// TorrentAPI gRPC/REST service.
func (s *Server) UploadTorrentFile(writer http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	method := r.Method
	if method != http.MethodPost {
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	rc := http.NewResponseController(writer)
	err := rc.SetReadDeadline(time.Now().Add(uploadReadDeadline))
	if err != nil {
		log.Warn(ctx).Err(err).Msg("failed to set torrent file upload read deadline")
	}

	filename, _, filePart, err := extractUploadParts(r)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	if !strings.EqualFold(path.Ext(filename), torrentFileExtension) {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte("expected a " + torrentFileExtension + " file"))
		return
	}

	torrentFileBytes, err := readTorrentFile(filePart)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		_, _ = writer.Write([]byte(err.Error()))
		return
	}

	file, err := s.torrentService.UploadTorrentFile(ctx, torrentFileBytes)
	if err != nil {
		unwrapError(ctx, writer, rerrors.Wrap(err, "error in torrent service UploadTorrentFile"))
		return
	}

	response := fmt.Sprintf(`{"id": %q}`, file.Id)
	_, _ = writer.Write([]byte(response))
}
