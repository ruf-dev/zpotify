package telegram

import (
	"context"

	client "github.com/Red-Sock/go_tg"
	"github.com/Red-Sock/go_tg/model"
	"github.com/rs/zerolog/log"

	"go.zpotify.ru/zpotify/internal/localization"
	"go.zpotify.ru/zpotify/internal/middleware/user_context"
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
		ctx := context.Background()

		userId, err := service.AuthService().GetOrCreateTelegramUser(ctx, in.From.ID, in.From.UserName)
		if err != nil {
			log.Error().Err(err).Msg("error during telegram user init")
			return ctx
		}

		u, err := service.UserService().Get(ctx, userId)
		if err != nil {
			log.Error().Err(err).Msg("error getting user after telegram init")
			return ctx
		}

		locale := localization.GetLocaleOrDefault(u.Locale)
		ctx = localization.LangToCtx(ctx, locale)
		ctx = user_context.WithUserContext(ctx,
			user_context.UserContext{
				UserId:      userId,
				Permissions: u.Permissions,
			})

		return ctx
	}
	{
		s.bot.MustAddCommandHandler(start.New(responsesBuilder))

		addHandler := add.New(service.AudioService(), responsesBuilder)
		s.bot.MustAddCommandHandler(addHandler)

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
