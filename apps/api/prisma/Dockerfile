FROM docker.io/node:lts-alpine AS builder
WORKDIR /usr/src

RUN npm install -g prisma
COPY ./apps/api/prisma/ ./prisma/

CMD [ "prisma", "migrate", "deploy" ]
