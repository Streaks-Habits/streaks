import chalk from 'chalk'
import dotenv from 'dotenv'

import { dateString } from './utils'
import { getCalendars } from './database/Calendar'
import { sendNotifications } from './notifications/notifications'

dotenv.config()

/**
 * Go through the calendar and set the breakday status to the current day
 * if it is a breakday (a 0 in agenda)
 * @return - A promise that resolve(void) at the end
 */
function setBreakdays(): Promise<void> {
	return new Promise((resolve) => {
		getCalendars().then((calendars) => {
			const promisesList: Array<Promise<void>> = []

			calendars.forEach((calendar) => {

				promisesList.push(new Promise((resolve) => {
					const weekday: number = new Date().getDay()

					if (calendar.agenda && !calendar.agenda[weekday]) {
						if (!calendar.days || calendar.days.get(dateString(new Date())) != 'success') {
							calendar.setDayState(dateString(new Date()), 'breakday').catch((err) => {
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
 * Run the setBreakday function, then sendNotifications
 */
export function runDaemons(): Promise<void> {
	return new Promise((resolve) => {
		setBreakdays().then(() => {
			sendNotifications().then(() => {
				resolve()
			})
		})
	})
}
