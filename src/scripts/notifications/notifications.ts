import moment from 'moment'

import { Calendar } from '../database/Calendar'
import { getUsers, User } from '../database/User'
import { hour_between } from '../utils'
import { MatrixNotifications } from './matrix'

export async function sendNotifications() {
	let matrix: MatrixNotifications | undefined

	// Check enabled services and enable them
	if (process.env.MATRIX_ENABLED && process.env.MATRIX_ENABLED == 'true') {
		matrix = new MatrixNotifications()
		await matrix.connect()
	}

	const users = await getUsers()

	const notificationsPromises: Array<Promise<void>> = []

	for (let u = 0; u < users.length; u++) {
		if (!users[u].notifications)
			continue

		const calendars = await users[u].getCalendars()

		for (let c = 0; c < calendars.length; c++) {
			if (calendars[c].days?.get(moment().format('YYYY-MM-DD')) &&
				calendars[c].days?.get(moment().format('YYYY-MM-DD')) != 'fail')
				continue

			if (matrix && (users[u].notifications?.matrix.room_id ?? false))
				if (hour_between((users[u].notifications?.matrix.start_date ?? '00:00'), (users[u].notifications?.matrix.end_date ?? '24:00')))
					notificationsPromises.push(matrix.sendReminder((users[u].notifications?.matrix.room_id ?? ''), calendars[c]))
		}
	}

	await Promise.allSettled(notificationsPromises).then(async () => {
		if (matrix)
			matrix.disconnect()
	})
}

export async function sendCongratulation(user: User, calendar: Calendar) {
	let matrix: MatrixNotifications | undefined

	// Check enabled services and enable them
	if (process.env.MATRIX_ENABLED && process.env.MATRIX_ENABLED == 'true') {
		matrix = new MatrixNotifications()
		await matrix.connect()
	}

	const notificationsPromises: Array<Promise<void>> = []

	if (calendar.days?.get(moment().format('YYYY-MM-DD')) &&
		calendar.days?.get(moment().format('YYYY-MM-DD')) != 'success')
		return

	if (matrix && (user.notifications?.matrix.room_id ?? false))
		if (hour_between((user.notifications?.matrix.start_date ?? '00:00'), (user.notifications?.matrix.end_date ?? '24:00')))
			notificationsPromises.push(matrix.sendCongratulation((user.notifications?.matrix.room_id ?? ''), calendar))

	await Promise.allSettled(notificationsPromises).then(async () => {
		if (matrix)
			matrix.disconnect()
	})
}
