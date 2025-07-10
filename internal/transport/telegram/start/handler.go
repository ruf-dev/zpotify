package start

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"

	"go.zpotify.ru/zpotify/internal/responses"
)

const Command = "/start"

type Handler struct {
	rm *responses.ResponseManager
}

func New(rm *responses.ResponseManager) *Handler {
	return &Handler{
		rm: rm,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	msg := response.NewMessage(h.rm.Hello(in.Ctx))
	return out.SendMessage(msg)
}

func (h *Handler) GetCommand() string {
	return Command
}
