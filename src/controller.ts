import express, { RequestHandler } from 'express'
import path from 'path'
import bcrypt from 'bcrypt'

import { getCalendar } from './scripts/calendar'
import { getCalendarList } from './scripts/list_calendar'
import { setState } from './scripts/set_state'

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
	res.render("calendar", {calendar: getCalendar(date, req.params.filename)})
}

export const loginView:RequestHandler = (req, res) => {
	res.render("login", { error: false })
}

export const loginForm:RequestHandler = (req, res) => {
	if (req.body.password == undefined) {
		res.render("login", {error: true, errorMessage: "Wrong password"})
		return
	}
	if (process.env.PASSWORD_HASH == undefined || process.env.PASSWORD_HASH == "") {
		res.render("login", {error: true, errorMessage: "Please add a PASSWORD_HASH in your .env"})
		return
	}
	bcrypt.compare(req.body.password, process.env.PASSWORD_HASH, (err, result) => {
		if (err) throw err
		if (result) {
			req.session.authenticated = true
			res.redirect("/dashboard")
		}
		else
			res.render("login", {error: true, errorMessage: "Wrong password"})
	})
}

export const stateSet:RequestHandler = (req, res) => {
	setState(req.params.filename, req.params.dateString, req.params.state).then(() => {
		res.send()
	})
}

export const checkAuthenticated:RequestHandler = (req, res, next) => {
	if (req.session.authenticated == undefined || req.session.authenticated == false)
	{
		res.redirect('/login')
	}
	else
		next()
}
