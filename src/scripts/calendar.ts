import fs from "fs"

import { getData, findDayInData } from "./data"
import { DataDay, Data, Calendar, CalendarMeta } from "./interfaces"

export function dateString(date: Date): string {
	return (date.toISOString().split('T')[0])
}

function getCalendarArray(monthDate: Date): Array<Date> {
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

function isToday(date: Date):Boolean {
	var	today: Date = new Date();

	if (today.toISOString().split('T')[0] ==
		date.toISOString().split('T')[0])
		return (true)
	return (false)
}

export function isOver(date: Date): Boolean {
	var	today: Date = new Date();

	if (date < today || isToday(date))
		return (true)
	return (false)
}

function countStreaks(data: Data): number {
	var date: Date = new Date()
	var streaks: number = 0
	var current_state: string

	current_state = findDayInData(data, dateString(date)).state
	do {
		if (current_state == "success")
			streaks++;
		date.setDate(date.getDate() - 1)
		current_state = findDayInData(data, dateString(date)).state
	} while (current_state != "fail")
	return (streaks)
}

export function getCalendar(monthDate: Date, dataPath: string): Promise<Calendar> {
	return new Promise<Calendar>((resolve, reject) => {
		var calendar: Calendar = {first_index: 1, days: Array(), firstDayOfWeek: 0, currentStreaks: 0, streaksExpandedToday: false}
		var dateCalendar: Array<Date> = getCalendarArray(monthDate)
		var daysNum = dateCalendar.length

		getData(dataPath).then((data) => {
			calendar.first_index = (7 + dateCalendar[0].getDay() - data.firstDayOfWeek - 1) % 7
			calendar.days = Array(daysNum)
			calendar.currentStreaks = countStreaks(data)
			calendar.streaksExpandedToday = findDayInData(data, dateString(new Date())).state != "fail"
			for (let cur = 0; cur < daysNum; cur++) {
				let dataDay: DataDay;
				calendar.days[cur] = {
					date: dateCalendar[cur],
					dateString: "",
					dayNum: cur + 1,
					state: "",
					isToday: isToday(dateCalendar[cur]),
					isOver: isOver(dateCalendar[cur])
				}
				calendar.days[cur].dateString = dateString(calendar.days[cur].date)
				dataDay = findDayInData(data, calendar.days[cur].dateString)
				calendar.days[cur].state = dataDay.state
			}
			if (data.firstDayOfWeek)
				calendar.firstDayOfWeek = 1
			resolve(calendar)
		}).catch(() => {
			reject("error in getData (calendar.ts, getCalendar())")
		})
	})
}

export function getCalendarList(): Promise<Array<CalendarMeta>> {
	return new Promise<Array<CalendarMeta>>((resolve, reject) => {
		var calendarList: Array<CalendarMeta> = new Array()

		fs.readdir("./streaks", (err, files) => {
			if (err) return reject("error in getCalendarList (calendar.ts)")

			var getDataPromises: Array<Promise<Data>> = Array()
			for (let file of files)
				getDataPromises.push(getData(file))
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
