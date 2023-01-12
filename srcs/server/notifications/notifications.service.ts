import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { AdminUser } from '../auth/admin.object';
import { CalendarsService } from '../calendars/calendars.service';
import { State } from '../calendars/enum/state.enum';
import { Calendar } from '../calendars/schemas/calendar.schema';
import { UsersService } from '../users/users.service';
import { CalendarNotificationSummary } from './interfaces/summary.interface';
import { Providers } from './providers/providers';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectModel('Calendar') private CalendarModel: Model<Calendar>,
		private readonly usersService: UsersService,
		private readonly calendarsService: CalendarsService,
		private configService: ConfigService,
	) {}

	async sendReminders() {
		const providers = new Providers(this.configService);
		await providers.connect();

		// Select every user that has at least one calendar
		const users = await this.CalendarModel.find().distinct('user');

		const results = [];
		for (const user of users)
			results.push({
				user,
				result: await this.sendReminder(user._id.toString()),
			});

		await providers.disconnect();
		return results;
	}

	async sendReminder(user_id: string, providers = null) {
		// Connect to providers if not already connected
		// (because when called from sendReminders, providers are already connected,
		// so that there is only one connection)
		let providers_passed = false;
		if (!providers) {
			providers_passed = true;
			providers = new Providers(this.configService);
			await providers.connect();
		}

		// Fetch calendars (with today status) and determine user
		const today = DateTime.now().toFormat('yyyy-LL-dd');
		const calendars = await this.calendarsService.findAllForUser(
			AdminUser,
			user_id,
			this.calendarsService.defaultFields + ` days.${today}`,
		);
		if (calendars.length === 0) return 'No calendars found';

		const user = calendars[0].user;

		// Create summary and look if day is done
		const summary: CalendarNotificationSummary = [];
		let day_done = true;
		for (const calendar of calendars) {
			const today_status = calendar['days'][today] || State.Fail;
			// If today is a fail, day is not done
			if (today_status === State.Fail) day_done = false;

			// If reminders are disabled for this calendar,
			// skip it (don't add it to summary)
			if (
				calendar.notifications &&
				calendar.notifications.reminders === false
			)
				continue;

			summary.push({
				name: calendar.name,
				status: today_status,
				current_streak: calendar.current_streak,
			});
		}

		let results = 'No notifications to send';
		if (day_done) {
			// If day is done, send day done notification
			if (
				user.notifications.send_day_done !== false &&
				user.notifications.day_done_notif_sent_today !== true
			)
				results = await providers.sendDayDone(user);
			else results = 'Day done notifications already sent today';
		} else {
			// If day is not done, send reminder notification

			// Only send if there is at least one fail in the summary
			for (const item of summary) {
				if (item.status === State.Fail) {
					results = await providers.sendReminder(user, summary);
					break;
				}
			}
		}

		if (!providers_passed) await providers.disconnect();

		// Update user to set done_notif_sent_today to day_done
		// so for the next iteration, there will not be a second day done notification sent
		await this.usersService.update(user_id, {
			notifications: {
				...user.notifications,
				day_done_notif_sent_today: day_done,
			},
		});

		return results;
	}

	async sendCongrat(calendar_id: string) {
		const providers = new Providers(this.configService);
		await providers.connect();

		const today = DateTime.now().toFormat('yyyy-LL-dd');
		const calendar = await this.calendarsService.findOne(
			AdminUser,
			calendar_id,
			this.calendarsService.defaultFields + ` days.${today}`,
		);
		if (!calendar) throw new NotFoundException('Calendar not found');

		// Check that today is not a fail
		const today_status = calendar['days'][today] || State.Fail;
		if (today_status === State.Fail) return "Today's still a fail";

		const results = await providers.sendCongratulation(calendar);
		await providers.disconnect();
		return results;
	}
}
