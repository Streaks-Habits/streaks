import { ConfigService } from '@nestjs/config';
import * as matrix from 'matrix-js-sdk';
import { logger } from 'matrix-js-sdk/lib/logger';
import { DateTime } from 'luxon';
import { CalendarNotificationSummary } from '../interfaces/summary.interface';
import { State } from 'srcs/server/calendars/enum/state.enum';
import { RCalendar } from 'srcs/server/calendars/schemas/calendar.schema';

// Load Olm for encryption
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Olm = require('olm/olm_legacy');
declare global {
	// eslint-disable-next-line no-var
	var Olm: unknown;
}
global.Olm = Olm;

logger.setLevel(logger.levels.ERROR);

export class MatrixProvider {
	constructor(private configService: ConfigService) {}

	matrixClient: matrix.MatrixClient;
	connected = false;

	async connect(): Promise<boolean> {
		if (this.connected) return true;

		// Check that env vars exists
		if (
			!this.configService.get('MATRIX_URL') ||
			!this.configService.get('MATRIX_TOKEN') ||
			!this.configService.get('MATRIX_USER')
		)
			return false;

		this.matrixClient = matrix.createClient({
			deviceId: 'Streaks Server',
			baseUrl: this.configService.get('MATRIX_URL'),
			accessToken: this.configService.get('MATRIX_TOKEN'),
			userId: this.configService.get('MATRIX_USER'),
		});

		await this.matrixClient.initCrypto();
		await this.matrixClient.startClient();

		await new Promise<void>((resolve) => {
			this.matrixClient.once(matrix.ClientEvent.Sync, () => {
				// Send encrypted message, even if some devices aren't trusted
				this.matrixClient.setGlobalErrorOnUnknownDevices(false);
				this.connected = true;
				resolve();
			});
		});

		return true;
	}

	async disconnect() {
		if (!this.connected) return;
		this.matrixClient.stopClient();
	}

	async sendMessage(roomID: string, message: string, htmlMessage = '') {
		await this.matrixClient.joinRoom(roomID);
		//await this.matrixClient.uploadKeys();
		if (htmlMessage != '')
			await this.matrixClient.sendHtmlMessage(
				roomID,
				message,
				htmlMessage,
			);
		else await this.matrixClient.sendTextMessage(roomID, message);
	}

	/**
	 * Send a reminder in the given room
	 * Don't send the reminder if the summary is empty or if every tasks are successful
	 *
	 * @param {string} roomID - The id of the room to send the message to.
	 * @param {CalendarNotificationSummary} sum - The summary, with every tasks, their name, state and current streaks
	 */
	async sendReminder(roomID: string, sum: CalendarNotificationSummary) {
		if (sum.length == 0) return;

		let message = `⏰ ${DateTime.now().toFormat(
			'HH:mm',
		)}, You still have work to do!`;
		let htmlMessage = `⏰ <strong>${DateTime.now().toFormat(
			'HH:mm',
		)}</strong>, You still have work to do!`;

		for (let s = 0; s < sum.length; s++) {
			if (sum[s].status == State.Fail) {
				message += `\n      🔴 ${sum[s].name}  ${sum[s].current_streak} 🔥`;
				htmlMessage += `<br>&emsp;&emsp;🔴 <strong>${sum[s].name}</strong>&ensp;${sum[s].current_streak} 🔥`;
			} else {
				message += `\n      🟢 ${sum[s].name}  ${sum[s].current_streak} 🔥`;
				htmlMessage += `<br>&emsp;&emsp;🟢 <strong>${sum[s].name}</strong>&ensp;${sum[s].current_streak} 🔥`;
			}
		}

		await this.sendMessage(roomID, message, htmlMessage);
	}

	/**
	 * Send a congratulation in the given room for the given calendar
	 *
	 * @param {string} roomID - The id of the room to send the message to.
	 * @param {Calendar} calendar - The calendar concerned by the congrats
	 */
	async sendCongratulation(roomID: string, calendar: RCalendar) {
		const message = `🟢 ${calendar.name?.toUpperCase()} {${
			calendar.current_streak
		}🔥}  Task completed!`;
		const htmlMessage = `🟢 <strong>${calendar.name?.toUpperCase()}</strong> {${
			calendar.current_streak
		}🔥}  Task completed!`;
		await this.sendMessage(roomID, message, htmlMessage);
	}

	/**
	 * Send the message "🎉 All the streaks are done!! 🎉"
	 * in the given room
	 *
	 * @param {string} roomID - The id of the room to send the message to.
	 */
	async sendDayDone(roomID: string) {
		const message = '🎉 All the streaks are done!! 🎉';
		const htmlMessage = '🎉 <strong>All the streaks are done!!</strong> 🎉';
		await this.sendMessage(roomID, message, htmlMessage);
	}
}
