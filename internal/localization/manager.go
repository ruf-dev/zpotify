package localization

import (
	"context"
	_ "embed"
	"encoding/json"
)

var (
	//go:embed responses/en_EN.json
	enEn []byte
	//go:embed responses/ru_RU.json
	ruRu []byte
)

type Locale string

const (
	Ru            Locale = "ru"
	En            Locale = "en"
	defaultLocale Locale = En
)

type ResponseBuilder struct {
	responses map[Locale]responses
}

type Responses interface {
	Hello() string
	Auth() Auth
	File() File
}

func New() *ResponseBuilder {
	rm := &ResponseBuilder{
		responses: make(map[Locale]responses),
	}

	rm.responses[Ru] = loadLocal(ruRu)
	rm.responses[En] = loadLocal(enEn)

	rm.responses[defaultLocale] = rm.responses[En]
	return rm
}

func (m *ResponseBuilder) GetResponses(ctx context.Context) Responses {
	r := m.getResponses(LangFromCtx(ctx))
	return r
}

func (m *ResponseBuilder) getResponses(local Locale) responses {
	r, ok := m.responses[local]
	if ok {
		return r
	}

	return m.responses[defaultLocale]
}

func loadLocal(bytes []byte) (r responses) {
	err := json.Unmarshal(bytes, &r)
	if err != nil {
		panic(err)
	}

	return r
}

type contextLangKey struct{}

func LangToCtx(ctx context.Context, l Locale) context.Context {
	return context.WithValue(ctx, contextLangKey{}, l)
}
func LangFromCtx(ctx context.Context) Locale {
	v, _ := ctx.Value(contextLangKey{}).(Locale)
	if v == "" {
		return defaultLocale
	}

	return v
}
