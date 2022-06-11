import moment from "moment"

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
