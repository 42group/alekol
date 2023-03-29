# Builder
FROM docker.io/node:lts-alpine AS builder
WORKDIR /usr/src
RUN npm install -g nx
COPY . .
RUN npx nx build api --bundle

# Runner
FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /usr/src

RUN addgroup --system api && \
          adduser --system -G api api

COPY --from=builder /usr/src/dist/apps/api api
RUN chown -R api:api .

CMD [ "node", "api" ]
