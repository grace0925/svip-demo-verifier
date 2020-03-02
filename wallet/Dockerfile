# download app dependencies
FROM golang:alpine AS go-builder
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64
RUN apk add --update openssl && \
    rm -rf /var/cache/apk/*
WORKDIR /gobase
COPY . .
RUN go mod download

# build react app
FROM node:alpine AS react-builder
WORKDIR /nodebase
COPY ./wallet/client .
RUN npm ci && npm run build

# compile go binary && generate keys
FROM go-builder AS binary-builder
RUN cd utils/ && ./generate-keys.sh
RUN go build -o=/go/bin/app -a ./wallet/main.go

# serve react app
FROM alpine:latest
WORKDIR /main
COPY --from=react-builder /nodebase/ ./client
COPY --from=binary-builder /go/bin/app .
COPY --from=binary-builder /gobase/keys/tls/ ../keys/tls/
ENTRYPOINT ["./app"]