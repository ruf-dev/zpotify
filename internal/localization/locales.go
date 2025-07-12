package localization

import (
	"github.com/Red-Sock/go_tg/model"
)

const (
	telegramLangCodeEN = "en"
	telegramLangCodeRU = "ru"
)

func ParseLangFromChatMessage(in *model.MessageIn) Locale {
	switch in.From.LanguageCode {
	case telegramLangCodeEN:
		return En
	case telegramLangCodeRU:
		return Ru
	default:
		return defaultLocale
	}
}

func GetLocaleOrDefault(in string) Locale {
	switch Locale(in) {
	case En:
		return En
	case Ru:
		return Ru
	default:
		return defaultLocale
	}
}
