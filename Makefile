.PHONY: build-production
build-production:
	docker compose -f compose.production.yml build

.PHONY: up-production
up-production:
	docker compose -f compose.production.yml up -d

.PHONY: down-production
down-production:
	docker compose -f compose.production.yml down
