import chalk from 'chalk'
import moment from 'moment'

import { dateString } from '../utils'
import { ICalendar, MCalendar } from './database'

export class Calendar {
	initialized = false
	// From constructor
	id: string
	// From database / init
	name: ICalendar['name'] | undefined
	user_id: ICalendar['user_id'] | undefined
	agenda: ICalendar['agenda'] | undefined
	days: ICalendar['days'] | undefined

	public constructor (id: string) {
		this.id = id
	}

	dbInit(): Promise<void> {
		return new Promise((resolve, reject) => {
			getCalendarById(this.id).then((calendar) => {
				this.name = calendar.name
				this.user_id = calendar.user_id
				this.agenda = calendar.agenda
				this.days = calendar.days

				this.initialized = true
				resolve()
			}).catch((err) => {
				reject(err)
			})
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	init(calendar: (ICalendar & { _id: any; })): void {
		this.name = calendar.name
		this.user_id = calendar.user_id
		this.agenda = calendar.agenda
		this.days = calendar.days

		this.initialized = true
	}

	/**
	 * Set the given state (success, fail...) of the given day (YYYY-MM-DD) for the given calendar
	 * @param date - The date to set (formated as YYYY-MM-DD)
	 * @param state - The state to set (must be success, fail, breakday or freeze)
	 * @returns - A promise that resolve(ICalendar) or reject(errorMessage)
	 */
	setDayState(date: string, state: string)
			: Promise<ICalendar> {
		if (!this.initialized) {
			console.error(chalk.red('The calendar has not been initialized.'))
			process.exit(1)
		}

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

					return resolve(calendar)
				})
		})
	}

	/**
	 * Returns the current streaks of the specified calendar
	 * @returns - The current streaks (a number)
	 */
	countStreaks(): number {
		if (!this.initialized) {
			console.error(chalk.red('The calendar has not been initialized.'))
			process.exit(1)
		}
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
}

/**
 * Find a calendar in the database with the given id
 * @param id - The calendar's id
 * @returns - A promise that resolve(ICalendar) if passwords match or reject(errorMessage)
 */
export function getCalendarById(id: string)
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
* @returns - A promise that resolve(ICalendar[]) or reject(errorMessage)
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
