package responses

import (
	"context"
	_ "embed"
	"encoding/json"
)

var (
	//go:embed en_EN.json
	enEn []byte
	//go:embed ru_RU.json
	ruRu []byte
)

type lang string

const (
	Ru            lang = "ru_RU"
	En            lang = "en_EN"
	defaultLocale lang = En
)

type ResponseManager struct {
	responses map[lang]responses
}

func New() *ResponseManager {
	rm := &ResponseManager{
		responses: make(map[lang]responses),
	}

	rm.responses[Ru] = loadLocal(ruRu)
	rm.responses[En] = loadLocal(enEn)

	rm.responses[defaultLocale] = rm.responses[En]
	return rm
}

func (m *ResponseManager) Hello(ctx context.Context) string {
	r := m.getResponses(LangFromCtx(ctx))
	return r.Hello
}

func (m *ResponseManager) getResponses(local lang) responses {
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

func LangToCtx(ctx context.Context, l lang) context.Context {
	return context.WithValue(ctx, contextLangKey{}, l)
}
func LangFromCtx(ctx context.Context) lang {
	v, _ := ctx.Value(contextLangKey{}).(lang)
	if v == "" {
		return defaultLocale
	}

	return v
}
