import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { AdminUser } from '../auth/admin.object';
import { CalendarsService } from '../calendars/calendars.service';
import { State } from '../calendars/enum/state.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CronsService {
	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly calendarsService: CalendarsService,
	) {}

	// Every hour at 50 minutes
	@Cron('50 * * * *')
	async handleCron() {
		await this.setBreakDays();
		await this.notificationsService.sendReminders();
	}

	async setBreakDays() {
		const today = DateTime.now();
		const today_str = today.toFormat('yyyy-LL-dd');
		const calendars = await this.calendarsService.findAll(
			AdminUser,
			this.calendarsService.defaultFields + ` days.${today_str}`,
			true,
		);
		for (const calendar of calendars) {
			// If today is a break day, set it but don't overwrite success
			// weekday - 1 because weekdays are 1-indexed
			if (
				calendar.agenda[today.weekday - 1] === false &&
				calendar['days'][today_str] !== State.Success &&
				calendar['days'][today_str] !== State.Breakday
			) {
				await this.calendarsService.setState(
					AdminUser,
					calendar._id.toString(),
					State.Breakday,
					today_str,
				);
			}
		}
	}
}
