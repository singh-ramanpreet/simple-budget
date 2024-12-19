.PHONY: build-production
build-production:
	docker compose -f compose.production.yml build

.PHONY: up-production
up-production:
	docker compose -f compose.production.yml up -d

.PHONY: down-production
down-production:
	docker compose -f compose.production.yml down

.PHONY: migrate-database
migrate-database:
	touch database.db
	docker build -f migrate.Dockerfile -t simple-budget-migrate .
	docker run --env-file .env -it --rm -v $(PWD)/database.db:/app/database.db simple-budget-migrate
	docker rmi simple-budget-migrate
