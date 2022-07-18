import express, { RequestHandler } from 'express'
import path from 'path'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import { getUICalendar } from '../calendar'
import { checkPassword, getUserById } from '../database/User'

const jwtExpirySeconds = 1814400 // three weeks

/// STATIC ///
export const servePublic:RequestHandler = express.static(path.join(__dirname, '../', '../', 'public'), {
	fallthrough: true
})

/// INDEX ///
export const index:RequestHandler = (req, res) => {
	res.redirect('/dashboard')
}

/// DASHBOARD ///
export const dashboardView:RequestHandler = (req, res) => {
	if (!req.session.user)
		return res.redirect('/login')

	const dateStr: string = moment().format('YYYY-MM')

	req.session.user.getCalendars().then((calendarsList) => {
		res.render('dashboard', {calendars: calendarsList, dateStr: dateStr})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/// LOGIN ///
export const loginView:RequestHandler = (_req, res) => {
	res.render('login', { error: false, username: '' })
}

export const loginForm:RequestHandler = (req, res) => {
	checkPassword(req.body.username, req.body.password).then(user => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		jwt.sign({ user_id: user.id }, process.env.JWT_KEY!, {
			algorithm: 'HS256',
			expiresIn: jwtExpirySeconds,
		}, (err, token) => {
			if (err) throw err
			res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000 })
			res.redirect('/dashboard')
		})
	}).catch(err => {
		res.render('login', { error: true, errorMessage: err, username: req.body.username })
	})
}

export const checkAuthenticated:RequestHandler = (req, res, next) => {
	const token = req.cookies.token

	if (!token)
		return res.redirect('/login')
	if (process.env.JWT_KEY == undefined || process.env.JWT_KEY == '')
		throw 'Please add a JWT_KEY in your .env'

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	jwt.verify(token, process.env.JWT_KEY!, {}, (err, decoded) => {
		decoded = decoded as jwt.JwtPayload

		if (err || !decoded || !Object.keys(decoded).includes('user_id'))
			res.redirect('/login')
		else {
			getUserById(decoded['user_id']).then(user => {
				req.session.user = user

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				jwt.sign({ user_id: user.id}, process.env.JWT_KEY!, {
					algorithm: 'HS256',
					expiresIn: jwtExpirySeconds,
				}, (err, token) => {
					if (err) throw err
					res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000 })
					next()
				})
			}).catch(() => {
				res.redirect('/login')
			})
		}
	})
}

/// CALENDAR VIEW ///
export const calendarView:RequestHandler = (req, res) => {
	if (!req.session.user)
		return res.redirect('/login')

	let dateString: string

	if (req.query.date) {
		if (moment(req.query.date.toString(), 'YYYY-MM', true).isValid()) {
			dateString = req.query.date.toString()
		}
		else {
			res.status(400)
			return res.send('Invalid date format, must be formatted as YYYY-MMM-DD')
		}
	}
	else
		dateString = moment().format('YYYY-MM')

	getUICalendar(req.session.user, dateString, req.params.id).then((calendar) => {
		res.render('calendar', {calendar})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/// SET STATE ///
export const stateSet:RequestHandler = (req, res) => {
	if (!req.session.user)
		return res.redirect('/login')

	req.session.user.getCalendarById(req.params.id).then(calendar => {
		calendar.setDayState(req.body.date, req.body.state).then(() => {
			res.send()
		}).catch((err) => {
			res.status(err.code).send(err.message)
		})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}
