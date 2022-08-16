/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
import express, { RequestHandler } from 'express'
import path from 'path'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import { getUICalendar } from '../calendar'
import { checkPassword, getUserById } from '../database/User'

const jwtExpirySeconds = 1814400 // three weeks

/**
 * GET: Request Handler for the / route
 * Serve assets in src/public/*
 */
export const servePublic:RequestHandler = express.static(path.join(__dirname, '../', '../', 'public'), {
	fallthrough: true
})

/**
 * GET: Request Handler for the / route
 * redirect to /dashboard
 */
export const index:RequestHandler = (req, res) => {
	res.redirect('/dashboard')
}

/**
 * GET: Request Handler for the /dashboard route
 * Send the dashboard's EJS rendered page
 * Redirect to /login if there's not the req.session.user
 */
export const dashboardView:RequestHandler = (req, res) => {
	const dateStr: string = moment().format('YYYY-MM')

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	req.session.user!.getCalendars().then((calendarsList) => {
		res.render('dashboard', {calendars: calendarsList, dateStr: dateStr})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/**
 * GET: Request Handler for the /settings route
 * Send the settings's EJS rendered page
 * Redirect to /login if there's not the req.session.user
 */
export const settingsView:RequestHandler = (req, res) => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	req.session.user!.getCalendars().then((calendarsList) => {
		res.render('settings', {calendars: calendarsList})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/**
 * GET: Request Handler for the /login route
 * Send the login's EJS rendered page
 */
export const loginView:RequestHandler = (_req, res) => {
	res.render('login', { error: false, username: '' })
}

/**
 * POST: Request Handler for the /login route
 * If users credentials ar correct, create a token and store in the user's cookies, then redirect to /dashboard
 * If tere are wrong, send the login page again, with an error message and the username filled
 */
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

/**
 * GET: Request Handler that goes before every request, except /api/*, assets and /login
 * Redirect to /login if there is not any token, or if the stored token is invalid
 * If the token is correct, the token is re-signed and stored again in cookies
 */
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

/**
 * GET: Request Handler for the /components/calendars/:id route
 * Send a calendar's EJS rendered page
 * Redirect to /login if there's not the req.session.user
 * If the date is passed in the url query, the YYYY-MM format is checked
 * If there's no date passed in query, the current date is used
 */
export const calendarComponent:RequestHandler = (req, res) => {
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

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	getUICalendar(req.session.user!, dateString, req.params.id).then((calendar) => {
		res.render('components/calendar', {calendar})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/**
 * GET: Request Handler for the /components/settings/calendars/:id route
 * Send a calendar settings's EJS rendered page
 * Redirect to /login if there's not the req.session.user
 */
export const calendarSettingsComponent:RequestHandler = (req, res) => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	req.session.user!.getCalendarById(req.params.id).then(calendar => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		res.render('components/settings/calendar', {calendar, weekStartsMonday: req.session.user!.weekStartsMonday})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/**
 * POST: Request Handler for the /set_state/:id route
 * Set the given the state to the given date for the given calendar
 * Redirect to /login if there's not the req.session.user
 */
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
