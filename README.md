# node-postgres-app

## Setup

```sh
npm ci
cp .env.template .env
```

## Run locally

```sh
docker compose up
npm start
```

## Run tests

NOTE: Docker daemon needs to be running in order to start Postgres Testcontainer before tests

```sh
npm test
```

## Migrate database schema before deployment

```sh
./migrate.sh \
    --host <DB_HOST> \
    --db <DB_NAME>  \
    --user <DB_USER>  \
    --password <DB_PASSWORD>
```
