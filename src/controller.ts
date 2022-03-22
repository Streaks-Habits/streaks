import express, { RequestHandler } from 'express'
import path from 'path'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { getCalendar, getCalendarList } from './scripts/calendar'
import { setState } from './scripts/state'

var jwtExpirySeconds: number = 1814400 // three weeks

export const index:RequestHandler = (req, res) => {
	res.redirect("/dashboard")
}

export const serveStyles:RequestHandler = express.static(path.join(__dirname, "public"), {
	fallthrough: true
})

export const servePublic:RequestHandler = express.static(path.join(__dirname, "../", "src", "public"), {
	fallthrough: true
})

export const dashboardView:RequestHandler = (req, res) => {
	var date: Date = new Date()
	var dateStr: string = `${date.getFullYear()}-${date.getMonth() + 1}`

	getCalendarList().then((calendarList) => {
		res.render("dashboard", {calendars: calendarList, dateStr: dateStr})
	}).catch((err) => {
		res.status(500)
		res.send(err)
	})
}

export const calendarView:RequestHandler = (req, res) => {
	var date: Date = new Date()
	var dateString: string

	if (req.query.date)
	{
		dateString = req.query.date.toString()
		date.setFullYear(parseInt(dateString.split('-')[0]))
		date.setMonth(parseInt(dateString.split('-')[1]) - 1)
	}
	getCalendar(date, req.params.filename).then((calendar) => {
		res.render("calendar", {calendar})
	}).catch((err) => {
		res.status(500)
		res.send(err)
	})
}

export const loginView:RequestHandler = (req, res) => {
	res.render("login", { error: false })
}

export const loginForm:RequestHandler = (req, res) => {
	if (req.body.password == undefined) {
		res.render("login", {error: true, errorMessage: "Wrong password"})
		return
	}
	if (process.env.PASSWORD_HASH == undefined || process.env.PASSWORD_HASH == "")
		throw "Please add a PASSWORD_HASH in your .env"
	if (process.env.JWT_KEY == undefined || process.env.JWT_KEY == "")
		throw "Please add a JWT_KEY in your .env"
	bcrypt.compare(req.body.password, process.env.PASSWORD_HASH, (err, result) => {
		if (err) throw err
		if (result) {
			jwt.sign({ authenticated: true }, process.env.JWT_KEY!, {
				algorithm: "HS256",
				expiresIn: jwtExpirySeconds,
			}, (err, token) => {
				if (err) throw err
				res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
				res.redirect("/dashboard")
			})
		}
		else
			res.render("login", {error: true, errorMessage: "Wrong password"})
	})
}

export const stateSet:RequestHandler = (req, res) => {
	setState(req.params.filename, req.params.dateString, req.params.state).then(() => {
		res.send()
	}).catch((err) => {
		res.status(500)
		res.send(err)
	})
}

export const checkAuthenticated:RequestHandler = (req, res, next) => {
	const token = req.cookies.token

	if (!token)
		res.redirect('/login')
	else {
		if (process.env.JWT_KEY == undefined || process.env.JWT_KEY == "")
			throw "Please add a JWT_KEY in your .env"
		jwt.verify(token, process.env.JWT_KEY!, {}, (err, decoded) => {
			if (err)
				res.redirect('/login')
			else {
				jwt.sign({ authenticated: true }, process.env.JWT_KEY!, {
					algorithm: "HS256",
					expiresIn: jwtExpirySeconds,
				}, (err, token) => {
					if (err) throw err
					res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
					next()
				})
			}
		})
	}
}
