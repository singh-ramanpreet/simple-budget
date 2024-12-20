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
	DB_FILE_PATH=$(shell sed -n 's/DB_FILE_PATH=\(.*\)/\1/p' .env)
	DATABASE_URL=$(shell sed -n 's/DATABASE_URL=file:\(.*\)/\1/p' .env)
	touch $(DB_FILE_PATH)
	docker build -f migrate.Dockerfile -t simple-budget-migrate .
	docker run --env-file .env -it --rm -v $(DB_FILE_PATH):$(DATABASE_URL) simple-budget-migrate
	docker rmi simple-budget-migrate
