package v1

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/Red-Sock/go_tg"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"go.redsock.ru/rerrors"
)

type fileResponse struct {
	Ok     bool          `json:"ok"`
	Result tgbotapi.File `json:"result"`
}
type FileService struct {
	bot *go_tg.Bot

	telegramLink string
}

func NewFileService(bot *go_tg.Bot) *FileService {
	return &FileService{
		bot: bot,

		telegramLink: "https://api.telegram.org/bot" + bot.Bot.Token + "/",
	}
}

func (s *FileService) GetInfo(ctx context.Context, uniqueFileId string) (*tgbotapi.File, error) {
	req, err := http.NewRequest(http.MethodGet, s.telegramLink+"getFile", nil)
	if err != nil {
		return nil, rerrors.Wrap(err, "error formit request")
	}

	params := req.URL.Query()
	params.Add("file_id", uniqueFileId)
	req.URL.RawQuery = params.Encode()

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error sending request")
	}

	if resp.StatusCode != http.StatusOK {
		return nil, rerrors.New(http.StatusText(resp.StatusCode))
	}

	var r fileResponse
	err = json.NewDecoder(resp.Body).Decode(&r)
	if err != nil {
		return nil, rerrors.Wrap(err, "error decoding response")
	}

	return &r.Result, nil
}
