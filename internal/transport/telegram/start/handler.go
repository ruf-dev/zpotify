package start

import (
	"strings"

	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"

	"go.zpotify.ru/zpotify/internal/localization"
	"go.zpotify.ru/zpotify/internal/service"
)

const Command = "/start"

type Handler struct {
	rm *localization.ResponseBuilder

	authService service.AuthService
}

func New(rm *localization.ResponseBuilder, authService service.AuthService) *Handler {
	return &Handler{
		rm:          rm,
		authService: authService,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	if len(in.Args) == 0 {
		msg := response.NewMessage(h.rm.Hello(in.Ctx))
		return out.SendMessage(msg)
	}

	splited := strings.SplitN(in.Args[0], "_", 2)

	switch {
	case splited[0] == authPrefix:
		return h.authenticate(in, splited[1], out)
	}

	return nil
}

func (h *Handler) GetCommand() string {
	return Command
}
