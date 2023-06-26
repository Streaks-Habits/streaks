import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { Calendar, CalendarSchema } from './schemas/calendar.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Calendar.name, schema: CalendarSchema },
		]),
		UsersModule,
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
	controllers: [CalendarsController],
	providers: [CalendarsService],
	exports: [CalendarsService],
})
export class CalendarsModule {}
