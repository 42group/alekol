# Builder
FROM docker.io/node:lts-alpine AS builder
WORKDIR /usr/src
RUN npm install -g nx
COPY . .
RUN npx nx build web

# Runner
FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /usr/src

RUN addgroup --system web && \
          adduser --system -G web web && \
          mkdir web

COPY --from=builder --chown=web:web /usr/src/dist/apps/web/package*.json web/
# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix web --omit=dev -f install

COPY --from=builder --chown=web:web /usr/src/dist/apps/web/. web/

CMD [ "npm", "--prefix", "web", "run", "start" ]
