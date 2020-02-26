# create databases for issuer
FROM golang:latest
WORKDIR /init
COPY issuer/couchdb/init/init.go ./main/
COPY go.mod .
COPY go.sum .
RUN go mod download
RUN cd ./main/ && go build -o main && chmod +x main && ls
ENTRYPOINT ["/init/main/main"]