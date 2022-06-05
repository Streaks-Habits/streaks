import { getCalendars, User } from './database'
import { dateString } from './utils'
import chalk from 'chalk'

/**
 * Go through the calendar and set the breakday status to the current day
 * if it is a breakday (a 0 in agenda)
 * @return - A promise that resolve(void) at the end
 */
function setBreakdays(): Promise<void> {
	return new Promise((resolve, _reject) => {
		getCalendars().then((db_calendars) => {
			var promisesList: Array<Promise<void>> = Array()

			db_calendars.forEach((db_calendar) => {
				promisesList.push(new Promise((resolve, _reject) => {
					var user = new User(db_calendar.user_id.toString())
					var weekday: number = new Date().getDay()

					if (!db_calendar.agenda[weekday]) {
						if (db_calendar.days.get(dateString(new Date())) != "success") {
							user.setDayState(db_calendar._id, dateString(new Date()), "breakday").catch((err) => {
								console.error(`Daemons: ${chalk.red(err.message)}`)
							}).finally(() => {
								resolve()
							})
						}
						else
							resolve()
					}
					else
						resolve()
				}))
			})
			Promise.allSettled(promisesList).then(() => {
				resolve()
			})
		}).catch((err) => {
			console.error(`Daemons: ${chalk.red(err.message)}`)
			resolve()
		})
	})
}

/**
 * Run the setBreakday function
 * @returns - A promise that resolve(void) at the end
 */
export function runDaemons(): Promise<void> {
	return new Promise((resolve, _reject) => {
		setBreakdays().then(() => {
			resolve()
		})
	})
}
