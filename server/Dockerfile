# Stage 1: build the web app (node deps + compile)
FROM node:20-alpine AS app-builder
WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci
COPY app/ .
RUN npm run build

# Stage 2: build the Go server
FROM golang:1.21-alpine AS go-builder
WORKDIR /src
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ .
RUN go build -o /papaya ./cmd/papaya

# Stage 3: run server with baked-in static assets
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=go-builder /papaya .
COPY --from=app-builder /app/dist /var/www/papaya
EXPOSE 1234
CMD ["./papaya"]
