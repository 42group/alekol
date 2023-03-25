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
          adduser --system -G web web

COPY --from=builder /usr/src/dist/apps/web web
RUN chown -R web:web .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix web --omit=dev -f install

CMD [ "npm", "--prefix", "web", "run", "start" ]
