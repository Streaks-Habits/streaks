import moment from 'moment'

/**
 * Converts a date into a string format as follows YYYY-MM-DD
 * @param date - The date to convert
 * @returns - A string of characters representing a date in YYYY-MM-DD format
 */
export function dateString(date: Date | string): string {
	return (moment(date).format('YYYY-MM-DD'))
}

/**
 * @returns - True if the date is the same as today's date
 * @param date - The date to compare with today date
 * @remark - Compares year, month and day, not hours/minutes
 */
export function isToday(date: Date):boolean {
	const	today: Date = new Date()

	if (dateString(today) == dateString(date))
		return (true)
	return (false)
}

/**
 * @returns - Return true if the specified date is in the past or is today
 * @param date - The date to compare
 * @remark - Compares year, month and day, not hours/minutes
 */
export function isOver(date: Date): boolean {
	const	today: Date = new Date()

	if (date < today || isToday(date))
		return (true)
	return (false)
}

/**
 *
 */
export function hour_between(start_date: string, end_date: string): boolean {
	// Start
	let moment_date = moment(start_date, 'HH:mm')
	const start_date_minutes = moment_date.hours() * 60 + moment(moment_date, 'HH:mm').minutes()
	// End
	moment_date = moment(end_date, 'HH:mm')
	const end_date_minutes = moment_date.hours() * 60 + moment(moment_date, 'HH:mm').minutes()
	// Current
	moment_date = moment()
	const current_date_minutes = moment_date.hours() * 60 + moment(moment_date, 'HH:mm').minutes()

	if (current_date_minutes >= start_date_minutes && current_date_minutes <= end_date_minutes)
		return (true)
	return (false)
}
