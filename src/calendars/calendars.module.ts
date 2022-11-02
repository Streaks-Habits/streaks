import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { Calendar, CalendarSchema } from './schemas/calendar.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Calendar.name, schema: CalendarSchema },
		]),
		UsersModule,
	],
	controllers: [CalendarsController],
	providers: [CalendarsService],
	exports: [CalendarsService],
})
export class CalendarsModule {}
