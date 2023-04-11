# Builder
FROM docker.io/node:lts-alpine AS builder
WORKDIR /usr/src
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build api --generatePackageJson

# Runner
FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /usr/src

RUN addgroup --system api && \
          adduser --system -G api api

COPY --from=builder /usr/src/dist/apps/api api
RUN chown -R api:api .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix api --omit=dev -f install

CMD [ "node", "api/main.js" ]
