import { Module } from '@nestjs/common';
import { CalendarsModule } from '../calendars/calendars.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CronsService } from './crons.service';
import { UsersModule } from '../users/users.module';
import { ProgressesModule } from '../progresses/progresses.module';

@Module({
	imports: [
		NotificationsModule,
		CalendarsModule,
		UsersModule,
		ProgressesModule,
	],
	providers: [CronsService],
})
export class CronsModule {}
