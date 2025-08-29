package default_handler

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"

	"go.zpotify.ru/zpotify/internal/localization"
	v1 "go.zpotify.ru/zpotify/internal/service/v1"
	"go.zpotify.ru/zpotify/internal/transport/telegram/add"
)

type Handler struct {
	responseBuilder *localization.ResponseBuilder

	fileService v1.AudioService

	addHandler *add.Handler
}

func New(responseBuilder *localization.ResponseBuilder, addHandler *add.Handler) *Handler {
	return &Handler{
		responseBuilder: responseBuilder,
		addHandler:      addHandler,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	if in.Audio != nil && in.Chat.ID == in.From.ID {
		return h.addHandler.Handle(in, out)
	}

	return out.SendMessage(&response.MessageOut{
		Text: "Welcome to Zpotify!",
	})
}
