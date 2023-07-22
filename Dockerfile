FROM alpine:3.17

RUN apk add --no-cache bash

USER node

WORKDIR /home/node/app
