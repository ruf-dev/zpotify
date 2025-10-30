include rscli.mk

# Installs golang dependencies for codegen
install-go-deps:
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

# Build UI part of project
build-ui: codegen .build-ui

.build-ui:
	cd pkg/web/@zpotify/api && npm link
	cd pkg/web/ZpotifyUI && npm link @zpotify/api
	cp -r pkg/web/ZpotifyUI/dist internal/transport/web

link:
	cd pkg/web/@zpotify/api && npm link

# generates folders and installs dependencies
warmup:
	make .prepare-grpc-folders
	make .deps-grpc
	PROTOPACKPATH=proto_deps protopack mod download
# generates code on warm project
codegen:
	PROTOPACKPATH=proto_deps protopack generate
	cd pkg/web/ZpotifyUI && npm run build:api && npm run link

lint:
	golangci-lint run ./...

