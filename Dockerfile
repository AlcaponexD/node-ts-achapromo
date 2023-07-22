FROM node:18

RUN apk add --no-cache bash

USER node

WORKDIR /home/node/app
