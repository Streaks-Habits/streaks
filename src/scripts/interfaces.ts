/* An element of the Calendar table days */
interface UICalendarDay {
	date: Date,
	dateString: string,
	dayNum: number,
	state: string,
	isToday: Boolean,
	isOver: Boolean
}
/* Data processed from getUICalendar, ready to be used by EJS */
export interface UICalendar {
	id: string,
	user_id: string,
	weekStartsMonday: boolean,
	first_index: number,
	currentStreaks: number,
	streaksExpandedToday: boolean,
	days: Array<UICalendarDay>
}
/* A light calendar, used for the calendar list */
export interface UICalendarMeta {
	id: string,
	name: string
}
