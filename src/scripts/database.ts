import { connect, model, Schema, Model, Document, Types, SchemaTypes, isValidObjectId, ObjectId } from 'mongoose'
import chalk from 'chalk'
import bcrypt from 'bcrypt'
import moment from 'moment'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { UICalendarMeta } from './interfaces'
import { dateString } from './utils'

dotenv.config()

interface IUser extends Document {
	username: string,
	password_hash: string,
	api_keys: Array<{
		_id: ObjectId,
		name: string,
		key_hash: string
	}>
}
export interface ICalendar extends Document {
	name: string,
	user_id: Types.ObjectId,
	agenda: Array<boolean>,
	days: Map<string, string>
}

const	UserSchema: Schema = new Schema({
	username: { type: String, required: true, unique: true, index: true },
	password_hash: { type: String, required: true },
	api_keys: [{
		name: { type: String, required: true },
		key_hash: { type: String, required: true }
	}]
})
const	MUser: Model<IUser> = model('User', UserSchema)

const	CalendarSchema: Schema = new Schema({
	name: { type: String, required: true },
	user_id: { type: SchemaTypes.ObjectId, required: true, ref: "User", index: true },
	agenda: { type: [Boolean], required: true },
	days: {
		type: Map,
		of: String
	}
})
const	MCalendar: Model<ICalendar> = model('Calendar', CalendarSchema)

/**
 * Connect mongoose to the MongoDB server using MONGO_URI env
 * @returns - The mongoose connection promises
 */
export function connectDB(): Promise<typeof import('mongoose')> {
	if (process.env.MONGO_URI != undefined)
		return connect(process.env.MONGO_URI)
	else {
		console.log(chalk.red("Please add a MONGO_URI in your .env"))
		process.exit(1)
	}
}

/**
 * Add the specified user to the database. The password is stored hashed
 * @param username - The users's username
 * @param password - The users's password
 * @returns - A promise that resolve(IUser)
 */
export function addUser(username: string, password: string)
		: Promise<IUser & { _id: any; }> {
	return new Promise((resolve, reject) => {
		if (!/^[a-z0-9_\.]+$/.exec(username))
			return reject("The username contains unauthorized characters. Authorized characters: a-z, 0-9, ., _")
		if (password.length == 0)
			return reject("Password can't be empty")
		bcrypt.hash(password, 10, (err, hash) => {
			if (err) return reject(err)

			new MUser({
				username,
				password_hash: hash
			}).save((err, data) => {
				if (err) return reject(err)
				resolve(data)
			})
		})
	})
}

/**
 * Compare the hashed password of the given username with the given password
 * @param username - The users's username
 * @param password - The users's password to test
 * @returns - A promise that resolve(IUser) if passwords match or reject(errorMessage)
 */
export function checkPassword(username: string, password: string)
		: Promise<IUser & { _id: any; }> {
	return new Promise((resolve, reject) => {
		MUser.findOne({ username }, null, (err, user) => {
			if (err) return reject(err)
			if (!user) return reject("User doesn't exists")

			bcrypt.compare(password, user.password_hash, (err, result) => {
				if (err) return reject(err)

				if (result)
					resolve(user)
				else
					reject("Wrong password")
			})
		})
	})
}

/**
 * Find a user in database with the given id
 * @param id - The users's id
 * @returns - A promise that resolve(IUser) or reject(errorMessage)
 */
export function getUserById(id: string)
		: Promise<IUser & { _id: any; }> {
	return new Promise((resolve, reject) => {
		MUser.findById(id, null, (err, user) => {
			if (err) return reject({code: 500, message: err.message})
			if (!user) return reject({code: 404, message: "User doesn't exists"})

			return resolve(user)
		})
	})
}

/**
 * Find every users of the instance
 * @returns - A promise that resolve(IUser[]) or reject(errorMessage)
 */
export function getUsers()
		: Promise<(IUser & { _id: any; })[]> {
	return new Promise((resolve, reject) => {
		MUser.find({}, null, (err, users) => {
			if (err) return reject({code: 500, message: err.message})

			return resolve(users)
		})
	})
}

/**
 * Find a calendar in the database with the given id
 * @param id - The calendar's id
 * @returns - A promise that resolve(ICalendar) if passwords match or reject(errorMessage)
 */
export function getCalendarById(id: string)
		: Promise<(ICalendar & { _id: any; })> {
	return new Promise((resolve, reject) => {
		MCalendar.findById(id, null, (err, calendar) => {
			if (err)
				return reject({code: 500, message: err.message})
			if (!calendar)
				return reject({code: 404, message: "Calendar doesn't exists"})

			return resolve(calendar)
		})
	})
}

/**
 * Find every calendars of the instance
 * @returns - A promise that resolve(ICalendar[]) or reject(errorMessage)
 */
export function getCalendars()
		: Promise<(ICalendar & { _id: any; })[]> {
	return new Promise((resolve, reject) => {
		MCalendar.find({}, null, (err, calendars) => {
			if (err) return reject({code: 500, message: err.message})

			return resolve(calendars)
		})
	})
}

export class User {
	id: string
	weekStartsMonday: boolean

	constructor(id: string) {
		this.id = id
		this.weekStartsMonday = true
	}

	/**
	 * Find every calendars of the user
	 * @returns - A promise that resolve(IUser[]) or reject(errorMessage)
	 */
	getCalendars()
			: Promise<(ICalendar & { _id: any; })[]> {
		return new Promise((resolve, reject) => {
			MCalendar.find({user_id: this.id}, "_id name", (err, calendars) => {
				if (err) return reject({code: 500, message: err.message})

				return resolve(calendars)
			})
		})
	}

	/**
	 * Find every calendars of the user and returns only their names and ids
	 * @returns - A promise that resolve(IUser[]) or reject(errorMessage)
	 */
	getCalendarsInfo()
			: Promise<Array<UICalendarMeta>> {
		return new Promise<Array<UICalendarMeta>>((resolve, reject) => {
			MCalendar.find({user_id: this.id}, "_id name", (err, db_calendars) => {
				if (err) return reject({code: 500, message: err.message})

				var calendars: Array<UICalendarMeta> = new Array()

				db_calendars.forEach((db_calendar) => {
					calendars.push({
						id: db_calendar._id,
						name: db_calendar.name
					})
				})
				resolve(calendars)
			})
		})
	}

	/**
	 * Find a calendar of the user with the given id
	 * @param id - The calendar's id
	 * @returns - A promise that resolve(ICalendar) or reject(errorMessage)
	 */
	getCalendarById(id: string)
			: Promise<ICalendar & { _id: any; }> {
		return new Promise((resolve, reject) => {
			MCalendar.findById(id, null, (err, calendar) => {
				if (err)
					return reject({code: 500, message: err.message})
				if (!calendar)
					return reject({code: 404, message: "Calendar doesn't exists"})
				if (calendar.user_id.toString() != this.id)
					return reject({code: 403, message: "You don't own this calendar"})

				return resolve(calendar)
			})
		})
	}

	/**
	 * Add a calendar for the user
	 * @param name - The name of the future calendar
	 * @returns - A promise that resolve(ICalendar) or reject(errorMessage)
	 */
	addCalendar(name: string)
			: Promise<ICalendar & { _id: any; }> {
		return new Promise((resolve, reject) => {
			getUserById(this.id).then(user => {
				new MCalendar({
					name,
					user_id: user._id,
					agenda: [1, 1, 1, 1, 1, 1, 1],
					days: {}
				}).save((err, data) => {
					if (err) return reject({code: 500, message: err.message})
					resolve(data)
				})
			}).catch(err => {
				reject(err)
			})
		})
	}

	/**
	 * Set the given state (success, fail...) of the given day (YYYY-MM-DD) for the given calendar
	 * @param calendar_id - The calendars's id
	 * @param date - The date to set (formated as YYYY-MM-DD)
	 * @param state - The state to set (must be success, fail, breakday or freeze)
	 * @returns - A promise that resolve(ICalendar) or reject(errorMessage)
	 */
	setDayState(calendar_id: string, date: string, state: string)
			: Promise<ICalendar> {
		return new Promise((resolve, reject) => {
			if (!isValidObjectId(calendar_id))
				return reject({code: 400, message: "Invalid calendar id"})
			if (!moment(date, 'YYYY-MM-DD', true).isValid())
				return reject({code: 400, message: "Invalid date format, must be formatted as YYYY-MM-DD"})
			if (!["fail", "success", "breakday", "freeze"].includes(state))
				return reject({code: 400, message: "Incorrect state, must be fail, success, breakday or freeze"})
			if (moment(date, 'YYYY-MM-DD') > moment())
				return reject({code: 403, message: "Can't define the state of a future day"})

			var day_path = `days.${dateString(date)}`

			MCalendar.findOneAndUpdate(
				{ _id: calendar_id, user_id: this.id },
				{ "$set": {[day_path]: state } },
				{ new: true },
			(err, calendar) => {
				if (err)
					return reject({code: 500, message: err.message})
				if (!calendar)
					return reject({code: 404, message: "Calendar doesn't exists for this user"})

				return resolve(calendar)
			})
		})
	}

	/**
	 * Create an API with the given name for the user and returns it
	 * Api keys have the following format: user_id.key_id.key
	 * @param name - The name of the api key
	 * @returns - A promise that resolve(string) or reject(errorMessage)
	 */
	createApiKey(name: string)
			: Promise<string> {
		return new Promise((resolve, reject) => {
			if (name.length == 0)
				return reject({code: 400, message: "Name can't be empty"})

			let key = uuidv4().replaceAll('-', '')
			let key_id = new Types.ObjectId()

			bcrypt.hash(key, 10, (err, key_hash) => {
				if (err) return reject(err)

				MUser.findByIdAndUpdate(
					this.id,
					{ $push: { api_keys: { _id: key_id, name, key_hash }} },
				(err, result) => {
					if (err)
						return reject({code: 500, message: err.message})
					if (!result)
						return reject({code: 404, message: "User doesn't exists"})

					resolve(`${this.id}.${key_id}.${key}`)
				})
			})
		})
	}

	/**
	 * Check that the given api key exist and id valid for the user
	 * @param api_key - The api key to check
	 * @returns - A promise that resolve() or reject(errorMessage)
	 */
	checkApiKey(api_key: string)
			: Promise<void> {
		return new Promise((resolve, reject) => {
			if (api_key.split('.').length != 3)
				return reject({code: 400, message: "Bad api key format"})

			let key_id = api_key.split('.')[1]
			let key = api_key.split('.')[2]

			if (!isValidObjectId(key_id))
				return reject({code: 400, message: "Bad api key format"})

			MUser.findById(this.id, null, (err, user) => {
				if (err) return reject({code: 500, message: err.message})
				if (!user) return reject({code: 404, message: "User doesn't exists"})

				let key_hash = ""

				if(user.api_keys) {
					user.api_keys.every(key => {
						if (key._id.toString() == key_id) {
							key_hash = key.key_hash
							return false
						}
						return true
					})
				}

				if (key_hash == "")
					return reject({code: 404, message: "Api key doesn't exists"})

				bcrypt.compare(key, key_hash, (err, result) => {
					if (err) return reject({code: 500, message: err.message})

					if (result)
						resolve()
					else
					return reject({code: 403, message: "Bad api key"})
				})
			})
		})
	}
}
