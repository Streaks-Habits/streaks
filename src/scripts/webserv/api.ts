/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
import { RequestHandler } from 'express'
import moment from 'moment'
import { isValidObjectId } from 'mongoose'

import { User } from '../database/User'
import { sendCongratulation } from '../notifications/notifications'

/**
 * GET: Request Handler that goes before every /api/* requests
 * Check that an api_key is provided, have the correct format and link to an existing user
 * (then create the user object and store it in req.session.user)
 */
export const apiCheckKey:RequestHandler = (req, res, next) => {
	if (!req.body.api_key || req.body.api_key.toString().length == 0)
		return res.status(400).send('You forgot the api_key ;)')

	const api_key: string = req.body.api_key.toString()
	if (api_key.split('.').length != 3)
		return res.status(400).send('Bad api key format')

	const user_id: string = api_key.split('.')[0]
	if (!isValidObjectId(user_id))
		return res.status(400).send('Bad api key format')

	const user = new User(user_id)
	user.dbInit().then(() => {
		user.checkApiKey(api_key).then(() => {
			req.session.user = user
			next()
		}).catch((err) => {
			res.status(err.code).send(err.message)
		})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/**
 * POST: Request Handler for the /set_state/:id route
 * Set the given the state to the given date for the given calendar
 * Check that the user is authentificated,
 *       that the date and the date are provided
 * Then, if it's the first time that the state is set as success,
 *     a congratulation is sent (if the user have enabled notifications).
 */
export const apiStateSet:RequestHandler = (req, res) => {
	if (!req.session.user)
		return res.status(400).send('You are not authenticated')

	if (!req.body.date || req.body.date.toString().length == 0)
		return res.status(400).send('You forgot the date ;)')

	if (!req.body.state || req.body.state.toString().length == 0)
		return res.status(400).send('You forgot the state ;)')

	req.session.user.getCalendarById(req.params.id).then(calendar => {
		const state_set_to_success = calendar.days?.get(moment().format('YYYY-MM-DD')) != 'success' && req.body.state == 'success'
		calendar.setDayState(req.body.date, req.body.state).then(() => {
			res.send('OK')
			if (req.session.user && state_set_to_success)
				if (calendar.notifications?.congrats)
					sendCongratulation(req.session.user, calendar)
		}).catch((err) => {
			res.status(err.code).send(err.message)
		})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}
