FROM node:17-alpine

RUN mkdir /streaks.json
WORKDIR /streaks.json

COPY package.json package.json

RUN npm i

COPY dist dist
COPY src src

EXPOSE 80
ENV PORT=80
