ONESKY_PROJECT_ID=60763

help: ## Show help
	@echo
	@echo "Usage: make [target]"
	@echo
	@printf "\033[1;93mAvailable targets:\033[0m\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf " \033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo

install: node_modules build ## Install all requirements

node_modules: package.json package-lock.json
	npm install

build-dev: ## Build extension for development
	node_modules/.bin/encore dev

build: ## Build and package as mbt.zip for Chrome Web Store
	node_modules/.bin/encore prod
	rm -f dist/webpack-manifest.json dist/entrypoints.json dist/tests.js
	(cd dist/ && zip -r ../mbt.zip *)

test:
	node_modules/.bin/jest --config=./jest.config.js

translations-download:
	bash scripts/translations-download.sh ${ONESKY_PROJECT_ID} nl messages.json src/_locales/nl/messages.json
	bash scripts/translations-download.sh ${ONESKY_PROJECT_ID} de messages.json src/_locales/de/messages.json
	bash scripts/translations-download.sh ${ONESKY_PROJECT_ID} en messages.json src/_locales/en/messages.json

translations-upload:
	bash scripts/translations-upload.sh ${ONESKY_PROJECT_ID} en src/_locales/en/messages.json

.PHONY: install build-dev build test translations-download translations-upload
