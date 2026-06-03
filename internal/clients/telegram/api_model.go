package telegram

import (
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/golang-jwt/jwt/v5"
)

type tgFileResponse struct {
	Ok     bool          `json:"ok"`
	Result tgbotapi.File `json:"result"`
}

type Claims struct {
	jwt.RegisteredClaims
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	ID        int64  `json:"id"`        // Telegram user ID
	PhotoURL  string `json:"photo_url"` // Profile photo URL (optional)
	AuthDate  int64  `json:"auth_date"` // Unix timestamp of authentication
	Hash      string `json:"hash"`
}
