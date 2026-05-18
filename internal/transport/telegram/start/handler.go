package start

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"

	"go.zpotify.ru/zpotify/internal/localization"
)

const Command = "/start"

type Handler struct {
	responseBuilder *localization.ResponseBuilder
}

func New(responseBuilder *localization.ResponseBuilder) *Handler {
	return &Handler{
		responseBuilder: responseBuilder,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	msg := response.NewMessage(h.responseBuilder.GetResponses(in.Ctx).Hello())
	return out.SendMessage(msg)
}

func (h *Handler) GetCommand() string {
	return Command
}
