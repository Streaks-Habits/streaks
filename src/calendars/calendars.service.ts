import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { ICalendar } from './interface/calendar.interface';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { isValidObjectId } from 'src/utils';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CalendarsService {
	constructor(
		@InjectModel('Calendar') private CalendarModel: Model<ICalendar>,
		private readonly usersService: UsersService,
	) {}

	defaultFields = '_id name agenda days';

	async createCalendar(
		createCalendarDto: CreateCalendarDto,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// using getUser to check if user exists (will throw NotFoundException if not)
		const owner = await this.usersService.getUser(createCalendarDto.user);

		const createCalendar: Omit<ICalendar, '_id'> = {
			name: createCalendarDto.name,
			user: new Types.ObjectId(owner._id),
		};

		const newCalendar = await new this.CalendarModel(createCalendar).save();
		// return getCalendar instead of newCalendar to apply fields selection
		return this.getCalendar(newCalendar._id.toString(), fields);
	}

	async updateCalendar(
		calendarId: string,
		updateCalendarDto: UpdateCalendarDto,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		const updateCalendar: Omit<ICalendar, '_id'> = {
			name: updateCalendarDto.name,
			user: undefined,
		};
		if (updateCalendarDto.user)
			// using getUser to check if user exists (will throw NotFoundException if not)
			updateCalendar.user = new Types.ObjectId(
				(await this.usersService.getUser(updateCalendarDto.user))._id,
			);

		const existingCalendar = await this.CalendarModel.findByIdAndUpdate(
			calendarId,
			updateCalendar,
			{ new: true, fields: fields },
		);
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');
		return existingCalendar;
	}

	async getAllCalendars(fields = this.defaultFields): Promise<ICalendar[]> {
		const calendarsData = await this.CalendarModel.find(
			{},
			fields,
		).populate('user', this.usersService.defaultFields);
		if (!calendarsData || calendarsData.length == 0) {
			throw new NotFoundException('No calendars found');
		}
		return calendarsData;
	}

	async getCalendar(
		calendarId: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');
		const existingCalendar = await this.CalendarModel.findById(
			calendarId,
			fields,
		).populate('user', this.usersService.defaultFields);
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');
		return existingCalendar;
	}

	async deleteCalendar(
		calendarId: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');
		const deletedCalendar = await this.CalendarModel.findByIdAndDelete(
			calendarId,
			{ fields: fields },
		);
		if (!deletedCalendar) throw new NotFoundException('Calendar not found');
		return deletedCalendar;
	}
}
