import { RequestHandler } from 'express'
import { isValidObjectId } from 'mongoose'

import { User } from '../database/User'

///CHECK API KEY ///
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
	user.checkApiKey(api_key).then(() => {
		req.session.user = user
		next()
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/// SET STATE ///
export const apiStateSet:RequestHandler = (req, res) => {
	if (!req.session.user)
		return res.status(400).send('You are not authenticated')

	if (!req.body.date || req.body.date.toString().length == 0)
		return res.status(400).send('You forgot the date ;)')

	if (!req.body.state || req.body.state.toString().length == 0)
		return res.status(400).send('You forgot the state ;)')

	req.session.user.getCalendarById(req.params.id).then(calendar => {
		calendar.setDayState(req.body.date, req.body.state).then(() => {
			res.send('OK')
		}).catch((err) => {
			res.status(err.code).send(err.message)
		})
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}
