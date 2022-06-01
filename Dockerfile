FROM node:alpine as build

# Install dependencies
RUN apk add --no-cache python3 make g++
# Copy streaks.json sources
WORKDIR /streaks.json
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY src src
# Install npm dependencies and build
RUN npm i
RUN npm run build



FROM node:alpine as main

# Install daemons dependencies
RUN apk add --no-cache python3 py3-pip chromium chromium-chromedriver && \
	apk add --no-cache --virtual build-dependencies libffi libffi-dev gcc musl-dev openssl-dev cargo python3-dev && \
	pip3 install -U selenium python-dotenv certifi && \
	apk del build-dependencies
# Copy sources and builded sources
WORKDIR /streaks.json
COPY package.json package.json
COPY --from=build /streaks.json/dist ./dist
COPY src src
COPY user_scripts user_scripts
# Install only production
RUN npm install --production

EXPOSE 80
ENV PORT=80
CMD sh -c "npm start"
