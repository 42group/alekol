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
FT_USER_ID_COOKIE= # KEEP THIS SECRET, THIS IS SENSITIVE INFORMATION !! Your 42 `user.id` cookie (checkout the FAQ for more information)
FT_USER_ID= # Your 42 user ID (checkout the FAQ for more information)

# Secret
SESSION_PASSWORD= # The password that will be used to encrypt cookies. For more information: https://github.com/vvo/iron-session

DATABASE_NAME= # The database name
DATABASE_USERNAME= # Username of the postgres user
DATABASE_PASSWORD= # Password of the postgres user
DATABASE_URL="postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@database:5432/${DATABASE_NAME}?schema=public" # This is URL to which the API will be able to connect to access the Postgres database. This can be left untouched

# Redis cache
CACHE_HOST= # The host of the Redis server (probably `redis` if you run using Docker)
CACHE_PORT=6379 # The port of the Redis server (default)
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

## FAQ

### How do I find my user ID and my `user.id` cookie ? And what is the difference ?

Ok, first of all, these IDs are required for the websocket to work. It seems to be the way that 42 authenticates you when you want to connect to their socket.

Now the difference is pretty straightforward (even though the names can be confusing). Your user ID is the ID by which you are recognized by the API. It is unique, and it represents you as a user. It is a public information. Your `user.id` cookie if the cookie that allows you to browse the intranet. **IT IS A VERY SENSITIVE INFORMATION** so **KEEP IT A SECRET**. Anyone with this cookie can and will use your intranet account, without you knowing.

To find this cookie, just go on [the intra page](https://profile.intra.42.fr) and copy the `user.id` cookie (you will be able to find it in the Developer Tools of most Web Browser).
