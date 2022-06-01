import moment from "moment"

import { ICalendar } from "./database"

/**
 * Converts a date into a string format as follows YYYY-MM-DD
 * @param date - The date to convert
 * @returns - A string of characters representing a date in YYYY-MM-DD format
 */
export function dateString(date: Date | string): string {
	return (moment(date).format("YYYY-MM-DD"))
}

/**
 * @returns - True if the date is the same as today's date
 * @param date - The date to compare with today date
 * @remark - Compares year, month and day, not hours/minutes
 */
export function isToday(date: Date):Boolean {
	var	today: Date = new Date();

	if (dateString(today) == dateString(date))
		return (true)
	return (false)
}

/**
 * @returns - Return true if the specified date is in the past or is today
 * @param date - The date to compare
 * @remark - Compares year, month and day, not hours/minutes
 */
export function isOver(date: Date): Boolean {
	var	today: Date = new Date();

	if (date < today || isToday(date))
		return (true)
	return (false)
}

/**
 * Returns the current streaks of the specified calendar
 * @param calendar - The database calendar to count in
 * @returns - The current streaks (a number)
 */
 export function countStreaks(calendar: ICalendar): number {
	var date: Date = new Date()
	var streaks: number = 0
	var current_state: string

	current_state = calendar.days.get(dateString(date)) || "fail"
	do {
		if (current_state == "success")
			streaks++;
		date.setDate(date.getDate() - 1)
		current_state = calendar.days.get(dateString(date)) || "fail"
	} while (current_state && current_state != "fail")
	return (streaks)
}
