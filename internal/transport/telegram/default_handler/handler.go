package default_handler

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"

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

// FileID = {string} "CQACAgIAAxkBAAMOaGjpbYLz_IY6_wHiwtxSjQvZAcQAAvABAALs5vlJwnxurt15HQM2BA"
// FileUniqueID = {string} "AgAD8AEAAuzm-Uk"
func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	msg := response.NewMessage(h.rm.Hello(responses.ParseLangFromChatMessage(in)))
	return out.SendMessage(msg)
}
