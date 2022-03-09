/* An element of the table days in the file streaks.json */
export interface StreaksFileDay {
	date: string,
	state: string
}
/* The content of the streaks.json file */
export interface StreaksFile {
	filename: string,
	name: string,
	firstDayOfWeek: number,
	agenda: Array<number>,
	days: Array <StreaksFileDay>
}
/* An element of the Calendar table days */
export interface CalendarDay {
	date: Date,
	dateString: string,
	dayNum: number,
	state: string,
	isToday: Boolean,
	isOver: Boolean
}
/* Data processed from StreaksFile, ready to be used by EJS */
export interface Calendar {
	firstDayOfWeek: number,
	first_index: number,
	currentStreaks: number,
	streaksExpandedToday: boolean,
	days: Array<CalendarDay>
}
/* A light calendar, used for the calendar list */
export interface CalendarMeta {
	name: string,
	filename: string
}
