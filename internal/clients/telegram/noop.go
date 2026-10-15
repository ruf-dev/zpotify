package telegram

import (
	"sync"

	"github.com/Red-Sock/go_tg"
	"github.com/Red-Sock/go_tg/interfaces"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

var _ go_tg.TgApi = (*NoopBot)(nil)

type NoopBot struct {
	stopC    chan struct{}
	stopOnce sync.Once
}

func NewNoopBot() *NoopBot {
	return &NoopBot{stopC: make(chan struct{})}
}

func (b *NoopBot) Start() error {
	<-b.stopC
	return nil
}

func (b *NoopBot) Stop() {
	b.stopOnce.Do(func() {
		close(b.stopC)
	})
}

func (b *NoopBot) MustAddCommandHandler(interfaces.CommandHandler) {}

func (b *NoopBot) AddCommandHandler(interfaces.CommandHandler) error {
	return nil
}

func (b *NoopBot) SetDefaultCommandHandler(interfaces.Handler) {}

func (b *NoopBot) SetInlineQueryHandler(interfaces.InlineQueryHandler) {}

func (b *NoopBot) SetChosenInlineResultHandler(interfaces.ChosenInlineResultHandler) {}

func (b *NoopBot) Send(interfaces.MessageOut) error {
	return nil
}

func (b *NoopBot) SendAndReturn(interfaces.MessageOut) (tgbotapi.Message, error) {
	return tgbotapi.Message{}, nil
}

func (b *NoopBot) EditInlineMessageAudio(string, string) error {
	return nil
}

func (b *NoopBot) DeleteMessage(int64, int) error {
	return nil
}
