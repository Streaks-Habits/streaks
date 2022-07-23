import moment from 'moment'

/**
 * Converts a date into a string format as follows YYYY-MM-DD
 *
 * @param {Date | string} date - The date to convert
 * @returns {string} - A string of characters representing a date in YYYY-MM-DD format
 */
export function dateString(date: Date | string): string {
	return (moment(date).format('YYYY-MM-DD'))
}

/**
 * remark - Compares year, month and day, not hours/minutes
 *
 * @returns {boolean} - True if the date is the same as today's date
 * @param {Date} date - The date to compare with today date
 */
export function isToday(date: Date):boolean {
	const	today: Date = new Date()

	if (dateString(today) == dateString(date))
		return (true)
	return (false)
}

/**
 * remark - Compares year, month and day, not hours/minutes
 *
 * @returns {boolean} - Return true if the specified date is in the past or is today
 * @param {Date} date - The date to compare
 */
export function isOver(date: Date): boolean {
	const	today: Date = new Date()

	if (date < today || isToday(date))
		return (true)
	return (false)
}

/**
 * Indicates if the current time is between the two times passed in parameter
 *
 * @param {string} start_date - The starting time, formated as HH:mm
 * @param {string} end_date - The starting time, formated as HH:mm
 * @returns {boolean} - true if the current time is between the two times passed in parameter
 */
export function hour_between(start_date: string, end_date: string): boolean {
	const start_date_minutes = moment(start_date, 'HH:mm').valueOf()
	const end_date_minutes = moment(end_date, 'HH:mm').valueOf()
	const current_date_minutes = moment().valueOf()

	if (current_date_minutes >= start_date_minutes && current_date_minutes <= end_date_minutes)
		return (true)
	return (false)
}
