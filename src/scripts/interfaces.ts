export interface DataDay {
	date: string,
	state: string
}
export interface Data {
	filename: string,
	name: string,
	firstDayOfWeek: number,
	agenda: Array<number>,
	days: Array <DataDay>
}
export interface CalendarDay {
	date: Date,
	dateString: string,
	dayNum: number,
	state: string,
	isToday: Boolean,
	isOver: Boolean
}
export interface Calendar {
	firstDayOfWeek: number,
	first_index: number,
	currentStreaks: number,
	streaksExpandedToday: boolean,
	days: Array<CalendarDay>
}
export interface CalendarMeta {
	name: string,
	filename: string
}
