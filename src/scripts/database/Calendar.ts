import chalk from 'chalk'
import moment from 'moment'
import { Types } from 'mongoose'

import { dateString } from '../utils'
import { ICalendar, MCalendar } from './database'

/**
 * Displays an error (the calendar is not initialized) and exit the program
 */
function exitUninitialized(): void {
	console.error(chalk.red('The calendar has not been initialized.'))
	process.exit(1)
}

/**
 * A class that represents a calendar, provides all attributes of a user and all modification functions.
 * Allows not to use directly the database.
 */
export class Calendar {
	initialized = false
	// From constructor
	id: Types.ObjectId
	// From database / init
	name: ICalendar['name'] | undefined
	user_id: ICalendar['user_id'] | undefined
	agenda: ICalendar['agenda'] | undefined
	days: ICalendar['days'] | undefined
	notifications: ICalendar['notifications'] | undefined

	/**
	 * The constructor take only the calendar id.
	 * The next mandatory thing to do is to call the init() function or the dbInit() function,
	 * otherwise all attributes and methods will be inaccessible.
	 *
	 * @param {string | Types.ObjectId} id - The calendar id
	 */
	public constructor (id: string | Types.ObjectId) {
		this.id = new Types.ObjectId(id)
	}

	/**
	 * Retrieve all calendar information from the database
	 *
	 * @returns {Promise} A promise that resolve when the calendar is initialized
	 */
	dbInit(): Promise<void> {
		return new Promise((resolve, reject) => {
			getCalendarById(this.id).then((calendar) => {
				this.name = calendar.name
				this.user_id = calendar.user_id
				this.agenda = calendar.agenda
				this.days = calendar.days
				this.notifications = calendar.notifications

				this.initialized = true
				resolve()
			}).catch((err) => {
				reject(err)
			})
		})
	}

	/**
	 * Sets all attributes of the calendar as given, then passes the calendar to initialized.
	 *
	 * @param {ICalendar} calendar - The "source" calendar, which is returned by the database.
	 */
	init(calendar: ICalendar): void {
		this.name = calendar.name
		this.user_id = calendar.user_id
		this.agenda = calendar.agenda
		this.days = calendar.days
		this.notifications = calendar.notifications

		this.initialized = true
	}

	/**
	 * Set the given state (success, fail...) of the given day (YYYY-MM-DD) for the given calendar
	 *
	 * @param {string} date - The date to set (formated as YYYY-MM-DD)
	 * @param {string} state - The state to set (must be success, fail, breakday or freeze)
	 * @returns {Promise<ICalendar>} - A promise that resolve(ICalendar) or reject(errorMessage)
	 */
	setDayState(date: string, state: string)
			: Promise<ICalendar> {
		if (!this.initialized)
			exitUninitialized()

		return new Promise((resolve, reject) => {
			if (!moment(date, 'YYYY-MM-DD', true).isValid())
				return reject({code: 400, message: 'Invalid date format, must be formatted as YYYY-MM-DD'})
			if (!['fail', 'success', 'breakday', 'freeze'].includes(state))
				return reject({code: 400, message: 'Incorrect state, must be fail, success, breakday or freeze'})
			if (moment(date, 'YYYY-MM-DD') > moment())
				return reject({code: 403, message: 'Can\'t define the state of a future day'})

			const day_path = `days.${dateString(date)}`

			MCalendar.findByIdAndUpdate(
				this.id,
				{ '$set': {[day_path]: state } },
				{ new: true },
				(err, calendar) => {
					if (err)
						return reject({code: 500, message: err.message})
					if (!calendar)
						return reject({code: 404, message: 'Calendar doesn\'t exists'})

					this.days = calendar.days
					return resolve(calendar)
				})
		})
	}

	/**
	 * Returns the current streaks of the specified calendar
	 *
	 * @returns {number} - The current streaks (a number)
	 */
	countStreaks(): number {
		if (!this.initialized)
			exitUninitialized()
		if (!this.days)
			return (0)

		const date: Date = new Date()
		let streaks = 0
		let current_state: string

		current_state = this.days.get(dateString(date)) || 'fail'
		do {
			if (current_state == 'success')
				streaks++
			date.setDate(date.getDate() - 1)
			current_state = this.days.get(dateString(date)) || 'fail'
		} while (current_state && current_state != 'fail')
		return (streaks)
	}

	//#region NOTIFICATIONS

	/**
	 * Defines the state of the reminders (enabled/disabled) depending on the argument passed.
	 *
	 * @param {boolean} state - The state to set, true to enable
	 * @returns {Promise<void>}
	 */
	setRemindersState(state: boolean): Promise<void> {
		if (!this.initialized)
			exitUninitialized()

		return new Promise((resolve, reject) => {
			MCalendar.findByIdAndUpdate(this.id, { 'notifications.reminders': state },
				{ new: true }, (err, calendar) => {
					if (err)
						return reject({code: 500, message: err.message})
					if (!calendar)
						return reject({code: 404, message: 'Calendar doesn\'t exists'})

					this.notifications = calendar.notifications
					return resolve()
				})
		})
	}

	/**
	 * Defines the state of the congratulations (enabled/disabled) depending on the argument passed.
	 *
	 * @param {boolean} state - The state to set, true to enable
	 * @returns {Promise<void>}
	 */
	setCongratsState(state: boolean): Promise<void> {
		if (!this.initialized)
			exitUninitialized()

		return new Promise((resolve, reject) => {
			MCalendar.findByIdAndUpdate(this.id, { 'notifications.congrats': state },
				{ new: true }, (err, calendar) => {
					if (err)
						return reject({code: 500, message: err.message})
					if (!calendar)
						return reject({code: 404, message: 'Calendar doesn\'t exists'})

					this.notifications = calendar.notifications
					return resolve()
				})
		})
	}

	//#endregion NOTIFICATIONS
}

/**
 * Find a calendar in the database with the given id
 *
 * @param {string} id - The calendar's id
 * @returns {Promise<Calendar>} - A promise that resolve(ICalendar) if passwords match or reject(errorMessage)
 */
export function getCalendarById(id: string | Types.ObjectId)
		: Promise<Calendar> {
	return new Promise((resolve, reject) => {
		MCalendar.findById(id, null, (err, db_calendar) => {
			if (err)
				return reject({code: 500, message: err.message})
			if (!db_calendar)
				return reject({code: 404, message: 'Calendar doesn\'t exists'})

			const calendar = new Calendar(db_calendar._id)
			calendar.init(db_calendar)
			return resolve(calendar)
		})
	})
}

/**
 * Find every calendars of the instance
 *
 * @returns {Promise<Calendar[]>} - A promise that resolve(ICalendar[]) or reject(errorMessage)
 */
export function getCalendars()
		: Promise<Calendar[]> {
	return new Promise((resolve, reject) => {
		MCalendar.find({}, null, (err, db_calendars) => {
			if (err) return reject({code: 500, message: err.message})

			const calendars: Calendar[] = []
			db_calendars.forEach(db_calendar => {
				const calendar = new Calendar(db_calendar._id)
				calendar.init(db_calendar)
				calendars.push(calendar)
			})
			return resolve(calendars)
		})
	})
}
