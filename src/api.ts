import { RequestHandler } from "express"

///CHECK API KEY ///
export const apiCheckKey:RequestHandler = (req, res, next) => {
	console.log("soon")
	next()
}

/// SET STATE ///
export const apiStateSet:RequestHandler = (req, res) => {
	res.send("soon")
	/*
	req.session.user!.setDayState(req.params.id, req.body.date, req.body.state).then(() => {
		res.send()
	}).catch((err) => {
		res.status(500)
		res.send(err)
	})
	*/
}
