import { RequestHandler } from "express"
import { isValidObjectId } from "mongoose"

import { User } from "./scripts/database"

///CHECK API KEY ///
export const apiCheckKey:RequestHandler = (req, res, next) => {
	var user: User

	if (!req.body.api_key || req.body.api_key.toString().length == 0)
		return res.status(400).send("You forgot the api_key ;)")

	let api_key: string = req.body.api_key.toString()
	if (api_key.split('.').length != 3)
		return res.status(400).send("Bad api key format")

	let user_id: string = api_key.split('.')[0]
	if (!isValidObjectId(user_id))
		return res.status(400).send("Bad api key format")

	user = new User(user_id)
	user.checkApiKey(api_key).then(() => {
		req.session.user = user
		next()
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}

/// SET STATE ///
export const apiStateSet:RequestHandler = (req, res) => {
	if (!req.body.date || req.body.date.toString().length == 0)
		return res.status(400).send("You forgot the date ;)")

	if (!req.body.state || req.body.state.toString().length == 0)
		return res.status(400).send("You forgot the state ;)")

	req.session.user!.setDayState(req.params.id, req.body.date, req.body.state).then(() => {
		res.send("OK")
	}).catch((err) => {
		res.status(err.code).send(err.message)
	})
}
