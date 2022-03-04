import path from "path"

import { DataDay, Data, Calendar } from "./interfaces"

function dateString(date: Date): string {
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

function findDayInData(data: Data, date: string): DataDay {
	var dataDay: DataDay = {
		date: date,
		state: "fail"
	}

	for (let cur = 0; cur < data.days.length; cur++) {
		if (data.days[cur].date == date)
		{
			if (!["fail", "freeze", "breakday", "success"].includes(data.days[cur].state))
				break
			dataDay = data.days[cur]
		}
	}
	return (dataDay)
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
	var today_done: boolean = false

	today_done = findDayInData(data, dateString(date)).state == "success"
	while (findDayInData(data, dateString(date)).state != "fail" || isToday(date)) {
		streaks++;
		date.setDate(date.getDate() - 1)
	}
	if (streaks == 1 && !today_done)
		streaks = 0
	if (streaks > 1 && !today_done)
		streaks--
	return (streaks)
}

export function getCalendar(monthDate: Date, dataPath: string):Calendar {
	var calendar: Calendar = {first_index: 1, days: Array(), firstDayOfWeek: 0, currentStreaks: 0, streaksExpandedToday: false}
	var dateCalendar: Array<Date> = getCalendarArray(monthDate)
	var daysNum = dateCalendar.length
	var data: Data = require(path.join("../../", "streaks", dataPath))

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
	return (calendar)
}
