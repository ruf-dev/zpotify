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

// NotifyNewUser sends a message with a "Grant access" button to the admin chat.
// No-op if the notifications chat isn't configured.
func (n *AdminNotifier) NotifyNewUser(userId int64, username string) error {
	if n.chatId == 0 {
		return nil
	}

	grantAccessButton := keyboard.NewButton("Grant access", fmt.Sprintf("/grant_access %d", userId))

	keys := &keyboard.GridKeyboard{}
	keys.AddButton(grantAccessButton)

	text := fmt.Sprintf("New user registered: @%s (id=%d)", username, userId)

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
