package middleware

import (
	"context"
)

type tgUserId struct{}

func WithTgUserId(ctx context.Context, id int64) context.Context {
	return context.WithValue(ctx, tgUserId{}, id)
}

func GetTgUserId(ctx context.Context) (int64, bool) {
	v, ok := ctx.Value(tgUserId{}).(int64)
	if ok {
		return v, true
	}

	return 0, false
}
