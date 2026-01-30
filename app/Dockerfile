# Build the web app: install deps and compile.
# Output ends up in /app/dist (Vite default).
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Minimal image with only the built assets (for COPY --from= or standalone use).
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/dist ./dist
# Default: do nothing (image holds assets only). Can override to run a static server.
CMD ["true"]
