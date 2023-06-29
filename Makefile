dev:
	npm run dev

install:
	npm ci

build:
	NODE_ENV=production npm run build

test:
	npm test

lint:
	npx eslint .

.PHONY: test
