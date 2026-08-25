package v1

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
	"path"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/log"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

// uploadPipeline is the shared "land an incoming byte stream in a user's
// storage" core. It owns everything from staging the stream on disk while
// hashing it, through content dedup, collision-safe final path resolution,
// the files_meta row insert and the audio-parse job enqueue.
//
// It is deliberately free of any auth/permission/format policy: callers
// (FileService for direct HTTP uploads, TorrentService for torrent imports)
// run their own prologue first and then hand the pipeline an already-vetted
// stream.
type uploadPipeline struct {
	fileMeta      storage.FileMetaStorage
	binaryStorage storage.BinaryFileStorage
	jobs          storage.JobStorage
}

// uploadRequest describes a single file the pipeline should land in storage.
type uploadRequest struct {
	UserId int64
	// FileNameWithExt is the desired final file name, extension included.
	FileNameWithExt string
	// FolderRelDir is an already-sanitized folder segment, or "" for the
	// user's temp root.
	FolderRelDir string
	Content      io.Reader
	// MaxSongSizeBytes caps a single file; exceeding it aborts the upload.
	MaxSongSizeBytes int64
	// MaxTotalUploadBytes caps the user's cumulative uploaded size.
	MaxTotalUploadBytes int64
}

// store streams req.Content into the user's storage and returns the resulting
// files_meta id. When the content hash matches a file the user already has,
// the staged copy is discarded and the existing id is returned instead.
func (p uploadPipeline) store(ctx context.Context, req uploadRequest) (int64, error) {
	// The incoming content is written under a private, guaranteed-unique
	// staging name first - never directly under FileNameWithExt. The
	// content hash (needed to decide the real final path/dedup) can only be
	// known after the stream has been read, and writing straight to the
	// eventual target path could silently truncate/clobber an unrelated
	// file that already lives there.
	stagingFileName, err := newStagingFileName(path.Ext(req.FileNameWithExt))
	if err != nil {
		return 0, rerrors.Wrap(err, "error generating staging file name")
	}
	stagingRelPath := path.Join(req.FolderRelDir, stagingFileName)

	hashWriter := sha256.New()
	sizeCounter := &countingWriter{}
	limitedContent := io.LimitReader(req.Content, req.MaxSongSizeBytes+1)
	tmpFilePath, err := p.binaryStorage.SaveToTempFolder(ctx, req.UserId, stagingRelPath, io.TeeReader(limitedContent, io.MultiWriter(hashWriter, sizeCounter)))
	if err != nil {
		return 0, rerrors.Wrap(err, "error storing to temporary folder")
	}

	if sizeCounter.n > req.MaxSongSizeBytes {
		_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, service_errors.ErrSongSizeLimitExceeded
	}

	isCoverImage := isCoverImageUpload(req.FileNameWithExt)
	verified := false
	if isCoverImage {
		rc, getErr := p.binaryStorage.GetFile(ctx, tmpFilePath)
		if getErr != nil {
			_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
			return 0, rerrors.Wrap(getErr, "error opening uploaded cover image for verification")
		}

		ext := strings.ToLower(path.Ext(req.FileNameWithExt))
		verifyErr := verifyImage(ext, rc)
		utils.CloseWithLog(rc, tmpFilePath)
		if verifyErr != nil {
			_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
			return 0, rerrors.Wrap(verifyErr)
		}

		verified = true
	}

	contentHash := hex.EncodeToString(hashWriter.Sum(nil))

	existingFile, err := p.fileMeta.GetByHash(ctx, contentHash, req.UserId)
	if err != nil && !errors.Is(err, storage.ErrNotFound) {
		_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, rerrors.Wrap(err, "error checking for duplicate file")
	}
	if err == nil {
		_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return existingFile.Id, nil
	}

	// Move the staged file to its real, plain-named target path now that the
	// content hash (and thus the dedup decision above) is known. In the
	// common case the target path is free and the file keeps its original
	// name; only a genuine name collision with different content triggers a
	// hash-suffixed disambiguation (see resolveTargetPath).
	targetDir := path.Dir(tmpFilePath)
	targetPath, err := p.resolveTargetPath(ctx, targetDir, req.FileNameWithExt, contentHash)
	if err != nil {
		_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, rerrors.Wrap(err, "error resolving final file path")
	}
	err = p.binaryStorage.Move(ctx, tmpFilePath, targetPath)
	if err != nil {
		_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, rerrors.Wrap(err, "error moving file to final path")
	}
	tmpFilePath = targetPath

	totalSize, err := p.fileMeta.GetTotalSizeByUser(ctx, req.UserId)
	if err != nil {
		_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, rerrors.Wrap(err, "error getting total uploaded size for limit check")
	}
	if totalSize+sizeCounter.n > req.MaxTotalUploadBytes {
		_ = p.binaryStorage.DeleteTempFile(ctx, tmpFilePath)
		return 0, service_errors.ErrTotalUploadSizeLimitExceeded
	}

	fileMetaUpdate := domain.FileMeta{
		File: domain.File{
			FilePath:    tmpFilePath,
			SizeBytes:   sizeCounter.n,
			ContentHash: contentHash,
			Verified:    verified,
		},
		AddedById: req.UserId,
	}

	id, err := p.fileMeta.Add(ctx, fileMetaUpdate)
	if err != nil {
		return 0, rerrors.Wrap(err, "error saving file meta")
	}

	if !isCoverImage {
		enqErr := p.jobs.EnqueueAudioParseJob(ctx, id, tmpFilePath)
		if enqErr != nil {
			log.Warn(ctx).Err(enqErr).Int64("file_id", id).Msg("failed to enqueue audio parse job")
		}
	}

	return id, nil
}

// minDisambiguationHashChars is the shortest content-hash prefix used to
// disambiguate two different files that would otherwise land on the same
// target path (same directory + same original file name).
const minDisambiguationHashChars = 5

// resolveTargetPath decides the final stored path for a newly-hashed upload
// within dir (a tmp/{userId}[/{folder}] directory). Callers are expected to
// have already ruled out that contentHash matches an existing file
// (identical content is deduplicated before this is called), so any
// existing files_meta row already sitting at the plain candidate path
// necessarily belongs to different content sharing the same name - which is
// disambiguated by appending a growing prefix of this upload's own content
// hash until a free path is found.
func (p uploadPipeline) resolveTargetPath(ctx context.Context, dir string, fileNameWithExt string, contentHash string) (string, error) {
	candidatePath := path.Join(dir, fileNameWithExt)

	_, err := p.fileMeta.GetByPath(ctx, candidatePath)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			return candidatePath, nil
		}
		return "", rerrors.Wrap(err, "error checking target path availability")
	}

	ext := path.Ext(fileNameWithExt)
	base := strings.TrimSuffix(fileNameWithExt, ext)

	for prefixLen := minDisambiguationHashChars; prefixLen <= len(contentHash); prefixLen++ {
		disambiguatedName := base + "-" + contentHash[:prefixLen] + ext
		disambiguatedPath := path.Join(dir, disambiguatedName)

		_, getErr := p.fileMeta.GetByPath(ctx, disambiguatedPath)
		if getErr != nil {
			if errors.Is(getErr, storage.ErrNotFound) {
				return disambiguatedPath, nil
			}
			return "", rerrors.Wrap(getErr, "error checking disambiguated target path availability")
		}
	}

	return "", rerrors.Wrap(service_errors.ErrFilePathCollisionUnresolved, "exhausted content hash while resolving unique file path")
}
