package telegram

import (
	"context"

	client "github.com/Red-Sock/go_tg"

	"go.zpotify.ru/zpotify/internal/config"
	"go.zpotify.ru/zpotify/internal/responses"
	"go.zpotify.ru/zpotify/internal/transport/telegram/version"
)

type Server struct {
	bot *client.Bot
}

func NewServer(cfg config.Config, bot *client.Bot) (s *Server) {
	s = &Server{
		bot: bot,
	}

	rm := responses.New()

	{
		// Add handlers here
		s.bot.AddCommandHandler(version.New(rm))
	}

	return s
}

func (s *Server) Start(_ context.Context) error {
	return s.bot.Start()
}

func (s *Server) Stop() error {
	s.bot.Stop()
	return nil
}
