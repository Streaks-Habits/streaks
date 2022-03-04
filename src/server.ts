import express from 'express'
import path from 'path'
import session from 'express-session'
import cookieParser from "cookie-parser"
import dotenv from 'dotenv'

import routes from './routes'

declare module 'express-session' {
	export interface SessionData {
		authenticated: boolean;
	}
}

dotenv.config()
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
app.listen(process.env.PORT, () => {
	console.log(`\ncestmaddy started on ::${process.env.PORT}`)
})
