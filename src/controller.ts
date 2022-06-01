import express, { RequestHandler } from 'express'
import path from 'path'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import { getUICalendar } from './scripts/calendar'
import { checkPassword, getUserById, User } from './scripts/database'

var jwtExpirySeconds: number = 1814400 // three weeks

/// STATIC ///
export const serveStyles:RequestHandler = express.static(path.join(__dirname, "public"), {
	fallthrough: true
})

export const servePublic:RequestHandler = express.static(path.join(__dirname, "../", "src", "public"), {
	fallthrough: true
})

/// INDEX ///
export const index:RequestHandler = (req, res) => {
	res.redirect("/dashboard")
}

/// DASHBOARD ///
export const dashboardView:RequestHandler = (req, res) => {
	var dateStr: string = moment().format("YYYY-MM")

	req.session.user!.getCalendarsInfo().then((calendarsList) => {
		res.render("dashboard", {calendars: calendarsList, dateStr: dateStr})
	}).catch((err) => {
		res.status(500)
		res.send(err)
	})
}

/// LOGIN ///
export const loginView:RequestHandler = (_req, res) => {
	res.render("login", { error: false, username: "" })
}

export const loginForm:RequestHandler = (req, res) => {
	checkPassword(req.body.username, req.body.password).then(user => {
		jwt.sign({ user_id: user._id }, process.env.JWT_KEY!, {
			algorithm: "HS256",
			expiresIn: jwtExpirySeconds,
		}, (err, token) => {
			if (err) throw err
			res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
			res.redirect("/dashboard")
		})
	}).catch(err => {
		res.render("login", { error: true, errorMessage: err, username: req.body.username })
	})
}

export const checkAuthenticated:RequestHandler = (req, res, next) => {
	const token = req.cookies.token

	if (!token)
		return res.redirect('/login')
	if (process.env.JWT_KEY == undefined || process.env.JWT_KEY == "")
		throw "Please add a JWT_KEY in your .env"

	jwt.verify(token, process.env.JWT_KEY!, {}, (err, decoded) => {
		decoded = decoded as jwt.JwtPayload

		if (err || !decoded || !decoded.hasOwnProperty("user_id"))
			res.redirect('/login')
		else {
			getUserById(decoded["user_id"]).then(user => {
				req.session.user = new User(user.id)

				jwt.sign({ user_id: user._id}, process.env.JWT_KEY!, {
					algorithm: "HS256",
					expiresIn: jwtExpirySeconds,
				}, (err, token) => {
					if (err) throw err
					res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
					next()
				})
			}).catch(() => {
				res.redirect('/login')
			})
		}
	})
}

///////////
/// API ///
//////////

/// CALENDAR VIEW ///
export const calendarView:RequestHandler = (req, res) => {
	var dateString: string

	if (req.query.date) {
		if (moment(req.query.date.toString(), 'YYYY-MM', true).isValid()) {
			dateString = req.query.date.toString()
		}
		else {
			res.status(400)
			return res.send("Invalid date format, must be formatted as YYYY-MMM-DD")
		}
	}
	else
		dateString = moment().format("YYYY-MM")

	getUICalendar(req.session.user!, dateString, req.params.id).then((calendar) => {
		res.render("calendar", {calendar})
	}).catch((err) => {
		res.status(err.code)
		res.send(err.message)
	})
}

/// SET STATE ///
export const stateSet:RequestHandler = (req, res) => {
	req.session.user!.setDayState(req.params.id, req.params.dateString, req.params.state).then(() => {
		res.send()
	}).catch((err) => {
		res.status(500)
		res.send(err)
	})
}
