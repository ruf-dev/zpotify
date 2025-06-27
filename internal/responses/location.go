package responses

import (
	"github.com/Red-Sock/go_tg/model"
)

const (
	telegramLangCodeEN = "en"
	telegramLangCodeRU = "ru"
)

func ParseLangFromChatMessage(in *model.MessageIn) lang {
	switch in.From.LanguageCode {
	case telegramLangCodeEN:
		return En
	case telegramLangCodeRU:
		return Ru
	default:
		return defaultLocale
	}
}
