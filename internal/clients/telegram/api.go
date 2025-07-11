package telegram

import (
	"context"
	"encoding/json"
	"net/http"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"go.redsock.ru/rerrors"
)

type TgApiClient interface {
	GetFile(ctx context.Context, uniqueFileId string) (*tgbotapi.File, error)
}

type tgApi struct {
	telegramLink string
}

func NewTgApiClient(token string) TgApiClient {
	return &tgApi{
		telegramLink: "https://api.telegram.org/bot" + token + "/",
	}
}

func (t *tgApi) GetFile(ctx context.Context, uniqueFileId string) (*tgbotapi.File, error) {
	req, err := http.NewRequest(http.MethodGet, t.telegramLink+"getFile", nil)
	if err != nil {
		return nil, rerrors.Wrap(err, "error formit request")
	}

	req = req.WithContext(ctx)

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

	var r tgFileResponse
	err = json.NewDecoder(resp.Body).Decode(&r)
	if err != nil {
		return nil, rerrors.Wrap(err, "error decoding response")
	}

	return &r.Result, nil
}
