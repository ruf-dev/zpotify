package telegram

import (
	"context"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"go.redsock.ru/rerrors"
	"go.redsock.ru/toolbox"
)

type TokenParser interface {
	ParseTelegramClaims(idToken string) (Claims, error)
}

type tokenParser struct {
	keyFunc keyfunc.Keyfunc
}

func NewTokenParser(ctx context.Context, oauthUrl string) (TokenParser, error) {
	oauthUrl = toolbox.Coalesce(oauthUrl, "https://oauth.telegram.org/.well-known/jwks.json")
	jwks, err := keyfunc.NewDefaultCtx(ctx, []string{oauthUrl})
	if err != nil {
		return nil, rerrors.Wrap(err, "init telegram jwks client")
	}

	return &tokenParser{
		jwks,
	}, nil
}

func (t *tokenParser) ParseTelegramClaims(idToken string) (Claims, error) {
	claims := Claims{}
	token, err := jwt.ParseWithClaims(idToken,
		&claims,
		t.keyFunc.Keyfunc,
		jwt.WithValidMethods([]string{"RS256", "ES256"}))
	if err != nil {
		return claims, rerrors.Wrap(err, "parse telegram id_token")
	}

	if !token.Valid {
		return claims, rerrors.New("invalid telegram token")
	}

	return claims, nil
}
