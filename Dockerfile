FROM node:current-alpine

# Install dependencies
RUN apk update && \
	apk add --no-cache chromium chromium-chromedriver libffi libffi-dev gcc musl-dev openssl-dev cargo python3 python3-dev py3-pip && \
	pip3 install -U selenium python-dotenv && \
	apk del libffi libffi-dev gcc musl-dev openssl-dev cargo python3-dev py3-pip

# Copy streaks.json sources
RUN mkdir /streaks.json
WORKDIR /streaks.json
COPY package.json package.json

# Install npm dependencies
RUN npm i

# Copy the rests of the streaks.json sources
COPY tsconfig.json tsconfig.json
COPY user_scripts user_scripts
COPY src src

# Build streaks.json
RUN npm run build

EXPOSE 80
ENV PORT=80

CMD sh -c "npm start"
