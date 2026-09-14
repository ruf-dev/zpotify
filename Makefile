DEFAULT: codegen lint


codegen:
	moti g
	sqlc generate
	cd pkg/client/ZpotifyUI && bun gen

lint:
	go fmt ./...
	./custom-gcl run ./...
	cd pkg/client/ZpotifyUI && bun lint

# Rebuild the custom-gcl binary (golangci-lint + callfence plugin), needed after
# bumping the golangci-lint version in .custom-gcl.yml or updating the callfence module.
custom-gcl:
	golangci-lint custom -v

reload-webserver:
	docker compose exec -it nginx nginx -s reload

# Client side
client:
	cd pkg/client/ZpotifyUI && vite

# Builds the production UI bundle and embeds it into the Go binary's serving dir, so the Go
# service alone has something real to serve (e.g. behind a reverse proxy).
build-ui:
	cd pkg/client/ZpotifyUI && bun install --frozen-lockfile && bun run build
	rm -rf internal/transport/ui/dist
	cp -r pkg/client/ZpotifyUI/dist internal/transport/ui/dist

# Run the Go dev server, serving the freshly built UI bundle embedded in the binary
serve: build-ui
	go run ./cmd/service -dev

# Build UI part of project
client-build: codegen .build-ui

.build-ui:
	cd pkg/client/@zpotify/api && npm link
	cd pkg/client/ZpotifyUI && npm link @zpotify/api && npm run build:ui