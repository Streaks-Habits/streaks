import express from 'express'
import path from 'path'
import session from 'express-session'
import cookieParser from "cookie-parser"
import dotenv from 'dotenv'
import schedule from 'node-schedule'
import chalk from 'chalk'

import { connectDB, User } from './scripts/database'
import routes from './routes'
import { runDaemons } from './scripts/daemons'

declare module 'express-session' {
	export interface SessionData {
		user: User;
	}
}

///// CHECK .ENV /////
dotenv.config()
if (process.env.PORT == undefined || process.env.PORT == "") {
	console.log(chalk.red("Please add a PORT in your .env"))
	process.exit(1)
}
if (process.env.JWT_KEY == undefined || process.env.JWT_KEY == "") {
	console.log(chalk.red("Please add a JWT_KEY in your .env"))
	process.exit(1)
}
if (process.env.MONGO_URI == undefined || process.env.MONGO_URI == "") {
	console.log(chalk.red("Please add a MONGO_URI in your .env"))
	process.exit(1)
}

schedule.scheduleJob('50 * * * *', runDaemons)

const app = express()
app.set('trust proxy', 1)
app.set('views', path.join('src', 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(session({
	secret: "keyboard dog",
	resave: true,
	saveUninitialized: true
}))
app.use('/', routes)

process.stdout.write(`${chalk.blue("streaks")} database => `);
connectDB().then(() => {
	console.log(chalk.green("connected"))
	app.listen(process.env.PORT, () => {
		console.log(`${chalk.blue("streaks")} => started on ${chalk.green(`::${process.env.PORT}`)}`)
	})
}).catch((err) => {
	console.error(`Error: ${chalk.red(err)}`)
})

