package v1

import (
	"context"
	"io"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
)

func openStoredFile(
	ctx context.Context,
	registry storage.StorageRegistry,
	storageId uuid.UUID,
	filePath string,
) (io.ReadCloser, error) {
	if storageId == uuid.Nil {
		storageId = domain.LocalStorageUuid
	}

	content, err := registry.Get(ctx, storageId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error resolving file storage")
	}

	stream, err := content.Get(ctx, filePath)
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening file in storage")
	}

	return stream, nil
}

func openStoredFileByPath(
	ctx context.Context,
	registry storage.StorageRegistry,
	fileMetaStorage storage.FileMetaStorage,
	filePath string,
) (io.ReadCloser, error) {
	meta, err := fileMetaStorage.GetByPath(ctx, filePath)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting file meta by path")
	}

	stream, err := openStoredFile(ctx, registry, meta.StorageId, filePath)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	return stream, nil
}

// placeFileInDefaultStorage moves a staged file (meta carries its current
// location) to newPath in the default storage, repoints the files_meta row and
// schedules the source copy for garbage collection.
func placeFileInDefaultStorage(
	ctx context.Context,
	registry storage.StorageRegistry,
	fileMetaStorage storage.FileMetaStorage,
	jobStorage storage.JobStorage,
	meta domain.FileMeta,
	newPath string,
) error {
	sourceId := meta.StorageId
	if sourceId == uuid.Nil {
		sourceId = domain.LocalStorageUuid
	}

	defaultId, _, err := registry.Default(ctx)
	if err != nil {
		return rerrors.Wrap(err, "error resolving default storage")
	}

	err = registry.Transfer(ctx, sourceId, meta.FilePath, defaultId, newPath)
	if err != nil {
		return rerrors.Wrap(err, "error transferring file to permanent storage")
	}

	err = fileMetaStorage.UpdateLocation(ctx, meta.Id, defaultId, newPath)
	if err != nil {
		return rerrors.Wrap(err, "error updating file location")
	}

	err = jobStorage.EnqueueGarbageFile(ctx, sourceId, meta.FilePath)
	if err != nil {
		return rerrors.Wrap(err, "error enqueueing staged file for deletion")
	}

	return nil
}
