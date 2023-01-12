FROM node:alpine as build

# Install dependencies
#RUN apk add --no-cache python3 make g++
RUN npm install -g @nestjs/cli
# Copy streaks sources
WORKDIR /streaks
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY srcs srcs
# Install npm dependencies and build
RUN npm i
RUN npm run build
RUN npm run sass

FROM node:alpine as main

# Install dependencies
RUN apk add --no-cache tzdata
# RUN npm install -g @nestjs/cli
# Copy sources and builded sources
WORKDIR /streaks
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY --from=build /streaks/dist ./dist
# Install only production
RUN npm install --omit=dev

EXPOSE 80
ENV PORT=80
CMD sh -c "npm run start:prod"
