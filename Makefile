include rscli.mk

build-ui: .build-web-api .build-ui

.build-web-api:
	cd pkg/web/@zpotify/api && yarn && yarn build

.build-ui:
	cd pkg/web/@zpotify/api && yarn && yarn build
	cd pkg/web/ZpotifyUI && yarn && yarn build
	cp -r pkg/web/ZpotifyUI/dist internal/transport/web

link:
	cd pkg/web/@zpotify/api && npm link