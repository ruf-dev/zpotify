package telegram

import (
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

type tgFileResponse struct {
	Ok     bool          `json:"ok"`
	Result tgbotapi.File `json:"result"`
}
