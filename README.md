![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Gitlab pipeline status (self-hosted)](https://img.shields.io/gitlab/pipeline-status/streaks/streaks?branch=main&gitlab_url=https%3A%2F%2Fgit.chevro.fr&style=flat-square)
![Maintenance](https://img.shields.io/maintenance/yes/2023?style=flat-square)

<img src=".readme/logo.svg" height="60" width="60" align="right">

Streaks
=======

Streaks is a habit-tracking app that relies on streaks (like Duolingo or Snapchat), to help you build habits.

The principle is simple: when you accomplish your goal of the day you accumulate streaks, and the more streaks you have, the less you want to lose them (by not accomplishing your goal).

![Streaks's dashboard](.readme/dashboard.png)

There is also [Streaks CLI](https://git.chevro.fr/streaks/cli), to manage your calendars and progresses and automatically validate streaks by checking online services (Duolingo, Strava, GitLab...).

Installation
============

With Docker (recommended)
-------------------------

Edit the `docker-compose.yml` to suit your needs.

**Go to the [Configuration](#configuration) section to edit your `.env` file, then come back here.**

Start your container with:
```bash
docker-compose up -d
```

You can check that everything went well by looking at the container logs:
```bash
docker-compose logs
```

Manual install
--------------
Officially supported on Linux, may work on another platform.

Install the following dependencies on your server:
- NodeJS (with npm)

Clone the repository:
```bash
git clone https://git.chevro.fr/streaks/streaks.git streaks && cd streaks
```

You can now install the runner dependencies:
```bash
npm i
```

**Go to the [Configuration](#configuration) section to edit your `.env` file, then come back here.**

Build and start the server with:
```bash
npm run build
npm run start
```

Configuration
=============

Create a `.env` with the following content
```env
PORT=80

REGISTRATIONS_ENABLED=true # allow users to create an account
DEMO_USER_ENABLED=true # add a demo user, which is reseted every day

ADMIN_API_KEY=<the admin api key> # for admin access

AUTH_JWT_EXPIRES=20d # three weeks
AUTH_JWT_SECRET=<a random key>
AUTH_COOKIE_EXPIRES=1814400 # three weeks
AUTH_COOKIE_SECRET=<a random key>

MONGO_URI=mongodb+srv://your-mongodb-connection-string
# On docker, use:
MONGO_URI=mongodb://db:27017/streaks?retryWrites=true&w=majority

# Matrix notifications
MATRIX_ENABLED=true
MATRIX_USER=<the complete username of the user that sends notifications>
MATRIX_URL=<your instanec>
MATRIX_TOKEN=<the token of the user>
```
Edit-it to suit your needs.

**If the MongoDB database is the one deployed by the `docker-compose.yml`, leave `MONGO_URI` empty.**
