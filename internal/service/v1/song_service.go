package v1

import (
	"context"
	"database/sql"
	"io"
	"strings"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/files_cache"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
)

type AudioService struct {
	tgApi telegram.TgApiClient

	filesCache files_cache.FilesCache

	txManger *tx_manager.TxManager

	fileMetaStorage storage.FileMetaStorage
	songsStorage    storage.SongStorage
	usersStorage    storage.UserStorage
	artistStorage   storage.ArtistStorage
}

func NewAudioService(
	tgApi telegram.TgApiClient,
	dataStorage storage.Storage,

	filesCache files_cache.FilesCache,
) *AudioService {
	return &AudioService{
		tgApi:    tgApi,
		txManger: dataStorage.TxManager(),

		fileMetaStorage: dataStorage.FileMeta(),
		songsStorage:    dataStorage.SongStorage(),
		usersStorage:    dataStorage.User(),
		artistStorage:   dataStorage.ArtistStorage(),

		filesCache: filesCache,
	}
}

func (s *AudioService) Save(ctx context.Context, req domain.AddAudio) (out domain.SaveFileMetaResp, err error) {
	user, err := s.usersStorage.GetUser(ctx, req.AddedByTgId)
	if err != nil {
		return out, rerrors.Wrap(err, "error getting user from storage")
	}

	if !user.Permissions.CanUpload {
		out.Code = domain.SaveFileCodeUserNotAllowed
		return out, nil
	}

	tgFile, err := s.tgApi.GetFile(ctx, req.TgFileId)
	if err != nil {
		return out, rerrors.Wrap(err, "error getting file from Telegram")
	}

	meta := domain.FileMeta{
		TgFile: domain.TgFile{
			UniqueFileId: tgFile.FileUniqueID,
			FileId:       tgFile.FileID,
			FilePath:     tgFile.FilePath,
			SizeBytes:    int64(tgFile.FileSize),
		},
		AddedByTgId: req.AddedByTgId,
	}

	err = s.txManger.Execute(func(tx *sql.Tx) error {
		fileMetaStorage := s.fileMetaStorage.WithTx(tx)
		artistStorage := s.artistStorage.WithTx(tx)
		songsStorage := s.songsStorage.WithTx(tx)

		err = fileMetaStorage.Add(ctx, meta)
		if err != nil {
			switch {
			case rerrors.Is(err, storage.ErrAlreadyExists):
				out.Code = domain.SaveFileCodeAlreadyExists
				return nil
			default:
				return rerrors.Wrap(err, "error saving meta to zpotify's storage")
			}
		}

		artistsNames := separateArtists(req.Author)

		var artists []domain.ArtistsBase
		artists, err = artistStorage.Return(ctx, artistsNames)
		if err != nil {
			return rerrors.Wrap(err, "error getting artists from storage")
		}

		song := domain.SongBase{
			UniqueFileId: meta.UniqueFileId,
			Title:        sanitizeTitle(req.Title),
			Artists:      artists,
			Duration:     req.Duration,
		}

		err = songsStorage.Save(ctx, song)
		if err != nil {
			return rerrors.Wrap(err, "error saving song")
		}

		out.Code = domain.SaveFileCodeOk

		return nil
	})
	if err != nil {
		return out, rerrors.Wrap(err)
	}

	return out, nil
}

// TODO implement thread safe saving process and separated method to get new song into cache
func (s *AudioService) Get(ctx context.Context, uniqueFileId string, start, end int64) (io.ReadCloser, error) {
	file, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting file from storage")
	}

	cachedFile := s.filesCache.Get(uniqueFileId)
	if cachedFile != nil {
		return cachedFile.Get(start, end), nil
	}

	telegramBytesStream, err := s.tgApi.OpenFile(ctx, file.TgFile)
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	}

	f := files_cache.NewFile(telegramBytesStream, file.SizeBytes)
	s.filesCache.Set(uniqueFileId, f)

	return f.Get(start, end), nil
	//
	//pipeReader, pipeWriter := io.Pipe()
	//var cacheStream bytes.Buffer
	//
	//go func() {
	//	// TODO	Handle thread safe caching and waiting for cache b cuz of using seek on this method
	//	//	let's say there is two users accessing same file. First user is putting it to cache.
	//	//	Second user either waits for cache or stream file from tg api
	//
	//	// io.MultiWriter duplicates writes to multiple destinations
	//	//_, err := io.Copy(io.MultiWriter(pipeWriter, &cacheStream), telegramBytesStream)
	//	//if err != nil {
	//	//	_ = pipeWriter.CloseWithError(err)
	//	//	return
	//	//}
	//
	//	// Manual fan-out: read chunks from cold storage, write separately
	//	buf := make([]byte, 32*1024) // 32KB buffer
	//	for {
	//		n, err := telegramBytesStream.Read(buf)
	//		if n > 0 {
	//			chunk := buf[:n]
	//
	//			// write to cache (always)
	//			if _, err := cacheStream.Write(chunk); err != nil {
	//				break
	//			}
	//
	//			// write to user (may fail if user disconnects)
	//			if _, err := pipeWriter.Write(chunk); err != nil {
	//				// if client is gone, stop writing to pw, but continue cache
	//				pipeWriter.CloseWithError(err)
	//				break
	//			}
	//		}
	//		if err == io.EOF {
	//			break
	//		}
	//		if err != nil {
	//			break
	//		}
	//	}
	//	pipeWriter.Close()
	//
	//	s.filesCache.Set(uniqueFileId, cacheStream.Bytes())
	//}()

	//return pipeReader, nil
}

func (s *AudioService) GetInfo(ctx context.Context, uniqueFileId string) (domain.Song, error) {
	fileMeta, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error getting file from storage")
	}

	songBase, err := s.songsStorage.Get(ctx, uniqueFileId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error getting songBase from storage")
	}

	return domain.Song{
		SongBase: songBase,
		FileMeta: fileMeta,
	}, nil
}

func (s *AudioService) List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error) {
	if req.Limit == 0 {
		req.Limit = 10
	}

	list, err := s.songsStorage.List(ctx, req)
	if err != nil {
		return domain.SongsList{}, rerrors.Wrap(err, "error listing songs")
	}

	total, err := s.songsStorage.Count(ctx, req)
	if err != nil {
		return domain.SongsList{}, rerrors.Wrap(err, "error counting songs")
	}

	return domain.SongsList{
		Songs: list,
		Total: total,
	}, nil
}

func separateArtists(artists string) []string {
	comaSeparated := strings.Split(artists, ",")

	for idx := range comaSeparated {
		comaSeparated[idx] = strings.TrimSpace(comaSeparated[idx])
		comaSeparated[idx] = sanitizeTitle(comaSeparated[idx])
	}

	return comaSeparated
}

var replacer = strings.NewReplacer(
	"&#39;", "'",
)

func sanitizeTitle(title string) string {
	return replacer.Replace(title)
}
