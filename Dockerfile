# ---- Web client build ----
FROM node:23-alpine3.20 AS webclient

WORKDIR /web

RUN --mount=type=bind,target=/web,rw \
    --mount=type=cache,target=/web/pkg/web/@zpotify/api/node_modules \
    --mount=type=cache,target=/web/pkg/web/ZpotifyUI/node_modules \
    --mount=type=cache,target=/root/.cache/yarn \
    cd /web/pkg/web/@zpotify/api && \
    yarn install --frozen-lockfile && \
    yarn build && \
    cd /web/pkg/web/ZpotifyUI && \
    yarn install --frozen-lockfile && \
    yarn build && \
    mv dist /dist

FROM --platform=$BUILDPLATFORM golang AS builder

WORKDIR /src

COPY --from=webclient /dist /dist

RUN --mount=type=bind,target=/src,rw \
    --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg \
    --mount=type=cache,target=/go/mod \
    rm -rf /src/internal/transport/web/dist &&\
    mkdir -p /src/internal/transport/web/dist && \
    mv /dist/* /src/internal/transport/web/dist && \
    go mod download && \
    GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 \
    go build -o /deploy/server/service /src/cmd/service/main.go && \
    cp -r config /deploy/server/config && \
    mkdir -p /deploy/server/migrations && \
    cp -r /src/migrations/* /deploy/server/migrations/

FROM alpine

LABEL MATRESHKA_CONFIG_ENABLED=true

WORKDIR /app

COPY --from=builder /deploy/server/ .

EXPOSE 80

ENTRYPOINT ["./service"]