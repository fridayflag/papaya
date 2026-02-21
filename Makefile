env:
	@if [ ! -f .env ]; then cp .env.example .env; fi

# Docker compose commands for development
dev:
	docker compose -f dev.docker-compose.yaml up -d --build

dev-stop:
	docker compose -f dev.docker-compose.yaml down

dev-clean: dev-stop
	docker compose -f dev.docker-compose.yaml down -v

# Clean commands
client-clean:
	rm -rf packages/papaya-web/node_modules packages/papaya-web/dist

server-clean:
	rm -rf packages/papaya-server/node_modules packages/papaya-server/dist packages/papaya-server/web-assets/*

clean: client-clean server-clean

.PHONY: \
	web-build server-build server-web-assets \
	image dev dev-stop dev-clean \
	clean client-clean server-clean install
