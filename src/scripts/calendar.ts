import moment from "moment"

import { UICalendar } from "./interfaces"
import { dateString, isOver, isToday, countStreaks } from "./utils"
import { User } from './database'

/**
 * Returns a table of each date of the specified month. From the first
 * day of the month to the last day of the month
 * @param monthDate - A date that is included in the desired month
 * @returns - An Array<Date> of the month
 */
function createMonthArray(monthDate: string): Array<Date> {
	var date: Date = moment(monthDate).toDate()
	var calendar: Array<Date>
	var firstDay: Date = new Date(date.getFullYear(), date.getMonth(), 1)
	var lastDay: number = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

	calendar = Array(lastDay)
	for (let cur = 0; cur < lastDay; cur++) {
		var date: Date = new Date(firstDay)
		date.setDate(firstDay.getDate() + cur)
		calendar[cur] = date
	}
	return (calendar)
}

/**
 * Retrieves the specified calendar and create an UICalendar, with every information to display
 * specified month
 * @param User - The User owning that calendar
 * @param monthDate - A date that is included in the desired month
 * @param id - The id of the calendar
 * @returns - A promise that resolve(Calendar) or reject(errorMessage)
 */
export function getUICalendar(user: User, monthDate: string, id: string): Promise<UICalendar> {
	return new Promise<UICalendar>((resolve, reject) => {
		var calendar: UICalendar = {
			id: "", user_id: "", first_index: 1, days: Array(),
			weekStartsMonday: user.weekStartsMonday, currentStreaks: 0,
			streaksExpandedToday: false
		}
		var monthArray: Array<Date> = createMonthArray(monthDate)

		user.getCalendarById(id).then((db_calendar) => {
			calendar.id = db_calendar._id
			calendar.user_id = db_calendar.user_id.toString()

			calendar.first_index = (7 + monthArray[0].getDay() - (user.weekStartsMonday ? 1 : 0)) % 7
			calendar.currentStreaks = countStreaks(db_calendar)
			calendar.streaksExpandedToday = db_calendar.days.get(dateString(new Date())) != "fail"
			for (let cur = 0; cur < monthArray.length; cur++) {
				calendar.days[cur] = {
					date: monthArray[cur],
					dateString: "",
					dayNum: cur + 1,
					state: "",
					isToday: isToday(monthArray[cur]),
					isOver: isOver(monthArray[cur])
				}
				calendar.days[cur].dateString = dateString(calendar.days[cur].date)
				calendar.days[cur].state = db_calendar.days.get(calendar.days[cur].dateString) || "fail"
			}
			resolve(calendar)
		}).catch(err => {
			reject(err)
		})
	})
}
