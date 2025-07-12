package default_handler

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"

	"go.zpotify.ru/zpotify/internal/localization"
	v1 "go.zpotify.ru/zpotify/internal/service/v1"
)

type Handler struct {
	responseBuilder *localization.ResponseBuilder

	fileService v1.FileService
}

func New(responseBuilder *localization.ResponseBuilder) *Handler {
	return &Handler{
		responseBuilder: responseBuilder,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	return out.SendMessage(&response.MessageOut{
		Text: "Welcome to Zpotify!",
	})
}
