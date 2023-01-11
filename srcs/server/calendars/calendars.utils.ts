import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from '../users/enum/roles.enum';
import { UserDoc } from '../users/schemas/user.schema';
import { Calendar, CalendarDoc, RCalendar } from './schemas/calendar.schema';

export function asCalendarAccess(
	user: UserDoc,
	calendar: RCalendar | CalendarDoc,
): void {
	if (
		user.role != Role.Admin &&
		calendar.user.toString() != user._id.toString()
	)
		throw new UnauthorizedException(
			'you are not allowed to access this calendar',
		);
}

export async function checkCalendarAccess(
	user: UserDoc,
	calendarId: string,
	CalendarModel: Model<Calendar>,
): Promise<void> {
	const existingCalendar = (await CalendarModel.findById(
		calendarId,
		'user',
	)) as CalendarDoc;
	if (!existingCalendar) throw new NotFoundException('Calendar not found');

	asCalendarAccess(user, existingCalendar);
}
