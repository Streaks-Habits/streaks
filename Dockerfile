FROM node:current-alpine

# Install dependencies
RUN apk update && \
	apk add --no-cache chromium chromium-chromedriver libffi libffi-dev gcc musl-dev openssl-dev cargo python3 python3-dev py3-pip && \
	pip3 install -U selenium python-dotenv

# Copy streaks.json sources
RUN mkdir /streaks.json
WORKDIR /streaks.json
COPY package.json package.json

RUN npm i

COPY user_scripts user_scripts
COPY dist dist
COPY src src

EXPOSE 80
ENV PORT=80

CMD sh -c "npm start"
