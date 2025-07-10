package default_handler

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"

	"go.zpotify.ru/zpotify/internal/responses"
)

type Handler struct {
	rm *responses.ResponseManager
}

func New(rm *responses.ResponseManager) *Handler {
	return &Handler{
		rm: rm,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	if in.Audio != nil {
		return h.handleAudio(in, out)
	}

	return nil
}
