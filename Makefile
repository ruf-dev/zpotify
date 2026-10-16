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

# Starts the e2e Postgres and Garage S3 containers and provisions Garage's layout and fixed access key.
setup-e2e-env:
	docker compose up -d --wait test-db test-garage
	./scripts/setup_test_garage.sh

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

# Desktop mode: Go binary (API only, :8087) + Vite dev server (HMR, :5173, proxies /api and /wapi
# to :8087), run concurrently. Shares :8087 with serve-rc, so run one or the other.
serve:
	docker compose up -d db nginx
	@trap 'kill 0' EXIT INT TERM; \
	(cd pkg/client/ZpotifyUI && bun run dev) & \
	go run ./cmd/service -dev & \
	wait

# Remote-control mode: build the UI, embed it into the Go binary, run the binary alone on :8087.
# Shares :8087 with serve (desktop mode), so run one or the other.
serve-rc: build-ui
	docker compose up -d db nginx
	go run ./cmd/service -dev

# Build UI part of project
client-build: codegen .build-ui

.build-ui:
	cd pkg/client/@zpotify/api && npm link
	cd pkg/client/ZpotifyUI && npm link @zpotify/api && npm run build:ui