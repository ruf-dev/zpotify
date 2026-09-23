package telegram

import (
	"io"

	"github.com/Red-Sock/go_tg"
	"github.com/Red-Sock/go_tg/model/response"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"go.redsock.ru/rerrors"
)

// TrackAudio is a media.Media implementation that sends a song's audio file
// as a Telegram audio message.
type TrackAudio struct {
	FileName    string
	Content     io.Reader
	Caption     string
	Performer   string
	Title       string
	DurationSec int
}

func (a TrackAudio) AsSingleTgMedia(chatId int64) tgbotapi.Chattable {
	file := tgbotapi.FileReader{
		Name:   a.FileName,
		Reader: a.Content,
	}

	audio := tgbotapi.NewAudio(chatId, file)
	audio.Caption = a.Caption
	audio.Performer = a.Performer
	audio.Title = a.Title
	audio.Duration = a.DurationSec

	return audio
}

func (a TrackAudio) AsInputMedia() any {
	file := tgbotapi.FileReader{
		Name:   a.FileName,
		Reader: a.Content,
	}

	return tgbotapi.NewInputMediaAudio(file)
}

// TrackSender delivers a track's audio file to a user's own Telegram chat
// (bot DM) via the bot.
type TrackSender struct {
	bot go_tg.TgApi
}

func NewTrackSender(bot go_tg.TgApi) *TrackSender {
	sender := &TrackSender{
		bot: bot,
	}

	return sender
}

// SendTrack sends the given track audio to chatId.
//
// Unlike AdminNotifier, which no-ops when its chat isn't configured (a
// disabled feature is not an error), chatId == 0 here means the caller
// failed to resolve the user's linked Telegram identity before calling
// SendTrack - that's a real bug, so this returns an error instead of
// silently doing nothing.
func (s *TrackSender) SendTrack(chatId int64, audio TrackAudio) error {
	if chatId == 0 {
		return rerrors.New("chat id is required to send track audio")
	}

	msg := response.NewMessage("", response.WithMedia(audio))
	msg.SetChatIdIfZero(chatId)

	err := s.bot.Send(msg)
	if err != nil {
		return rerrors.Wrap(err, "send track audio")
	}

	return nil
}

// UploadForFileId sends audio to chatId like SendTrack, but returns
// Telegram's file_id for the upload - for reuse via
// InlineQueryResultCachedAudio without re-uploading the file.
func (s *TrackSender) UploadForFileId(chatId int64, audio TrackAudio) (string, error) {
	if chatId == 0 {
		return "", rerrors.New("chat id is required to relay-upload track audio")
	}

	msg := response.NewMessage("", response.WithMedia(audio))
	msg.SetChatIdIfZero(chatId)

	sent, err := s.bot.SendAndReturn(msg)
	if err != nil {
		return "", rerrors.Wrap(err, "relay-upload track audio")
	}

	if sent.Audio == nil {
		return "", rerrors.New("telegram response missing audio after relay upload")
	}

	return sent.Audio.FileID, nil
}
