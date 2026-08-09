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

# Run Go dev server and React dev server together
serve:
	@trap 'kill 0' EXIT; \
	go run ./cmd/service -dev & \
	cd pkg/client/ZpotifyUI && bun dev & \
	wait

# Build UI part of project
client-build: codegen .build-ui

.build-ui:
	cd pkg/client/@zpotify/api && npm link
	cd pkg/client/ZpotifyUI && npm link @zpotify/api && npm run build:ui