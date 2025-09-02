package add

import (
	"time"

	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/localization"
	"go.zpotify.ru/zpotify/internal/service"
)

const Command = "/add"

type Handler struct {
	audioService service.AudioService

	responseBuilder *localization.ResponseBuilder
}

func New(s service.AudioService, rb *localization.ResponseBuilder) *Handler {
	return &Handler{
		audioService:    s,
		responseBuilder: rb,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	audio := findAudio(in)
	if audio == nil {
		mo := &response.MessageOut{
			Text:           h.responseBuilder.NoFileProvided(in.Ctx),
			ReplyMessageId: int64(in.MessageID),
		}
		return out.SendMessage(mo)
	}

	req := domain.AddAudio{
		UniqueFileId: audio.FileUniqueID,
		TgFileId:     audio.FileID,
		AddedByTgId:  in.From.ID,
		Title:        audio.Title,
		Author:       audio.Performer,
		Duration:     time.Second * time.Duration(audio.Duration),
	}

	resp, err := h.audioService.Save(in.Ctx, req)
	if err != nil {
		return rerrors.Wrap(err, "error saving audio")
	}

	msg := &response.MessageOut{
		ReplyMessageId: int64(in.MessageID),
	}

	switch resp.Code {
	case domain.SaveFileCodeOk:
		msg.Text = h.responseBuilder.SuccessSavingFile(in.Ctx)
	case domain.SaveFileCodeAlreadyExists:
		msg.Text = h.responseBuilder.FileAlreadyExists(in.Ctx)
	case domain.SaveFileCodeUserNotAllowed:
		msg.Text = h.responseBuilder.UserNowAllowedToAddFile(in.Ctx)
	default:
		msg.Text = "Error building response. We already working on it"
	}

	return out.SendMessage(msg)
}

func (h *Handler) GetCommand() string {
	return Command
}

func findAudio(in *model.MessageIn) *tgbotapi.Audio {
	if in.Audio != nil {
		return in.Audio
	}

	if in.ReplyToMessage != nil && in.ReplyToMessage.Audio != nil {
		return in.ReplyToMessage.Audio
	}

	return nil
}
