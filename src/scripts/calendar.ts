import moment from 'moment'

import { dateString, isOver, isToday } from './utils'
import { User } from './database/User'

/**
 * Returns a table of each date of the specified month. From the first
 * day of the month to the last day of the month
 *
 * @param {string} monthDate - A date that is included in the desired month
 * @returns {Array<Date>} - An Array<Date> of the month
 */
function createMonthArray(monthDate: string): Array<Date> {
	let date: Date = moment(monthDate).toDate()
	const firstDay: Date = new Date(date.getFullYear(), date.getMonth(), 1)
	const lastDay: number = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

	const calendar = Array(lastDay)
	for (let cur = 0; cur < lastDay; cur++) {
		date = new Date(firstDay)
		date.setDate(firstDay.getDate() + cur)
		calendar[cur] = date
	}
	return (calendar)
}

interface UICalendarDay {
	date: Date,
	dateString: string,
	dayNum: number,
	state: string,
	isToday: boolean,
	isOver: boolean
}
export interface UICalendar {
	id: string,
	user_id: string,
	weekStartsMonday: boolean,
	first_index: number,
	currentStreaks: number,
	streaksExpandedToday: boolean,
	days: Array<UICalendarDay>
}

/**
 * Retrieves the specified calendar and create an UICalendar, with every information to display
 * specified month
 *
 * @param {User} user - The User owning that calendar
 * @param {string} monthDate - A date that is included in the desired month
 * @param {string} id - The id of the calendar
 * @returns {Promise<UICalendar>} - A promise that resolve(Calendar) or reject(errorMessage)
 */
export function getUICalendar(user: User, monthDate: string, id: string): Promise<UICalendar> {
	return new Promise<UICalendar>((resolve, reject) => {
		const ui_calendar: UICalendar = {
			id: '', user_id: '', first_index: 1, days: [],
			weekStartsMonday: user.weekStartsMonday, currentStreaks: 0,
			streaksExpandedToday: false
		}
		const monthArray: Array<Date> = createMonthArray(monthDate)

		user.getCalendarById(id).then((calendar) => {
			ui_calendar.id = calendar.id
			ui_calendar.user_id = calendar.user_id?.toString() ?? ''

			ui_calendar.first_index = (7 + monthArray[0].getDay() - (user.weekStartsMonday ? 1 : 0)) % 7
			ui_calendar.currentStreaks = calendar.countStreaks()
			ui_calendar.streaksExpandedToday = (calendar.days?.get(dateString(new Date())) ?? 'fail') != 'fail'
			for (let cur = 0; cur < monthArray.length; cur++) {
				ui_calendar.days[cur] = {
					date: monthArray[cur],
					dateString: '',
					dayNum: cur + 1,
					state: '',
					isToday: isToday(monthArray[cur]),
					isOver: isOver(monthArray[cur])
				}
				ui_calendar.days[cur].dateString = dateString(ui_calendar.days[cur].date)
				ui_calendar.days[cur].state = calendar.days?.get(ui_calendar.days[cur].dateString) ?? 'fail'
			}
			resolve(ui_calendar)
		}).catch(err => {
			reject(err)
		})
	})
}
