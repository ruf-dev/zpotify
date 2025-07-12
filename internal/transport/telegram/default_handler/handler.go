package default_handler

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"

	"go.zpotify.ru/zpotify/internal/localization"
)

type Handler struct {
	rm *localization.ResponseManager
}

func New(rm *localization.ResponseManager) *Handler {
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
