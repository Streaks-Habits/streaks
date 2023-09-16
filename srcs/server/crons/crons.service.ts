import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { AdminUser } from '../auth/admin.object';
import { CalendarsService } from '../calendars/calendars.service';
import { State } from '../calendars/enum/state.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { isDemoUserEnabled } from '../utils';
import { UserDoc } from '../users/schemas/user.schema';
import { ProgressesService } from '../progresses/progresses.service';

@Injectable()
export class CronsService {
	constructor(
		private readonly configService: ConfigService,
		private readonly notificationsService: NotificationsService,
		private readonly calendarsService: CalendarsService,
		private readonly progressesService: ProgressesService,
		private readonly usersService: UsersService,
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
				(!calendar.hasOwnProperty('days') ||
					!calendar['days'].hasOwnProperty(today_str) ||
					(calendar['days'][today_str] !== State.Success &&
						calendar['days'][today_str] !== State.Breakday))
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

	// Every day at 00:00
	@Cron('0 0 * * *')
	async resetDemoUser() {
		if (!isDemoUserEnabled(this.configService)) return;

		const demoUser = (await this.usersService.findByUsername(
			'demo',
		)) as UserDoc;
		if (!demoUser) {
			this.usersService.createDemoUser();
			return;
		}

		// Remove all calendars
		const calendars = await this.calendarsService.findAllForUser(
			demoUser,
			demoUser._id.toString(),
		);
		for (const calendar of calendars) {
			await this.calendarsService.delete(
				demoUser,
				calendar._id.toString(),
			);
		}

		// Remove all progresses
		const progresses = await this.progressesService.findAllForUser(
			demoUser,
			demoUser._id.toString(),
			DateTime.now().toFormat('yyyy-MM-dd'),
		);
		for (const progress of progresses) {
			await this.progressesService.delete(
				demoUser,
				progress._id.toString(),
			);
		}
	}
}
