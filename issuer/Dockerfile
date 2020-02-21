# :3
FROM golang:alpine AS go-builder
ENV GO111MODULE="on"
WORKDIR /app
COPY ./issuer .
RUN go mod download

# build react app
FROM node:alpine AS react-builder
WORKDIR /app
COPY ./issuer/client .
RUN npm ci && npm run build

# build binary
FROM go-builder AS binary-builder
COPY --from=react-builder /app/build ./client
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o /go/bin/app

# serve react app
FROM alpine:latest
COPY --from=binary-builder /go/bin/app /go/bin/app
EXPOSE 8080
CMD ["/go/bin/app"]