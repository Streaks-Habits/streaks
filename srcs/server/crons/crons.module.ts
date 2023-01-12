import { Module } from '@nestjs/common';
import { CalendarsModule } from '../calendars/calendars.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CronsService } from './crons.service';

@Module({
	imports: [NotificationsModule, CalendarsModule],
	providers: [CronsService],
})
export class CronsModule {}
