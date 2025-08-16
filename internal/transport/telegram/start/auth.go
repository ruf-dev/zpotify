package start

import (
	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"
	"go.redsock.ru/rerrors"
)

const authPrefix = "auth"

func (h *Handler) authenticate(in *model.MessageIn, authUuid string, out tgapi.Chat) error {
	err := h.authService.AckAuth(in.Ctx, authUuid, in.From.ID)
	if err != nil {
		return rerrors.Wrap(err, "error acking auth")
	}

	msgOut := &response.MessageOut{
		Text:           h.rm.SuccessfullyAuthenticated(in.Ctx),
		ReplyMessageId: int64(in.MessageID),
	}

	return out.SendMessage(msgOut)
}
