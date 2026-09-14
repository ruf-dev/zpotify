package wapi

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/rs/zerolog"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

// maxTorrentFileBytes caps how much of the uploaded part is read. A .torrent
// file is a bencoded metadata blob - kilobytes for most torrents, and well
// under this bound even for very large multi-file ones.
const maxTorrentFileBytes = 10 << 20

// torrentFileExtension is the only extension accepted by this endpoint.
const torrentFileExtension = ".torrent"

func (s *Server) UploadTorrent(writer http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	method := r.Method
	if method != http.MethodPost {
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	rc := http.NewResponseController(writer)
	err := rc.SetReadDeadline(time.Now().Add(uploadReadDeadline))
	if err != nil {
		log.Warn(ctx).Err(err).Msg("failed to set torrent upload read deadline")
	}

	filename, folderName, filePart, err := extractUploadParts(r)
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

	id, err := s.torrentService.SubmitTorrent(ctx, torrentFileBytes, folderName)
	if err != nil {
		if errors.Is(err, service_errors.ErrTorrentAlreadyExists) {
			writeExistingTorrentJob(writer, id)
			return
		}

		unwrapError(ctx, writer, rerrors.Wrap(err, "error in torrent service SubmitTorrent"))
		return
	}

	log.AddField(ctx, func(e *zerolog.Event) *zerolog.Event {
		return e.
			Str("filename", filename).
			Int64("torrent_job_id", id)
	})

	response := fmt.Sprintf(`{"id": %d}`, id)
	_, _ = writer.Write([]byte(response))
}

// writeExistingTorrentJob responds with the id of the caller's pre-existing
// torrent download, so the frontend can redirect into managing it instead of
// showing a bare conflict error.
func writeExistingTorrentJob(writer http.ResponseWriter, existingJobId int64) {
	writer.WriteHeader(http.StatusConflict)
	response := fmt.Sprintf(`{"id": %d}`, existingJobId)
	_, _ = writer.Write([]byte(response))
}

// readTorrentFile reads the uploaded part, refusing anything larger than a
// plausible .torrent file rather than buffering an arbitrary upload.
func readTorrentFile(filePart io.Reader) ([]byte, error) {
	limited := io.LimitReader(filePart, maxTorrentFileBytes+1)

	torrentFileBytes, err := io.ReadAll(limited)
	if err != nil {
		return nil, rerrors.Wrap(err, "error reading torrent file")
	}

	if len(torrentFileBytes) == 0 {
		return nil, rerrors.New("torrent file is empty")
	}

	if len(torrentFileBytes) > maxTorrentFileBytes {
		return nil, rerrors.New("torrent file is too large")
	}

	return torrentFileBytes, nil
}
