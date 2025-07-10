package telegram

import (
	"context"

	client "github.com/Red-Sock/go_tg"
	"github.com/Red-Sock/go_tg/model"
	"github.com/rs/zerolog/log"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/responses"
	"go.zpotify.ru/zpotify/internal/service"
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

	uCache, err := newUserCache()
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating user cache")
	}

	responsesBuilder := responses.New()
	s.bot.ExternalContext = func(in *model.MessageIn) context.Context {
		ctx := context.Background()

		ctx = responses.LangToCtx(ctx,
			responses.ParseLangFromChatMessage(in))

		_, isInCache := uCache.Get(in.From.ID)
		if isInCache {
			return ctx
		}

		user := domain.User{
			TgId:       in.From.ID,
			TgUserName: in.From.UserName,
		}

		err = service.UserService().Init(ctx, user)
		if err != nil {
			log.Error().Err(err).Msg("initializing user")
		}

		uCache.Add(in.From.ID, struct{}{})
		return ctx
	}
	{
		// Add handlers here
		s.bot.AddCommandHandler(start.New(responsesBuilder))

		s.bot.SetDefaultCommandHandler(default_handler.New(responsesBuilder))
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
