import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Calendar, CalendarSchema } from '../calendars/schemas/calendar.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
	Progress,
	ProgressSchema,
} from '../progresses/schemas/progress.schema';
import { CalendarsModule } from '../calendars/calendars.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Calendar.name, schema: CalendarSchema },
			{ name: Progress.name, schema: ProgressSchema },
		]),
		UsersModule,
		CalendarsModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('AUTH_JWT_SECRET'),
				signOptions: {
					expiresIn: configService.get<number>('AUTH_JWT_EXPIRES'),
				},
			}),
			inject: [ConfigService],
		}),
	],
	providers: [NotificationsService],
	controllers: [NotificationsController],
	exports: [NotificationsService],
})
export class NotificationsModule {}
