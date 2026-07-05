DEFAULT: codegen lint


codegen:
	moti g
	sqlc generate
	cd pkg/client/ZpotifyUI && bun gen

lint:
	go fmt ./...
	golangci-lint run ./...
	cd pkg/client/ZpotifyUI && bun lint

reload-webserver:
	docker compose restart

# Client side
client:
	cd pkg/client/ZpotifyUI && vite

# Build UI part of project
client-build: codegen .build-ui

.build-ui:
	cd pkg/client/@zpotify/api && npm link
	cd pkg/client/ZpotifyUI && npm link @zpotify/api && npm run build:ui