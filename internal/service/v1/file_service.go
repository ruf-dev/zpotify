package v1

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"path"
	"strings"

	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/audio_parsers"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/user_errors"
	"go.zpotify.ru/zpotify/internal/utils"
)

func (s *FileService) CheckFilesByHashes(ctx context.Context, hashes []string) ([]domain.FoundFileByHash, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return nil, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	result := make([]domain.FoundFileByHash, 0, len(hashes))
	for _, hash := range hashes {
		file, err := s.storage.GetByHash(ctx, hash, uCtx.UserId)
		if err != nil {
			if errors.Is(err, storage.ErrNotFound) {
				continue
			}
			return nil, rerrors.Wrap(err, "error checking hash")
		}
		found := domain.FoundFileByHash{
			Hash:   hash,
			FileId: file.Id,
		}

		song, songErr := s.songStorage.GetByFileId(ctx, file.Id)
		if songErr != nil && !errors.Is(songErr, storage.ErrNotFound) {
			return nil, rerrors.Wrap(songErr, "error getting song for file")
		}
		if songErr == nil {
			found.SongId = &song.SongBase.Id
		}

		result = append(result, found)
	}

	return result, nil
}

func (s *FileService) CheckSongsByFileIds(ctx context.Context, fileIds []int64) ([]domain.FoundSongByFileId, error) {
	_, ok := user_context.GetUserContext(ctx)
	if !ok {
		return nil, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	result := make([]domain.FoundSongByFileId, 0, len(fileIds))
	for _, fileId := range fileIds {
		song, err := s.songStorage.GetByFileId(ctx, fileId)
		if err != nil {
			if errors.Is(err, storage.ErrNotFound) {
				continue
			}
			return nil, rerrors.Wrap(err, "error checking song for file")
		}

		found := domain.FoundSongByFileId{
			FileId: fileId,
			SongId: song.SongBase.Id,
		}
		result = append(result, found)
	}

	return result, nil
}

// coverImageExtensions are the image formats accepted for cover art uploads.
// The upload endpoint is shared between audio tracks and cover images, so an
// upload is allowed when it is either a parsable audio file or one of these.
var coverImageExtensions = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".png":  {},
	".webp": {},
	".gif":  {},
}

// isSupportedUpload reports whether the file may be uploaded: a parsable audio
// format (mp3/flac/aac/m4a) or a supported cover image.
func isSupportedUpload(name string) bool {
	if audio_parsers.IsSupported(name) {
		return true
	}
	ext := strings.ToLower(path.Ext(name))
	_, ok := coverImageExtensions[ext]
	return ok
}

// isCoverImageUpload reports whether the file is one of the supported cover
// image formats, as opposed to an audio track.
func isCoverImageUpload(name string) bool {
	ext := strings.ToLower(path.Ext(name))
	_, ok := coverImageExtensions[ext]
	return ok
}

// sniffHeaderSize is the number of bytes http.DetectContentType inspects to
// determine a file's content type.
const sniffHeaderSize = 512

// verifyImage checks that r actually decodes as the image format implied by
// ext. The stdlib has no webp decoder, so webp is verified via content
// sniffing instead of a full decode.
func verifyImage(ext string, r io.Reader) error {
	if ext == ".webp" {
		header := make([]byte, sniffHeaderSize)
		n, err := io.ReadFull(r, header)
		if err != nil && !errors.Is(err, io.ErrUnexpectedEOF) && !errors.Is(err, io.EOF) {
			return rerrors.Wrap(err, "error reading file header")
		}

		contentType := http.DetectContentType(header[:n])
		if contentType != "image/webp" {
			return rerrors.Wrap(service_errors.ErrInvalidImageFile, "file is not a valid webp image")
		}

		return nil
	}

	_, _, err := image.DecodeConfig(r)
	if err != nil {
		return rerrors.Wrap(service_errors.ErrInvalidImageFile, "file is not a decodable image")
	}

	return nil
}

// countingWriter tracks how many bytes have been written through it, used to
// measure an upload's real size while it is streamed to disk.
type countingWriter struct {
	n int64
}

func (c *countingWriter) Write(p []byte) (int, error) {
	c.n += int64(len(p))
	return len(p), nil
}

// stagingNamePrefix marks a file as an in-progress upload whose final name
// has not been decided yet. It starts with a dot so it can never collide
// with any real uploaded track/cover name and reads clearly as transient if
// ever observed directly.
const stagingNamePrefix = ".upload-"

// stagingTokenBytes is the number of random bytes used to build a staging
// file name, making per-upload staging paths unique without any
// coordination between concurrent uploads.
const stagingTokenBytes = 16

// newStagingFileName generates a random staging file name (preserving ext)
// to write an in-progress upload to before its content hash is known and
// its real, collision-checked target path is decided.
func newStagingFileName(ext string) (string, error) {
	token := make([]byte, stagingTokenBytes)
	_, err := rand.Read(token)
	if err != nil {
		return "", rerrors.Wrap(err, "error generating random staging token")
	}

	return stagingNamePrefix + hex.EncodeToString(token) + ext, nil
}

type FileService struct {
	storage     storage.FileMetaStorage
	songStorage storage.SongStorage

	binaryStorage storage.BinaryFileStorage
	jobs          storage.JobStorage
}

func NewFileService(s storage.Storage, binaryStorage storage.BinaryFileStorage) *FileService {
	return &FileService{
		storage:       s.FileMeta(),
		songStorage:   s.SongsStorage(),
		binaryStorage: binaryStorage,
		jobs:          s.Jobs(),
	}
}

func (s *FileService) SaveFile(ctx context.Context, fileNameWithExt string, folderName string, content io.Reader) (int64, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return 0, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	if !uCtx.Permissions.CanUpload {
		return 0, rerrors.Wrap(user_errors.ErrPermissionDenied, "not allowed to upload file")
	}

	if !isSupportedUpload(fileNameWithExt) {
		return 0, rerrors.Wrap(service_errors.ErrUnsupportedUploadFormat, path.Ext(fileNameWithExt))
	}

	folderRelDir := ""
	if folderName != "" {
		sanitizedFolderName, sanitizeErr := utils.SanitizeFolderName(folderName)
		if sanitizeErr != nil {
			return 0, rerrors.Wrap(sanitizeErr, "error sanitizing folder name")
		}
		folderRelDir = sanitizedFolderName
	}

	files, err := s.binaryStorage.ListFiles(ctx, uCtx.UserId)
	if err != nil {
		return 0, rerrors.Wrap(err, "error listing temp files for limit check")
	}
	if int64(len(files)) >= uCtx.Permissions.MaxPendingTracks {
		return 0, service_errors.ErrPendingTrackLimitReached
	}

	uploadReq := uploadRequest{
		UserId:              uCtx.UserId,
		FileNameWithExt:     fileNameWithExt,
		FolderRelDir:        folderRelDir,
		Content:             content,
		MaxSongSizeBytes:    uCtx.Permissions.MaxSongSizeBytes,
		MaxTotalUploadBytes: uCtx.Permissions.MaxTotalUploadBytes,
	}

	pipeline := s.newUploadPipeline()

	id, _, err := pipeline.store(ctx, uploadReq)
	if err != nil {
		return 0, rerrors.Wrap(err)
	}

	return id, nil
}

// newUploadPipeline builds the shared upload core from this service's own
// storages, so direct uploads and torrent imports land files through exactly
// the same staging/dedup/collision-resolution path.
func (s *FileService) newUploadPipeline() uploadPipeline {
	pipeline := uploadPipeline{
		fileMeta:      s.storage,
		binaryStorage: s.binaryStorage,
		jobs:          s.jobs,
	}

	return pipeline
}

func (s *FileService) ListUploadedFiles(ctx context.Context, req domain.ListUploadedFiles) ([]domain.SongFile, error) {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return nil, rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	files, err := s.binaryStorage.ListFiles(ctx, uCtx.UserId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error listing files from binary storage")
	}

	res := make([]domain.SongFile, 0, len(files))
	for _, f := range files {
		sf := domain.SongFile{
			Path: f,
		}

		var meta domain.FileMeta
		meta, err = s.storage.GetByPath(ctx, f)
		if err != nil {
			log.Info().
				Str("path", f).
				Err(err).Msg("error getting file meta")
			continue
		}

		sf.Id = meta.Id

		res = append(res, sf)
	}

	return res, nil
}

func (s *FileService) DeleteUploadedFile(ctx context.Context, fileId int64) error {
	err := s.deleteUploadedFile(ctx, fileId)
	if err != nil {
		return rerrors.Wrap(err)
	}

	return nil
}

func (s *FileService) DeleteUploadedFiles(ctx context.Context, fileIds []int64) error {
	for _, fileId := range fileIds {
		err := s.deleteUploadedFile(ctx, fileId)
		if err != nil {
			return rerrors.Wrap(err, "error deleting file", fileId)
		}
	}

	return nil
}

func (s *FileService) deleteUploadedFile(ctx context.Context, fileId int64) error {
	uCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(user_errors.ErrUnauthenticated)
	}

	file, err := s.storage.Get(ctx, fileId)
	if err != nil {
		return rerrors.Wrap(err, "error getting file meta")
	}

	if file.AddedById != uCtx.UserId {
		return rerrors.Wrap(user_errors.ErrPermissionDenied, "not allowed to delete this file")
	}

	_, err = s.songStorage.GetByFileId(ctx, fileId)
	if err == nil {
		return rerrors.Wrap(service_errors.ErrFileAlreadyUsed)
	}
	if !errors.Is(err, storage.ErrNotFound) {
		return rerrors.Wrap(err, "error checking if file is attached to a song")
	}

	err = s.storage.Delete(ctx, fileId)
	if err != nil {
		return rerrors.Wrap(err, "error deleting file meta")
	}

	err = s.binaryStorage.DeleteTempFile(ctx, file.FilePath)
	if err != nil {
		return rerrors.Wrap(err, "error deleting temp file")
	}

	return nil
}

func (s *FileService) GetFile(ctx context.Context, fileId int64) (domain.FileMeta, error) {
	file, err := s.storage.Get(ctx, fileId)
	if err != nil {
		return domain.FileMeta{}, rerrors.Wrap(err, "error getting file meta from storage")
	}

	if file.Verified {
		return file, nil
	}

	rc, err := s.binaryStorage.GetFile(ctx, file.FilePath)
	if err != nil {
		return domain.FileMeta{}, rerrors.Wrap(err, "error opening file for parsing")
	}
	defer utils.CloseWithLog(rc, file.FilePath)

	info, err := audio_parsers.Parse(file.FilePath, rc)
	if err != nil {
		return domain.FileMeta{}, rerrors.Wrap(err, "error parsing audio file")
	}

	file.Duration = info.Duration
	file.SizeBytes = info.SizeBytes
	file.Verified = true

	uErr := s.storage.Update(ctx, file.Id, file.File)
	if uErr != nil {
		return domain.FileMeta{}, rerrors.Wrap(uErr, "error updating file meta after parsing")
	}

	return file, nil
}
