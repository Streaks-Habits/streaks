import {
	Controller,
	Get,
	HttpStatus,
	Param,
	Res,
	UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorator/roles.decorator';
import { MultiAuthGuard } from '../auth/guard/multi-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Role } from '../users/enum/roles.enum';
import { NotificationsService } from './notifications.service';
import { RefreshJwtGuard } from '../auth/guard/refresh-jwt.guard';

@Controller('/api/v1/notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	/*
	 * SEND REMINDERS
	 */
	@Get('/send')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	async sendNotifications(@Res() response) {
		return response
			.status(HttpStatus.OK)
			.send(await this.notificationsService.sendReminders());
	}

	/*
	 * SEND REMINDER TO ONE USER
	 */
	@Get('/send/:user_id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	async sendNotificationsToUser(
		@Res() response,
		@Param('user_id') user_id: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(await this.notificationsService.sendReminder(user_id));
	}

	/*
	 * SEND A CONGRATULATION TO ONE USER
	 */
	@Get('/congrats/:calendar_id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	async sendCongrat(
		@Res() response,
		@Param('calendar_id') calendar_id: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(await this.notificationsService.sendCongrat(calendar_id));
	}
}
