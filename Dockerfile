# React Production environment starts here
FROM node:alpine AS builder
WORKDIR /app
COPY ./client .
RUN yarn run build

FROM node:alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "80", "-s", "."]

# Instructions:
# $ docker build -t {IMAGE_NAME} .
# $ docker run -p {PORT}:80 {IMAGE_NAME}
