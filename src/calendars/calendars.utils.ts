import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from 'src/users/enum/roles.enum';
import { IUser } from 'src/users/interface/user.interface';
import { ICalendar } from './interface/calendar.interface';

export function asCalendarAccess(user: IUser, calendar: ICalendar): void {
	if (
		user.role != Role.Admin &&
		calendar.user.toString() != user._id.toString()
	)
		throw new UnauthorizedException(
			'you are not allowed to access this calendar',
		);
}

export async function checkCalendarAccess(
	user: IUser,
	calendarId: string,
	CalendarModel: Model<ICalendar>,
): Promise<void> {
	const existingCalendar = await CalendarModel.findById(calendarId, 'user');
	if (!existingCalendar) throw new NotFoundException('Calendar not found');

	asCalendarAccess(user, existingCalendar);
}
