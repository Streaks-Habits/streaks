![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Gitlab pipeline status (self-hosted)](https://img.shields.io/gitlab/pipeline-status/streaks/streaks?branch=main&gitlab_url=https%3A%2F%2Fgit.chevro.fr&style=flat-square)
![Maintenance](https://img.shields.io/maintenance/yes/2022?style=flat-square)

<img src="src/public/icons/logo.svg" height="60" width="60" align="right">

Streaks
=======

Streaks is a habit-tracking app that relies on streaks (like Duolingo or Snapchat), to help you build habits.

The principle is simple, when you accomplish your goal of the day you accumulate streaks, and the more streaks you have, the less you want to lose them (by not accomplishing your goal).

![Streaks's dashboard](dashboard.png)

There is also [Streaks Runner](https://git.chevro.fr/streaks/runner), to automate your tasks.

Installation
============

With Docker (recommended)
-------------------------
Download the `docker-compose.yml`
```bash
mkdir streaks && cd "$_"
wget https://git.chevro.fr/streaks/runner/-/raw/main/docker-compose.yml
```

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

Use the creation script to create your `.env` file.

If you use docker, run:
```bash
docker-compose exec streaks node user_scripts/set_env.js
```
Otherwise, run:
```bash
node user_scripts/set_env.js
```

This script should create an `.env` file that looks like this:
```env
PORT=80
TZ=Europe/Paris
JWT_KEY=random
MONGO_URI=mongodb+srv://your-mongodb-connection-string
```
Edit-it to suit your needs.

**If the MongoDB database is the one deployed by the `docker-compose.yml`, leave `MONGO_URI` empty.**

CLI Scripts
===========

A number of cli scripts are available to simplify the life of administrators. Here they are:

The scripts can be launched via nodejs, with the command:
```bash
node path/to/script.js
```
or if you use docker:
```bash
docker-compose exec streaks node path/to/script.js
```

Instance
--------

### **Set env**
Script: **user_scripts/set_env.js**

Create a sample `.env`

```
node user_scripts/set_env.js
```

### **Run daemons**
Script: **user_scripts/run_daemons.js**

Launch the daemons. The daemons are the tasks that send notifications, define breakdays...

```
node user_scripts/run_daemons.js
```

Calendars
---------

### **Add calendar**
Script: **user_scripts/calendars/add.js**

Create a calendar for a user

```
node user_scripts/calendars/add.js
```

### **List calendars**
Script: **user_scripts/calendars/list.js**

Lists the calendars of the instance, their owner and the current streak

```
node user_scripts/calendars/list.js
```

### **Set state**
Script: **user_scripts/calendars/set_state.js**

Defines the state of a day for a calendar. The state can be *success*, *fail*, *freeze*, or *breakday*

```
node user_scripts/calendars/set_state.js <calendar id> <YYYY-MM-DD> <state>
```

Users
-----

### **Add user**
Script: **user_scripts/users/add.js**

Create a user

```
node user_scripts/users/add.js
```

### **List users**
Script: **user_scripts/users/list.js**

Lists the users of the instance

```
node user_scripts/users/list.js
```

### **Create API key**
Script: **user_scripts/users/list.js**

Create an API for a user

```
node user_scripts/users/api_key.js
```
