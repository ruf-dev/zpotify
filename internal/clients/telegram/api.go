package telegram

import (
	"context"
	"encoding/json"
	"io"
	"net/http"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/user_errors"
)

type TgApiClient interface {
	GetFile(ctx context.Context, fileId string) (*tgbotapi.File, error)
	OpenFile(ctx context.Context, file domain.TgFile) (io.ReadCloser, error)
}

type tgApi struct {
	telegramLink string

	token      string
	httpclient *http.Client
}

func NewTgApiClient(token string) TgApiClient {
	return &tgApi{
		telegramLink: "https://api.telegram.org/bot" + token + "/",
		token:        token,
		httpclient:   http.DefaultClient,
	}
}

func (t *tgApi) GetFile(ctx context.Context, fileId string) (*tgbotapi.File, error) {
	req, err := http.NewRequestWithContext(ctx,
		http.MethodGet, t.telegramLink+"getFile", nil)
	if err != nil {
		return nil, rerrors.Wrap(err, "error formit request")
	}

	req = req.WithContext(ctx)

	params := req.URL.Query()
	params.Add("file_id", fileId)
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

func (t *tgApi) OpenFile(ctx context.Context, file domain.TgFile) (io.ReadCloser, error) {
	f := tgbotapi.File{
		FileID:   file.FileId,
		FilePath: file.FilePath,
	}

	link := f.Link(t.token)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, link, nil)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating request")
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, rerrors.Wrap(err, "error opening file")
	}

	if resp.StatusCode == http.StatusOK {
		return resp.Body, nil
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusNotFound:
		f, err := t.GetFile(ctx, file.FileId)
		if err != nil {
		// TODO implement failover
			_ = f
		}
		return nil, rerrors.Wrap(user_errors.NotFound("tg file"))
	default:
		return nil, rerrors.Wrap(user_errors.ErrUnexpected)
	}
}
