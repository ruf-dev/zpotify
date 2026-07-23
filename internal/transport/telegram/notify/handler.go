package notify

import (
	"fmt"
	"strings"

	tgapi "github.com/Red-Sock/go_tg/interfaces"
	"github.com/Red-Sock/go_tg/model"
	"github.com/Red-Sock/go_tg/model/response"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/service"
)

const (
	CommandNotify        = "/notify"
	CommandNotifyConsent = "/notify_consent"

	// defaultTitle is used when the admin's message has no natural title line
	// (i.e. is a single line) - see parseTitleAndBody.
	defaultTitle = "Announcement"
)

// Handler broadcasts an admin-authored notification to every user, in
// response to a /notify (no consent required) or /notify_consent (requires
// consent) command. Only reachable from the trusted admin notifications chat.
type Handler struct {
	notificationService service.NotificationService
	adminChatId         int64

	command         string
	requiresConsent bool
}

// New builds the /notify handler: broadcasts a notification that does not require consent.
func New(notificationService service.NotificationService, adminChatId int64) *Handler {
	return &Handler{
		notificationService: notificationService,
		adminChatId:         adminChatId,
		command:             CommandNotify,
		requiresConsent:     false,
	}
}

// NewConsent builds the /notify_consent handler: broadcasts a notification that requires consent.
func NewConsent(notificationService service.NotificationService, adminChatId int64) *Handler {
	return &Handler{
		notificationService: notificationService,
		adminChatId:         adminChatId,
		command:             CommandNotifyConsent,
		requiresConsent:     true,
	}
}

func (h *Handler) Handle(in *model.MessageIn, out tgapi.Chat) error {
	if in.Chat.ID != h.adminChatId {
		return nil
	}

	text := strings.TrimSpace(strings.TrimPrefix(in.Text, h.command))
	if text == "" {
		return rerrors.New("missing notification text: usage " + h.command + " <markdown text>")
	}

	title, body := parseTitleAndBody(text)

	err := h.notificationService.CreateAndBroadcast(in.Ctx, title, body, h.requiresConsent)
	if err != nil {
		sendErr := out.SendMessage(response.New().
			SetText(fmt.Sprintf("Failed to send notification: %v", err)).
			Build())
		if sendErr != nil {
			return rerrors.Wrap(err, "broadcast notification: also failed to notify chat: "+sendErr.Error())
		}

		return rerrors.Wrap(err, "broadcast notification")
	}

	msg := response.New().
		SetText(fmt.Sprintf("Notification %q sent to all users", title)).
		Build()

	return out.SendMessage(msg)
}

func (h *Handler) GetCommand() string {
	return h.command
}

// parseTitleAndBody splits admin-authored notification text into a title and
// a markdown body: the first line becomes the title, the rest becomes the
// body. If the text is a single line (no natural title/body split), a fixed
// placeholder title is used and the whole text becomes the body.
func parseTitleAndBody(text string) (title, body string) {
	firstLine, rest, hasBody := strings.Cut(text, "\n")
	if !hasBody {
		return defaultTitle, text
	}

	return strings.TrimSpace(firstLine), strings.TrimSpace(rest)
}
