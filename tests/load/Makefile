.pull-image:
	docker pull yandex/yandex-tank:latest

run:
	docker run \
		--name zpotify-loadtest \
		-- rm \
		-v $(pwd):/var/loadtest \
		--platform linux/amd64 \
		--add-host=host.docker.internal:host-gateway \
		-it \
		--entrypoint /bin/bash \
		yandex/yandex-tank
