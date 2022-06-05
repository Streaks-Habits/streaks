FROM node:alpine as build

# Install dependencies
RUN apk add --no-cache python3 make g++
# Copy streaks sources
WORKDIR /streaks
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY src src
# Install npm dependencies and build
RUN npm i
RUN npm run build


FROM node:alpine as main

# Install dependencies
RUN apk add --no-cache tzdata
# Copy sources and builded sources
WORKDIR /streaks
COPY package.json package.json
COPY --from=build /streaks/dist ./dist
COPY user_scripts user_scripts
# Install only production
RUN npm install --production

EXPOSE 80
ENV PORT=80
CMD sh -c "npm start"
