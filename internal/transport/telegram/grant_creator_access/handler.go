package grant_creator_access

import (
	"fmt"
	"strconv"

	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/service"
)

const Command = "/grant_creator_access"

// Handler grants a user creator app access in response to the "Give creator access"
// button sent to the admin notifications chat. Only reachable from that chat.
type Handler struct {
	userService service.UserService
	adminChatId int64
}

func New(userService service.UserService, adminChatId int64) *Handler {
	return &Handler{
		userService: userService,
		adminChatId: adminChatId,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	if in.Chat.ID != h.adminChatId {
		return nil
	}

	if len(in.Args) == 0 {
		return rerrors.New("missing user id argument")
	}

	userId, err := strconv.ParseInt(in.Args[0], 10, 64)
	if err != nil {
		return rerrors.Wrap(err, "parse user id from callback data")
	}

	err = h.userService.GrantCreatorAccess(in.Ctx, userId)
	if err != nil {
		return rerrors.Wrap(err, "grant creator access to user")
	}

	msg := response.New().
		SetText(fmt.Sprintf("Creator access granted to user %d", userId)).
		EditMessage(in.MessageID).
		Build()

	return out.SendMessage(msg)
}

func (h *Handler) GetCommand() string {
	return Command
}
