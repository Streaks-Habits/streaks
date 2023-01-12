import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { RCalendar } from 'srcs/server/calendars/schemas/calendar.schema';
import { RUser } from 'srcs/server/users/schemas/user.schema';
import { CalendarNotificationSummary } from '../interfaces/summary.interface';
import { MatrixProvider } from './matrix.provider';

export class Providers {
	matrixProvider = new MatrixProvider(this.configService);
	matrixReady = false;

	constructor(private configService: ConfigService) {}

	async connect() {
		if (this.configService.get('MATRIX_ENABLED') === 'true')
			this.matrixReady = await this.matrixProvider.connect();
	}

	async disconnect() {
		if (this.configService.get('MATRIX_ENABLED') === 'true')
			await this.matrixProvider.disconnect();
	}

	isInTimeRange(user: RUser): boolean {
		return (
			DateTime.now().valueOf() >=
				DateTime.fromFormat(
					user.notifications.matrix.start_date,
					'HH:mm',
				).valueOf() &&
			DateTime.now().valueOf() <=
				DateTime.fromFormat(
					user.notifications.matrix.end_date,
					'HH:mm',
				).valueOf()
		);
	}

	isMatrixNotifSendable(
		user: RUser,
		check_time_range = false,
	): [boolean, string] {
		if (this.configService.get('MATRIX_ENABLED') !== 'true')
			return [false, 'Matrix: disabled'];

		if (!this.matrixReady) return [false, 'Matrix: connection failed'];

		if (!user.notifications || !user.notifications.matrix)
			return [false, 'Matrix: not configured by user'];

		if (check_time_range && !this.isInTimeRange(user))
			return [false, 'Matrix: not in time range'];

		return [true, 'Matrix: sendable'];
	}

	async sendReminder(user: RUser, summary: CalendarNotificationSummary) {
		const ret: string[] = [];

		// Matrix
		const [matrix_sendable, matrix_reason] = this.isMatrixNotifSendable(
			user,
			true,
		);
		if (!matrix_sendable) ret.push(matrix_reason);
		else {
			await this.matrixProvider.sendReminder(
				user.notifications.matrix.room_id,
				summary,
			);
			ret.push(`Matrix: sent`);
		}

		return ret;
	}

	async sendCongratulation(calendar: RCalendar) {
		const ret: string[] = [];

		// Matrix
		const [matrix_sendable, matrix_reason] = this.isMatrixNotifSendable(
			calendar.user,
			true,
		);
		if (!matrix_sendable) ret.push(matrix_reason);
		else {
			await this.matrixProvider.sendCongratulation(
				calendar.user.notifications.matrix.room_id,
				calendar,
			);
			ret.push(`Matrix: sent`);
		}

		return ret;
	}

	async sendDayDone(user: RUser) {
		const ret: string[] = [];

		// Matrix
		const [matrix_sendable, matrix_reason] = this.isMatrixNotifSendable(
			user,
			true,
		);
		if (!matrix_sendable) ret.push(matrix_reason);
		else {
			await this.matrixProvider.sendDayDone(
				user.notifications.matrix.room_id,
			);
			ret.push(`Matrix: sent`);
		}

		return ret;
	}
}
