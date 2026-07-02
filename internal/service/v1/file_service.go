package v1

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"image"
	// registers jpeg/png/gif decoders with image.DecodeConfig for cover image verification.
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
// format (mp3/flac/aac) or a supported cover image.
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

func (s *FileService) SaveFile(ctx context.Context, fileNameWithExt string, content io.Reader) (int64, error) {
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

	files, err := s.binaryStorage.ListFiles(ctx, uCtx.UserId)
	if err != nil {
		return 0, rerrors.Wrap(err, "error listing temp files for limit check")
	}
	if int64(len(files)) >= uCtx.Permissions.MaxPendingTracks {
		return 0, service_errors.ErrPendingTrackLimitReached
	}

	hashWriter := sha256.New()
	sizeCounter := &countingWriter{}
	limitedContent := io.LimitReader(content, uCtx.Permissions.MaxSongSizeBytes+1)
	tmpFilePath, err := s.binaryStorage.SaveToTempFolder(ctx, uCtx.UserId, fileNameWithExt, io.TeeReader(limitedContent, io.MultiWriter(hashWriter, sizeCounter)))
	if err != nil {
		return 0, rerrors.Wrap(err, "error storing to temporary folder")
	}

	if sizeCounter.n > uCtx.Permissions.MaxSongSizeBytes {
		_ = s.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, service_errors.ErrSongSizeLimitExceeded
	}

	isCoverImage := isCoverImageUpload(fileNameWithExt)
	verified := false
	if isCoverImage {
		rc, getErr := s.binaryStorage.GetFile(ctx, tmpFilePath)
		if getErr != nil {
			_ = s.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
			return 0, rerrors.Wrap(getErr, "error opening uploaded cover image for verification")
		}

		ext := strings.ToLower(path.Ext(fileNameWithExt))
		verifyErr := verifyImage(ext, rc)
		utils.CloseWithLog(rc, tmpFilePath)
		if verifyErr != nil {
			_ = s.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
			return 0, rerrors.Wrap(verifyErr)
		}

		verified = true
	}

	contentHash := hex.EncodeToString(hashWriter.Sum(nil))

	existingFile, err := s.storage.GetByHash(ctx, contentHash, uCtx.UserId)
	if err != nil && !errors.Is(err, storage.ErrNotFound) {
		_ = s.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, rerrors.Wrap(err, "error checking for duplicate file")
	}
	if err == nil {
		_ = s.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return existingFile.Id, nil
	}

	totalSize, err := s.storage.GetTotalSizeByUser(ctx, uCtx.UserId)
	if err != nil {
		_ = s.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, rerrors.Wrap(err, "error getting total uploaded size for limit check")
	}
	if totalSize+sizeCounter.n > uCtx.Permissions.MaxTotalUploadBytes {
		_ = s.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, service_errors.ErrTotalUploadSizeLimitExceeded
	}

	fileMetaUpdate := domain.FileMeta{
		File: domain.File{
			FilePath:    tmpFilePath,
			SizeBytes:   sizeCounter.n,
			ContentHash: contentHash,
			Verified:    verified,
		},
		AddedById: uCtx.UserId,
	}

	id, err := s.storage.Add(ctx, fileMetaUpdate)
	if err != nil {
		return 0, rerrors.Wrap(err, "error saving file meta")
	}

	if !isCoverImage {
		enqErr := s.jobs.EnqueueAudioParseJob(ctx, id, tmpFilePath)
		if enqErr != nil {
			log.Warn().Err(enqErr).Int64("file_id", id).Msg("failed to enqueue audio parse job")
		}
	}

	return id, nil
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
