import chalk from 'chalk'
import moment from 'moment'
import dotenv from 'dotenv'

import { MatrixNotifications } from './notifications/matrix'
import { dateString } from './utils'
import { getUsers } from './database/User'
import { getCalendars } from './database/Calendar'

dotenv.config()

/**
 * Go through the calendar and set the breakday status to the current day
 * if it is a breakday (a 0 in agenda)
 * @return - A promise that resolve(void) at the end
 */
function setBreakdays(): Promise<void> {
	return new Promise((resolve, _reject) => {
		getCalendars().then((calendars) => {
			var promisesList: Array<Promise<void>> = Array()

			calendars.forEach((calendar) => {

				promisesList.push(new Promise((resolve, _reject) => {
					var weekday: number = new Date().getDay()

					if (!calendar.agenda![weekday]) {
						if (calendar.days!.get(dateString(new Date())) != "success") {
							calendar.setDayState(dateString(new Date()), "breakday").catch((err) => {
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

export async function sendNotifications() {
	var matrix: MatrixNotifications | undefined

	// Check enabled services and enable them
	if (process.env.MATRIX_ENABLED && process.env.MATRIX_ENABLED == "true") {
		matrix = new MatrixNotifications()
		await matrix.connect()
	}

	const users = await getUsers()

	var notificationsPromises: Array<Promise<void>> = Array()

	for (let u = 0; u < users.length; u++) {
		const calendars = await users[u].getCalendars()

		for (let c = 0; c < calendars.length; c++) {
			if (calendars[c].days!.get(moment().format('YYYY-MM-DD')) &&
				calendars[c].days!.get(moment().format('YYYY-MM-DD')) != 'fail')
				continue;

			if (matrix && users[u].notifications!.matrix.room_id)
				notificationsPromises.push(matrix.sendReminder(users[u].notifications!.matrix.room_id, calendars[c]))
		}
	}

	await Promise.allSettled(notificationsPromises).then(async results => {
		if (matrix)
			matrix.disconnect()
	})
}

/**
 * Run the setBreakday function, then sendNotifications
 */
export function runDaemons(): Promise<void> {
	return new Promise((resolve, _reject) => {
		setBreakdays().then(() => {
			sendNotifications().then(() => {
				resolve()
			})
		})
	})
}
