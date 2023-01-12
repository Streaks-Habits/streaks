import { State } from 'srcs/server/calendars/enum/state.enum';

export type CalendarNotificationSummary = Array<{
	name: string;
	status: State;
	current_streak: number;
}>;
