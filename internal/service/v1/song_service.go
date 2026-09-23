package v1

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"path"
	"strconv"
	"strings"

	"go.redsock.ru/rerrors"
	"golang.org/x/sync/singleflight"

	tgclient "go.zpotify.ru/zpotify/internal/clients/telegram"
	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
	"go.zpotify.ru/zpotify/internal/service/service_errors"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/storage/files_cache"
	"go.zpotify.ru/zpotify/internal/storage/pg/generated/songs_q"
	"go.zpotify.ru/zpotify/internal/storage/tx_manager"
	"go.zpotify.ru/zpotify/internal/utils"
)

// TelegramSender delivers a track's audio file to a user's Telegram chat.
// Defined here (consumer side) rather than in the telegram client package
// so AudioService only depends on the shape it actually needs.
type TelegramSender interface {
	SendTrack(chatId int64, audio tgclient.TrackAudio) error
	UploadForFileId(chatId int64, audio tgclient.TrackAudio) (string, error)
}

// defaultSearchLimit caps song search results when the request omits paging,
// guarding against LIMIT 0 (which returns nothing).
const defaultSearchLimit = 30

type AudioService struct {
	txManager *tx_manager.TxManager

	songsStorage    storage.SongStorage
	fileMetaStorage storage.FileMetaStorage
	playlistStorage storage.PlaylistStorage
	artistStorage   storage.ArtistStorage
	binaryStorage   storage.BinaryFileStorage
	jobStorage      storage.JobStorage

	telegramIdentityStorage storage.TelegramIdentityStorage
	telegramSender          TelegramSender
	telegramRelayChatId     int64

	// telegramUploadGroup collapses concurrent EnsureTelegramFileId calls for
	// the same songId into a single relay upload, keyed by
	// strconv.FormatInt(songId, 10).
	telegramUploadGroup singleflight.Group

	filesCache files_cache.FilesCache
}

func NewAudioService(
	dataStorage storage.Storage,
	filesCache files_cache.FilesCache,
	binaryStorage storage.BinaryFileStorage,
	telegramSender TelegramSender,
	telegramRelayChatId int64,
) *AudioService {
	return &AudioService{
		txManager: dataStorage.TxManager(),

		songsStorage:    dataStorage.SongsStorage(),
		fileMetaStorage: dataStorage.FileMeta(),
		playlistStorage: dataStorage.PlaylistStorage(),
		artistStorage:   dataStorage.ArtistStorage(),
		binaryStorage:   binaryStorage,
		jobStorage:      dataStorage.Jobs(),

		telegramIdentityStorage: dataStorage.TelegramIdentity(),
		telegramSender:          telegramSender,
		telegramRelayChatId:     telegramRelayChatId,

		filesCache: filesCache,
	}
}

func (s *AudioService) Create(ctx context.Context, req domain.CreateSong) (int64, error) {
	if len(req.ArtistUuids) == 0 {
		return 0, rerrors.Wrap(service_errors.ErrTrackMustHaveOneArtist)
	}

	// TODO If song is already uploaded need to highlight to user somehow that song already there
	var songId int64

	err := s.txManager.Execute(func(tx *sql.Tx) error {
		songsStorage := s.songsStorage.WithTx(tx)

		var err error
		songId, err = songsStorage.Create(ctx, req.CreateSongParams)
		if err != nil {
			return rerrors.Wrap(err, "error creating song in storage")
		}

		err = s.finalizeSong(ctx, req, songId, tx)
		if err != nil {
			return rerrors.Wrap(err, "error during song finalization")
		}

		playlistStorage := s.playlistStorage.WithTx(tx)
		err = playlistStorage.AddSong(ctx, domain.GlobalPlaylistUuid, int32(songId))
		if err != nil {
			return rerrors.Wrap(err, "error adding song to global playlist")
		}

		return nil
	})
	if err != nil {
		if !errors.Is(err, storage.ErrAlreadyExists) {
			return 0, rerrors.Wrap(err)
		}

		var song domain.Song
		song, err = s.songsStorage.GetByFileId(ctx, req.FileID)
		if err != nil {
			return 0, rerrors.Wrap(err)
		}

		songId = song.SongBase.Id
	}

	return songId, nil
}

func (s *AudioService) CreateBatch(ctx context.Context, reqs []domain.CreateSong) ([]int64, error) {
	for _, req := range reqs {
		if len(req.ArtistUuids) == 0 {
			return nil, rerrors.Wrap(service_errors.ErrTrackMustHaveOneArtist)
		}
	}

	ids := make([]int64, 0, len(reqs))

	err := s.txManager.Execute(
		func(tx *sql.Tx) error {
			songsStorage := s.songsStorage.WithTx(tx)

			params := make([]songs_q.CreateSongParams, len(reqs))
			for i, req := range reqs {
				params[i] = req.CreateSongParams
			}

			songIds, err := songsStorage.CreateBatch(ctx, params)
			if err != nil {
				return rerrors.Wrap(err, "error creating one of the songs in storage")
			}

			for i, req := range reqs {
				err = s.finalizeSong(ctx, req, songIds[i], tx)
				if err != nil {
					return rerrors.Wrap(err, "error finalizing one of the songs")
				}
			}

			playlistStorage := s.playlistStorage.WithTx(tx)
			for i := len(songIds) - 1; i >= 0; i-- {
				err = playlistStorage.AddSong(ctx, domain.GlobalPlaylistUuid, int32(songIds[i]))
				if err != nil {
					return rerrors.Wrap(err, "error adding song to global playlist")
				}
			}

			ids = append(ids, songIds...)

			return nil
		})
	if err != nil {
		return nil, err
	}

	return ids, nil
}

func (s *AudioService) finalizeSong(
	ctx context.Context,
	req domain.CreateSong,
	songId int64,
	tx *sql.Tx,
) error {
	songsStorage := s.songsStorage.WithTx(tx)
	fileMetaStorage := s.fileMetaStorage.WithTx(tx)

	fileMeta, err := fileMetaStorage.Get(ctx, req.FileID)
	if err != nil {
		return rerrors.Wrap(err, "error getting file meta")
	}

	listReq := domain.ListArtists{
		Uuid:  []string{req.ArtistUuids[0]},
		Limit: 1,
	}
	artists, err := s.artistStorage.List(ctx, listReq)
	if err != nil {
		return rerrors.Wrap(err, "error getting artist for path")
	}
	if len(artists) == 0 {
		return rerrors.Wrap(fmt.Errorf("artist not found: %s", req.ArtistUuids[0]))
	}

	hashSuffix := fileMeta.ContentHash
	if len(hashSuffix) > 8 {
		hashSuffix = hashSuffix[:8]
	}

	ext := path.Ext(fileMeta.FilePath)
	newPath := fmt.Sprintf("%s/%s-%s%s", artists[0].Name, req.Title, hashSuffix, ext)
	newPath = strings.ReplaceAll(newPath, " ", "_")
	oldPath := fileMeta.FilePath
	fileMeta.FilePath = newPath
	fileMeta.Verified = true

	err = s.binaryStorage.Copy(ctx, oldPath, newPath)
	if err != nil {
		return rerrors.Wrap(err, "error copying file to permanent storage")
	}

	err = fileMetaStorage.Update(ctx, req.FileID, fileMeta.File)
	if err != nil {
		return rerrors.Wrap(err, "error updating file meta with new path")
	}

	for i, artistUuid := range req.ArtistUuids {
		err = songsStorage.AddArtist(ctx, songId, artistUuid, i)
		if err != nil {
			return rerrors.Wrap(err, "error adding artist to song", artistUuid)
		}
	}

	for i, tag := range req.Tags {
		err = songsStorage.InsertSongTag(ctx, songId, tag, i)
		if err != nil {
			return rerrors.Wrap(err, "error adding tag to song")
		}
	}

	jobStorage := s.jobStorage.WithTx(tx)
	err = jobStorage.EnqueueGarbageFile(ctx, oldPath)
	if err != nil {
		return rerrors.Wrap(err, "error enqueueing old file path for deletion")
	}

	return nil
}

func (s *AudioService) Update(ctx context.Context, req domain.UpdateSong) error {
	err := s.txManager.Execute(
		func(tx *sql.Tx) error {
			songsStorage := s.songsStorage.WithTx(tx)

			if req.Title != "" {
				err := songsStorage.UpdateTitle(ctx, req.Id, req.Title)
				if err != nil {
					return rerrors.Wrap(err, "error updating song title")
				}
			}

			if len(req.ArtistUuids) > 0 {
				err := songsStorage.ClearArtists(ctx, req.Id)
				if err != nil {
					return rerrors.Wrap(err, "error clearing song artists")
				}

				for i, artistUuid := range req.ArtistUuids {
					err = songsStorage.AddArtist(ctx, req.Id, artistUuid, i)
					if err != nil {
						return rerrors.Wrap(err, "error adding artist to song", artistUuid)
					}
				}
			}

			if req.Tags != nil {
				err := songsStorage.ClearSongTags(ctx, req.Id)
				if err != nil {
					return rerrors.Wrap(err, "error clearing song tags")
				}

				for i, tag := range req.Tags {
					err = songsStorage.InsertSongTag(ctx, req.Id, tag, i)
					if err != nil {
						return rerrors.Wrap(err, "error adding tag to song")
					}
				}
			}

			return nil
		})
	if err != nil {
		return rerrors.Wrap(err)
	}

	return nil
}

func (s *AudioService) GetSong(ctx context.Context, songId int64) (domain.Song, error) {
	song, err := s.getSongWithTags(ctx, songId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err)
	}

	return song, nil
}

// getSongWithTags fetches a song and its tags. Extracted so SendToTelegram
// can reuse it without calling the public GetSong method.
func (s *AudioService) getSongWithTags(ctx context.Context, songId int64) (domain.Song, error) {
	song, err := s.songsStorage.GetById(ctx, songId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error getting song from storage")
	}

	tags, err := s.songsStorage.GetSongTags(ctx, songId)
	if err != nil {
		return domain.Song{}, rerrors.Wrap(err, "error getting song tags")
	}
	song.Tags = tags

	return song, nil
}

// SendToTelegram delivers a track's audio file to the requesting user's own
// linked Telegram chat (bot DM) via the Telegram bot.
func (s *AudioService) SendToTelegram(ctx context.Context, songId int64) error {
	userCtx, ok := user_context.GetUserContext(ctx)
	if !ok {
		return rerrors.Wrap(service_errors.ErrUnauthenticated)
	}

	identity, err := s.telegramIdentityStorage.GetByUserId(ctx, userCtx.UserId)
	if err != nil {
		if errors.Is(err, storage.ErrNotFound) {
			return rerrors.Wrap(service_errors.ErrTelegramNotLinked)
		}
		return rerrors.Wrap(err, "error getting telegram identity")
	}

	song, err := s.getSongWithTags(ctx, songId)
	if err != nil {
		return rerrors.Wrap(err, "error getting song")
	}

	file, err := s.binaryStorage.GetFile(ctx, song.FilePath)
	if err != nil {
		return rerrors.Wrap(err, "error getting song file")
	}
	defer utils.CloseWithLog(file, song.FilePath)

	performer := ""
	if len(song.Artists) > 0 {
		performer = song.Artists[0].Name
	}

	audio := tgclient.TrackAudio{
		FileName:    path.Base(song.FilePath),
		Content:     file,
		Caption:     song.Title,
		Performer:   performer,
		Title:       song.Title,
		DurationSec: int(song.Duration.Seconds()),
	}

	err = s.telegramSender.SendTrack(identity.TelegramId, audio)
	if err != nil {
		return rerrors.Wrap(err, "error sending track to telegram")
	}

	return nil
}

// GetCachedTelegramFileId returns songId's Telegram file_id if it has already
// been minted by EnsureTelegramFileId, without uploading anything. ok is
// false when nothing is cached yet.
func (s *AudioService) GetCachedTelegramFileId(ctx context.Context, songId int64) (string, bool, error) {
	cached, err := s.songsStorage.GetTgAudioFileId(ctx, songId)
	if err != nil {
		return "", false, rerrors.Wrap(err, "error getting cached telegram file id")
	}

	return cached.String, cached.Valid, nil
}

// EnsureTelegramFileId returns a Telegram file_id for songId's audio, usable
// with InlineQueryResultCachedAudio. The first call for a song relay-uploads
// it once to telegramRelayChatId and caches the resulting file_id; later
// calls return the cached value without re-uploading. Concurrent calls for
// the same songId collapse into a single upload via telegramUploadGroup.
func (s *AudioService) EnsureTelegramFileId(ctx context.Context, songId int64) (string, error) {
	cached, err := s.songsStorage.GetTgAudioFileId(ctx, songId)
	if err != nil {
		return "", rerrors.Wrap(err, "error getting cached telegram file id")
	}
	if cached.Valid {
		return cached.String, nil
	}

	if s.telegramRelayChatId == 0 {
		return "", rerrors.Wrap(service_errors.ErrTelegramRelayNotConfigured)
	}

	groupKey := strconv.FormatInt(songId, 10)

	fileIdVal, err, _ := s.telegramUploadGroup.Do(groupKey, func() (interface{}, error) {
		return s.uploadAndCacheTelegramFileId(ctx, songId)
	})
	if err != nil {
		return "", rerrors.Wrap(err)
	}

	fileId, ok := fileIdVal.(string)
	if !ok {
		return "", rerrors.Wrap(fmt.Errorf("unexpected telegram upload group result type %T", fileIdVal))
	}

	return fileId, nil
}

// uploadAndCacheTelegramFileId relay-uploads songId's audio to
// telegramRelayChatId and persists the resulting file_id. Only ever called
// from within s.telegramUploadGroup.
func (s *AudioService) uploadAndCacheTelegramFileId(ctx context.Context, songId int64) (string, error) {
	song, err := s.getSongWithTags(ctx, songId)
	if err != nil {
		return "", rerrors.Wrap(err, "error getting song")
	}

	file, err := s.binaryStorage.GetFile(ctx, song.FilePath)
	if err != nil {
		return "", rerrors.Wrap(err, "error getting song file")
	}
	defer utils.CloseWithLog(file, song.FilePath)

	performer := ""
	if len(song.Artists) > 0 {
		performer = song.Artists[0].Name
	}

	audio := tgclient.TrackAudio{
		FileName:    path.Base(song.FilePath),
		Content:     file,
		Caption:     song.Title,
		Performer:   performer,
		Title:       song.Title,
		DurationSec: int(song.Duration.Seconds()),
	}

	fileId, err := s.telegramSender.UploadForFileId(s.telegramRelayChatId, audio)
	if err != nil {
		return "", rerrors.Wrap(err, "error relay-uploading track to telegram")
	}

	err = s.songsStorage.SetTgAudioFileId(ctx, songId, fileId)
	if err != nil {
		return "", rerrors.Wrap(err, "error caching telegram file id")
	}

	return fileId, nil
}

func (s *AudioService) Delete(ctx context.Context, id int64) error {
	return nil
}

func (s *AudioService) Save(ctx context.Context, req domain.AddAudio) (out domain.SaveFileMetaResp, err error) {
	//filter := domain.GetUserFilter{
	//	TgUserId: []int64{req.AddedByTgId},
	//}

	//users, err := s.usersStorage.ListUsers(ctx, filter)
	//if err != nil {
	//	return out, rerrors.Wrap(err, "error getting user from storage")
	//}

	//if len(users) == 0 {
	//	return domain.SaveFileMetaResp{}, rerrors.Wrap(user_errors.ErrNotFound, "user not found")
	//}

	// TODO get user from context
	//if !users[0].Permissions.CanUpload {
	//	out.Code = domain.SaveFileCodeUserNotAllowed
	//	return out, nil
	//}

	//TODO replace
	//tgFile, err := s.tgApi.GetFile(ctx, req.TgFileId)
	//if err != nil {
	//	return out, rerrors.Wrap(err, "error getting file from Telegram")
	//}

	//meta := domain.FileMeta{
	//	File: domain.File{
	//		FilePath:  tgFile.FilePath,
	//		SizeBytes: int64(tgFile.FileSize),
	//	},
	//	AddedByTgId: req.AddedByTgId,
	//}

	//err = s.txManager.Execute(func(tx *sql.Tx) error {
	//	// TODO
	//	fileMetaStorage := s.fileMetaStorage.WithTx(tx)
	//	//artistStorage := s.artistStorage.WithTx(tx)
	//	songsStorage := s.songsStorage.WithTx(tx)
	//
	//	err = fileMetaStorage.Add(ctx, meta)
	//	if err != nil {
	//		switch {
	//		case rerrors.Is(err, storage.ErrAlreadyExists):
	//			out.Code = domain.SaveFileCodeAlreadyExists
	//			return err
	//		default:
	//			return rerrors.Wrap(err, "error saving meta to zpotify's storage")
	//		}
	//	}
	//
	//	//artistsNames := separateArtists(req.Author)
	//
	//	//var artists []domain.ArtistsBase
	//	//artists, err = artistStorage.Return(ctx, artistsNames)
	//	//if err != nil {
	//	//	return rerrors.Wrap(err, "error getting artists from storage")
	//	//}
	//
	//	song := domain.SongBase{
	//		Title: sanitizeTitle(req.Title),
	//		//TODO
	//		//Artists:  artists,
	//		//Duration: req.Duration,
	//	}
	//
	//	err = songsStorage.Save(ctx, song)
	//	if err != nil {
	//		return rerrors.Wrap(err, "error saving song")
	//	}
	//
	//	// TODO
	//	//err = songsStorage.SaveSongsArtists(ctx, song)
	//	//if err != nil {
	//	//	return rerrors.Wrap(err, "error saving songs artists")
	//	//}
	//
	//	err = songsStorage.AddSongsToPlaylist(ctx, GlobalPlaylistUuid, song.Id)
	//	if err != nil {
	//		return rerrors.Wrap(err, "error saving songs artists")
	//	}
	//
	//	out.Code = domain.SaveFileCodeOk
	//
	//	return nil
	//})
	//if err != nil {
	//	switch out.Code {
	//	case domain.SaveFileCodeAlreadyExists:
	//		return out, nil
	//	default:
	//		return out, rerrors.Wrap(err)
	//	}
	//}

	return out, nil
}

func (s *AudioService) Get(uniqueFileId int64, start, end int64) (domain.Song, io.ReadCloser, error) {
	//f, isNew := s.filesCache.GetOrCreate(uniqueFileId)
	//if !isNew {
	//	// On first call initializes self and continue to downloading file
	//	// every call after will fall into this case and wait for stream to start
	//	return f.SongInfo, f.Get(start, end), nil
	//}

	// ctx := context.Background()

	// Before uploading file to cache - validate it's size
	//fileMeta, err := s.fileMetaStorage.Get(ctx, uniqueFileId)
	//if err != nil {
	//	return f.SongInfo, nil, rerrors.Wrap(err, "error getting file meta from storage")
	//}

	//song, err := s.songsStorage.Get(ctx, uniqueFileId)
	//if err != nil {
	//	return f.SongInfo, nil, rerrors.Wrap(err, "error getting song from storage")
	//}

	// f.SongInfo.SongBase = song
	// f.SongInfo.FileMeta = fileMeta

	//telegramBytesStream, err := s.openFileWithFallback(ctx, fileMeta)
	//if err != nil {
	//	return f.SongInfo, nil, rerrors.Wrap(err, "error getting file from storage")
	//}

	//s.filesCache.Set(uniqueFileId, f)
	//
	//go func() {
	//	f.Upload(telegramBytesStream, fileMeta.SizeBytes)
	//}()

	// return f.SongInfo, f.Get(start, end), nil
	return domain.Song{}, nil, nil
}

func (s *AudioService) GetInfo(ctx context.Context, fileId int64) (domain.Song, error) {
	return domain.Song{}, nil
}

func (s *AudioService) List(ctx context.Context, req domain.ListSongs) (domain.SongsList, error) {
	return domain.SongsList{}, nil
}

func (s *AudioService) Search(ctx context.Context, req domain.SearchSongsParams) ([]domain.Song, error) {
	limit := req.Limit
	if limit == 0 {
		limit = defaultSearchLimit
	}

	songs, err := s.songsStorage.SearchByTitle(ctx, req.Query, req.UserId, limit, req.Offset)
	if err != nil {
		return nil, rerrors.Wrap(err, "error searching songs by title")
	}

	return songs, nil
}

//nolint:unused // WIP: only caller is commented out pending the Get() rewrite above
func (s *AudioService) openFileWithFallback(ctx context.Context, file domain.FileMeta) (io.ReadCloser, error) {
	//telegramBytesStream, err := s.tgApi.OpenFile(ctx, file.TgFile)
	//if err == nil {
	//	return telegramBytesStream, nil
	//}
	//
	//if !rerrors.Is(err, service_errors.ErrNotFound) {
	//	return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	//}
	//
	//// Fallback on not found
	//f, err := s.tgApi.GetFile(ctx, file.FileId)
	//if err != nil {
	//	return nil, rerrors.Wrap(err, "error getting file from telegram")
	//}
	//
	//file.FileId = f.FileID
	//file.FilePath = f.FilePath
	//file.SizeBytes = int64(f.FileSize)
	//
	//err = s.fileMetaStorage.Upsert(ctx, file)
	//if err != nil {
	//	return nil, rerrors.Wrap(err,
	//		"error upserting file to storage after failing to finding it in telegram cache")
	//}
	//
	//telegramBytesStream, err = s.tgApi.OpenFile(ctx, file.TgFile)
	//if err != nil {
	//	return nil, rerrors.Wrap(err, "error opening file from Telegram to stream")
	//}

	return nil, nil
}
