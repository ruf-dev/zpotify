package telegram

import (
	"context"

	client "github.com/Red-Sock/go_tg"
	"github.com/Red-Sock/go_tg/model"
	"github.com/rs/zerolog/log"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/localization"
	"go.zpotify.ru/zpotify/internal/service"
	"go.zpotify.ru/zpotify/internal/transport/telegram/add"
	"go.zpotify.ru/zpotify/internal/transport/telegram/default_handler"
	"go.zpotify.ru/zpotify/internal/transport/telegram/start"
)

type Server struct {
	bot *client.Bot
}

func NewServer(bot *client.Bot, service service.Service) (s *Server, err error) {
	s = &Server{
		bot: bot,
	}

	responsesBuilder := localization.New()
	s.bot.ExternalContext = func(in *model.MessageIn) context.Context {

		// TODO Replace onto in-memory cache
		// it works fine on MVP stage but will struggle
		// when real load starts

		// Implement following algorithm:
		// Try lookup in cache
		// Try lookup in storage

		// If found - extract locale and move on

		// Init in storage
		// Store in cache
		ctx := context.Background()

		u, err := service.UserService().Get(ctx, in.From.ID)
		if err == nil {
			ctx = localization.LangToCtx(ctx, localization.GetLocaleOrDefault(u.Locale))
			return ctx
		}

		locale := localization.ParseLangFromChatMessage(in)

		ctx = localization.LangToCtx(ctx, locale)

		user := domain.User{
			UserInfo: domain.UserInfo{
				TgId:       in.From.ID,
				TgUserName: in.From.UserName,
			},
			UserSettings: domain.UserSettings{
				Locale: string(locale),
			},
		}

		err = service.UserService().Init(ctx, user)
		if err != nil {
			log.Error().Err(err).Msg("error during user initialization")
		}

		return ctx
	}
	{
		s.bot.AddCommandHandler(start.New(responsesBuilder, service.AuthService()))

		addHandler := add.New(service.AudioService(), responsesBuilder)
		s.bot.AddCommandHandler(addHandler)

		s.bot.SetDefaultCommandHandler(default_handler.New(responsesBuilder, addHandler))
	}

	return s, nil
}

func (s *Server) Start(_ context.Context) error {
	return s.bot.Start()
}

func (s *Server) Stop() error {
	s.bot.Stop()
	return nil
}
