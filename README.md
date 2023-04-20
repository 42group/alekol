# Alekol

Alekol is a Discord bot to automatically add or remove a role whether you are logged at 42 school.

![image](https://user-images.githubusercontent.com/76964081/163008574-42fdb83b-082a-4c3f-9572-27dbb4ad9842.png)

## Installation

If you don't want to invite the official bot in your server, you can host your own instance.

The easiest and recommended way is using Docker.

### Docker

First of all, create a Discord and 42 applications (refer to their respective documentation for more information). Don't forget to setup the redirect URIs. If you have any difficulties with this step, checkout what OAuth2 is.

Next, you're gonna need to create a `.env` file (`cp .env.template .env`) and fill in the fields.

```
# Global
FRONTEND_BASE_URL= # The URL from which the frontend will be accessed (e.g. https://alekol.42group.fr)

# Discord
DISCORD_API_CLIENT_ID= # Your Discord client Id
DISCORD_API_CLIENT_SECRET= # Your Discord client secret

# 42
FT_API_CLIENT_ID= # Your 42 client ID
FT_API_CLIENT_SECRET= # Your 42 client sercret

# Secret
SESSION_PASSWORD= # The password that will be used to encrypt cookies. For more information: https://github.com/vvo/iron-session

DATABASE_NAME= # The database name
DATABASE_USERNAME= # Username of the postgres user
DATABASE_PASSWORD= # Password of the postgres user
DATABASE_URL="postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@database:5432/${DATABASE_NAME}?schema=public" # This is URL to which the API will be able to connect to access the Postgres database. This can be left untouched
```

You can now start the server.

```sh
docker compose up --build -d
```

Once all services have started, you're gonna need to initialize (or "migrate", as Prisma calls it) the database. This is not done automatically at startup, sorry for the inconvenience.

```sh
docker compose -f docker-compose.yml -f docker-compose.migration.yml up --build prisma-migrate
```

This command will start the migration script in its own Docker container. Once that's done, you can remove the container (not doing so will not cause you any trouble though).

```sh
docker compose -f docker-compose.yml -f docker-compose.migration.yml rm prisma-migrate
```
