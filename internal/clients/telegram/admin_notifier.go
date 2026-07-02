package telegram

import (
	"fmt"

	"github.com/Red-Sock/go_tg"
	"github.com/Red-Sock/go_tg/model/keyboard"
	"github.com/Red-Sock/go_tg/model/response"
	"go.redsock.ru/rerrors"
)

// AdminNotifier sends admin-facing notifications to a configured Telegram chat.
type AdminNotifier struct {
	bot    go_tg.TgApi
	chatId int64
}

func NewAdminNotifier(bot go_tg.TgApi, chatId int64) *AdminNotifier {
	notifier := &AdminNotifier{
		bot:    bot,
		chatId: chatId,
	}

	return notifier
}

// NotifyNewUser sends a message with "Give access" and "Give creator access" buttons
// to the admin chat. No-op if the notifications chat isn't configured.
func (n *AdminNotifier) NotifyNewUser(userId int64, displayName string, username string) error {
	if n.chatId == 0 {
		return nil
	}

	giveAccessButton := keyboard.NewButton("Give access", fmt.Sprintf("/grant_access %d", userId))
	giveCreatorAccessButton := keyboard.NewButton("Give creator access", fmt.Sprintf("/grant_creator_access %d", userId))

	keys := &keyboard.GridKeyboard{}
	keys.AddButton(giveAccessButton)
	keys.AddButton(giveCreatorAccessButton)

	usernameSuffix := ""
	if username != "" {
		usernameSuffix = " @" + username
	}

	text := fmt.Sprintf("New user registered: %s%s (id=%d)", displayName, usernameSuffix, userId)

	msg := response.New().
		SetText(text).
		SetKeyboard(keys).
		Build()
	msg.SetChatIdIfZero(n.chatId)

	err := n.bot.Send(msg)
	if err != nil {
		return rerrors.Wrap(err, "send new user notification")
	}

	return nil
}
