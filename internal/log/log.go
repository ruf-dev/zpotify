package log

import (
	"context"

	"github.com/rs/zerolog"
	zlog "github.com/rs/zerolog/log"
	"go.opentelemetry.io/otel/trace"
)

type FieldFn func(*zerolog.Event) *zerolog.Event

type logKey struct{}

func WithContext(ctx context.Context) context.Context {
	fns := make([]FieldFn, 0)
	return context.WithValue(ctx, logKey{}, &fns)
}

func AddField(ctx context.Context, fn FieldFn) {
	ptr, ok := ctx.Value(logKey{}).(*[]FieldFn)
	if !ok || ptr == nil {
		return
	}
	*ptr = append(*ptr, fn)
}

func Debug(ctx context.Context) *zerolog.Event {
	return fromContext(ctx, zlog.Debug())
}

func Info(ctx context.Context) *zerolog.Event {
	return fromContext(ctx, zlog.Info())
}

func Warn(ctx context.Context) *zerolog.Event {
	return fromContext(ctx, zlog.Warn())
}

func Error(ctx context.Context) *zerolog.Event {
	return fromContext(ctx, zlog.Error())
}

func Fatal(ctx context.Context) *zerolog.Event {
	return fromContext(ctx, zlog.Fatal())
}

func fromContext(ctx context.Context, e *zerolog.Event) *zerolog.Event {
	sc := trace.SpanFromContext(ctx).SpanContext()
	if sc.IsValid() {
		e = e.Str("trace_id", sc.TraceID().String()).Str("span_id", sc.SpanID().String())
	}

	ptr, ok := ctx.Value(logKey{}).(*[]FieldFn)
	if !ok || ptr == nil {
		return e
	}
	for _, fn := range *ptr {
		e = fn(e)
	}
	return e
}
