# Multi-stage build for a small Node.js service.
# Showcases ARG/ENV/LABEL, multi-stage COPY --from, heredocs,
# HEALTHCHECK, ONBUILD, and inline shell.

# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.12.2
ARG ALPINE_VERSION=3.19

# ---- 1. Dependencies ---------------------------------------------------------
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

# ---- 2. Build ---------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS build

WORKDIR /app

COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY --link . .

ENV NODE_ENV=production \
    GENERATE_SOURCEMAP=false

RUN <<-BASH
	set -euo pipefail
	echo "Building $(node --version) on $(uname -sm)"
	npm run lint
	npm run build
	npm prune --production
BASH

# ---- 3. Runtime -------------------------------------------------------------
FROM alpine:${ALPINE_VERSION} AS runtime

ARG NODE_VERSION
ARG GIT_SHA=unknown

LABEL org.opencontainers.image.title="stationery-api"        \
      org.opencontainers.image.description="API service."    \
      org.opencontainers.image.source="https://example.com"  \
      org.opencontainers.image.revision="${GIT_SHA}"         \
      org.opencontainers.image.licenses="MIT"

RUN apk add --no-cache nodejs=~${NODE_VERSION%%.*} tini ca-certificates && \
    addgroup -S app && adduser -S app -G app

ENV PORT=3000           \
    NODE_ENV=production \
    PATH="/app/node_modules/.bin:$PATH"

WORKDIR /app
USER app:app

COPY --from=deps  --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist         ./dist
COPY --from=build --chown=app:app /app/package.json ./

EXPOSE 3000/tcp
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --spider "http://localhost:${PORT}/healthz" || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]

# Used when this image is consumed as a base.
ONBUILD COPY package.json /app/
