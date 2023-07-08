import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from '../users/enum/roles.enum';
import { UserDoc } from '../users/schemas/user.schema';
import { Calendar, CalendarDoc, RCalendar } from './schemas/calendar.schema';

export function asCalendarAccess(
	user: UserDoc,
	calendar: RCalendar | CalendarDoc,
): void {
	if (user.role == Role.Admin) return;

	if (!calendar.user)
		throw new UnauthorizedException('this calendar is not owned');

	let calendarUser: string;
	if (typeof calendar.user == 'string') calendarUser = calendar.user;
	else calendarUser = calendar.user._id.toString();

	if (calendarUser != user._id.toString())
		throw new UnauthorizedException(
			'you are not allowed to access this calendar',
		);
}

export async function checkCalendarAccess(
	user: UserDoc,
	calendarId: string,
	CalendarModel: Model<Calendar>,
	additionalFields = '',
): Promise<CalendarDoc> {
	const existingCalendar = (await CalendarModel.findById(
		calendarId,
		'user ' + additionalFields,
	)) as CalendarDoc;
	if (!existingCalendar) throw new NotFoundException('Calendar not found');

	// Will throw an exception if the user is not allowed to access this calendar
	asCalendarAccess(user, existingCalendar);
	return existingCalendar;
}
