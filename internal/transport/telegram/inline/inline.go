package inline

import (
	"context"
	"fmt"
	"strconv"

	"github.com/Red-Sock/go_tg/model"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/rs/zerolog/log"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/service"
)

// resultLimit caps how many tracks are offered per inline query.
const resultLimit = 8

// loadingCallbackData is the (unused) callback data for the placeholder
// button attached to a not-yet-cached result - its only purpose is to make
// Telegram assign the result an inline_message_id, which HandleChosen needs
// to later edit the placeholder into the real audio.
const loadingCallbackData = "noop"

// InlineMessageEditor redelivers an already-known Telegram file_id into the
// chat an inline message lives in, replacing its current content. Declared
// here (consumer side) rather than in the telegram client package so Handler
// only depends on the shape it actually needs. Satisfied directly by
// go_tg.TgApi.
type InlineMessageEditor interface {
	EditInlineMessageAudio(inlineMessageId, fileId string) error
}

// Handler answers Telegram inline queries ("@botname <query>") with cached
// audio results for matching tracks, registered via go_tg.TgApi.SetInlineQueryHandler,
// and finishes preparing a track's audio once the user actually selects a
// result, registered via go_tg.TgApi.SetChosenInlineResultHandler.
type Handler struct {
	searchService       service.SearchService
	audioService        service.AudioService
	authService         service.AuthService
	inlineMessageEditor InlineMessageEditor
}

func New(
	searchService service.SearchService,
	audioService service.AudioService,
	authService service.AuthService,
	inlineMessageEditor InlineMessageEditor,
) *Handler {
	return &Handler{
		searchService:       searchService,
		audioService:        audioService,
		authService:         authService,
		inlineMessageEditor: inlineMessageEditor,
	}
}

// Handle answers an inline query. It never uploads or relays anything - each
// track is either already cached (answered as InlineQueryResultCachedAudio,
// delivered by Telegram directly) or not yet cached (answered as a
// placeholder article carrying a keyboard, so Telegram assigns it an
// inline_message_id for HandleChosen to edit later).
func (h *Handler) Handle(in *model.InlineQueryIn) ([]interface{}, error) {
	if in.Query == "" {
		return nil, nil
	}

	userId, err := h.authService.GetOrCreateTelegramUser(context.Background(), in.From.ID, in.From.UserName)
	if err != nil {
		log.Error().Err(err).Msg("error resolving telegram user for inline query")
		return nil, nil
	}

	searchParams := domain.SearchParams{
		Query:  in.Query,
		Limit:  resultLimit,
		UserId: userId,
	}

	searchResult, err := h.searchService.Search(context.Background(), searchParams)
	if err != nil {
		log.Error().Err(err).Msg("error searching tracks for inline query")
		return nil, nil
	}

	results := make([]interface{}, 0, len(searchResult.Tracks))
	for _, track := range searchResult.Tracks {
		result := h.buildResult(track)
		results = append(results, result)
	}

	return results, nil
}

func (h *Handler) buildResult(track domain.Song) interface{} {
	id := strconv.FormatInt(track.SongBase.Id, 10)

	fileId, ok, err := h.audioService.GetCachedTelegramFileId(context.Background(), track.SongBase.Id)
	if err != nil {
		log.Error().Err(err).Int64("song_id", track.SongBase.Id).Msg("error getting cached telegram file id for inline result")
		ok = false
	}

	if ok {
		return tgbotapi.NewInlineQueryResultCachedAudio(id, fileId)
	}

	placeholder := tgbotapi.NewInlineQueryResultArticle(
		id,
		track.Title,
		fmt.Sprintf("⏳ Loading “%s”…", track.Title),
	)
	placeholderKeyboard := tgbotapi.NewInlineKeyboardMarkup(
		tgbotapi.NewInlineKeyboardRow(tgbotapi.NewInlineKeyboardButtonData("⏳", loadingCallbackData)),
	)
	placeholder.ReplyMarkup = &placeholderKeyboard

	return placeholder
}

// HandleChosen finishes preparing the audio for a chosen inline result:
// relay-uploads it if needed (or reads the cache if another selection beat
// it there), then edits the placeholder into the real audio. A no-op for a
// result that was already answered as InlineQueryResultCachedAudio, since
// Telegram never assigns those an InlineMessageID.
func (h *Handler) HandleChosen(in *model.ChosenInlineResultIn) error {
	songId, err := strconv.ParseInt(in.ResultID, 10, 64)
	if err != nil {
		log.Error().Err(err).Str("result_id", in.ResultID).Msg("error parsing song id from chosen inline result")
		return nil
	}

	fileId, err := h.audioService.EnsureTelegramFileId(context.Background(), songId)
	if err != nil {
		log.Error().Err(err).Int64("song_id", songId).Msg("error ensuring telegram file id for chosen inline result")
		return nil
	}

	if in.InlineMessageID == "" {
		return nil
	}

	err = h.inlineMessageEditor.EditInlineMessageAudio(in.InlineMessageID, fileId)
	if err != nil {
		log.Error().Err(err).Int64("song_id", songId).Msg("error editing inline message with resolved audio")
		return nil
	}

	return nil
}
