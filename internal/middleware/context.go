package middleware

import (
	"context"
)

type tgUserId struct{}

type UserContext struct {
	TgUserId int64
}

func WithUserContext(ctx context.Context, uc UserContext) context.Context {
	return context.WithValue(ctx, tgUserId{}, uc)
}

func GetUserContext(ctx context.Context) (UserContext, bool) {
	v, ok := ctx.Value(tgUserId{}).(UserContext)
	if ok {
		return v, true
	}

	return v, false
}
