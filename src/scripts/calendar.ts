import fs from "fs"

import { getStreaks, findDayInData, countStreaks } from "./data"
import { StreaksFileDay, StreaksFile, Calendar, CalendarMeta } from "./interfaces"
import { dateString, isOver, isToday } from "./utils"

/**
 * Returns a table of each date of the specified month. From the first day of the month to the last day of the month
 * @param monthDate - A date that is included in the desired month
 * @returns - An Array<Date> of the month
 */
function createMonthArray(monthDate: Date): Array<Date> {
	var calendar: Array<Date>
	var firstDay: Date = new Date(monthDate.getFullYear(), monthDate.getMonth(), 2)
	var lastDay: number = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()

	calendar = Array(lastDay)
	for (let cur = 0; cur < lastDay; cur++) {
		var date: Date = new Date(firstDay)
		date.setDate(firstDay.getDate() + cur)
		calendar[cur] = date
	}
	return (calendar)
}

/**
 * Retrieves the contents of the specified streaks file and returns data for the specified month
 * @param monthDate - A date that is included in the desired month
 * @param filename - The name of the calendar file in the streaks folder (e.g. example.streaks.json)
 * @returns - A promise that resolve(Calendar) or reject(errorMessage)
 */
export function getCalendar(monthDate: Date, filename: string): Promise<Calendar> {
	return new Promise<Calendar>((resolve, reject) => {
		var calendar: Calendar = {first_index: 1, days: Array(), firstDayOfWeek: 0, currentStreaks: 0, streaksExpandedToday: false}
		var monthArray: Array<Date> = createMonthArray(monthDate)
		var daysNum = monthArray.length

		getStreaks(filename).then((data) => {
			calendar.first_index = (7 + monthArray[0].getDay() - data.firstDayOfWeek - 1) % 7
			calendar.days = Array(daysNum)
			calendar.currentStreaks = countStreaks(data)
			calendar.streaksExpandedToday = findDayInData(data, dateString(new Date())).state != "fail"
			for (let cur = 0; cur < daysNum; cur++) {
				let StreaksFileDay: StreaksFileDay;
				calendar.days[cur] = {
					date: monthArray[cur],
					dateString: "",
					dayNum: cur + 1,
					state: "",
					isToday: isToday(monthArray[cur]),
					isOver: isOver(monthArray[cur])
				}
				calendar.days[cur].dateString = dateString(calendar.days[cur].date)
				StreaksFileDay = findDayInData(data, calendar.days[cur].dateString)
				calendar.days[cur].state = StreaksFileDay.state
			}
			if (data.firstDayOfWeek)
				calendar.firstDayOfWeek = 1
			resolve(calendar)
		}).catch(() => {
			reject("error in getData (calendar.ts, getCalendar())")
		})
	})
}

/**
 * Returns a list of calendars contained in the streaks folder
 * @returns - A promise that resolve(Array<CalendarMeta>) or reject(errorMessage)
 */
export function getCalendarList(): Promise<Array<CalendarMeta>> {
	return new Promise<Array<CalendarMeta>>((resolve, reject) => {
		var calendarList: Array<CalendarMeta> = new Array()

		fs.readdir("./streaks", (err, files) => {
			if (err) return reject("error in getCalendarList (calendar.ts)")

			var getDataPromises: Array<Promise<StreaksFile>> = Array()
			for (let file of files)
				getDataPromises.push(getStreaks(file))
			Promise.allSettled(getDataPromises).then((results) => {
				results.forEach((result) => {
					if (result.status == 'fulfilled')
					{
						calendarList.push({
							name: result.value.name,
							filename: result.value.filename
						})
					}
				})
				resolve(calendarList)
			})
		})
	})
}
