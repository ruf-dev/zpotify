# ---- Web client build ----
FROM node:23-alpine3.20 AS webclient

WORKDIR /web

RUN --mount=type=bind,target=/web,rw \
    --mount=type=cache,target=/web/pkg/web/@vervstack/matreshka/node_modules \
    --mount=type=cache,target=/web/pkg/web/Matreshka-UI/node_modules \
    --mount=type=cache,target=/root/.cache/yarn \
    cd /web/pkg/web/@vervstack/matreshka && \
    yarn install --frozen-lockfile && \
    yarn build && \
    cd /web/pkg/web/Matreshka-UI && \
    yarn install --frozen-lockfile && \
    yarn build && \
    mv dist /dist

FROM --platform=$BUILDPLATFORM golang AS builder

WORKDIR /src

COPY --from=webclient /dist /dist

RUN --mount=target=. \
    --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg \
    GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 \
    mkdir -p /src/internal/transport/web/dist && \
    mv /dist/* /src/internal/transport/web/dist && \
    go build -o /deploy/server/service ./cmd/service/main.go && \
    cp -r config /deploy/server/config
FROM alpine

LABEL MATRESHKA_CONFIG_ENABLED=true

WORKDIR /app

COPY --from=builder /deploy/server/ .

ENTRYPOINT ["./service"]