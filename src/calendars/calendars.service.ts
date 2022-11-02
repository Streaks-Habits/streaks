import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DateTime } from 'luxon';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { ICalendar } from './interface/calendar.interface';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { isValidObjectId, sortMapByKeys } from 'src/utils';
import { UsersService } from 'src/users/users.service';
import { State } from './enum/state.enum';

@Injectable()
export class CalendarsService {
	constructor(
		@InjectModel('Calendar') private CalendarModel: Model<ICalendar>,
		private readonly usersService: UsersService,
	) {}

	defaultFields = '_id name agenda';

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
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// Create a new calendar object with given parameters
		const updateCalendar: Omit<ICalendar, '_id'> = {
			name: updateCalendarDto.name,
			user: undefined,
		};
		if (updateCalendarDto.user)
			// using getUser to check if user exists (will throw NotFoundException if not)
			updateCalendar.user = new Types.ObjectId(
				(await this.usersService.getUser(updateCalendarDto.user))._id,
			);

		// Update calendar with the new object
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
		if (!calendarsData || calendarsData.length == 0)
			throw new NotFoundException('No calendars found');
		return calendarsData;
	}

	async getCalendar(
		calendarId: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');
		// Get calendar
		const existingCalendar = await this.CalendarModel.findById(
			calendarId,
			fields,
		);
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');
		return existingCalendar;
	}

	async deleteCalendar(
		calendarId: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');
		// Delete calendar
		const deletedCalendar = await this.CalendarModel.findByIdAndDelete(
			calendarId,
			{ fields: fields },
		);
		if (!deletedCalendar) throw new NotFoundException('Calendar not found');
		return deletedCalendar;
	}

	async setState(
		calendarId: string,
		dateString: string,
		state: string,
		fields = this.defaultFields,
	): Promise<{ [d: string]: string }> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		const date = DateTime.fromFormat(dateString, 'yyyy-MM-dd');
		if (!date.isValid)
			throw new BadRequestException(date.invalidExplanation);
		if (date.startOf('day') > DateTime.now().startOf('day'))
			throw new BadRequestException("can't set state for future dates");

		if (!Object.values(State).includes(state as State))
			throw new BadRequestException(
				`state must be one of the following values: ${Object.values(
					State,
				).join(', ')}`,
			);

		// Update calendar with given state
		const updatedCalendar = await this.CalendarModel.findByIdAndUpdate(
			calendarId,
			{ $set: { [`days.${date.startOf('day').toISODate()}`]: state } },
			{ new: true, fields: fields },
		);
		if (!updatedCalendar) throw new NotFoundException('Calendar not found');

		// Return updated state
		return { [date.startOf('day').toISODate()]: state };
	}

	async getMonth(
		calendarId: string,
		monthString: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		const month = DateTime.fromFormat(monthString, 'yyyy-MM');
		if (!month.isValid)
			throw new BadRequestException(month.invalidExplanation);
		if (month.endOf('month') > DateTime.now().endOf('month'))
			throw new BadRequestException("can't get data of future months");

		// Create a fields string to select only the days of the given month
		let daysFields = '';
		const last_day = month.endOf('month');
		let current_day = month.startOf('month');

		while (current_day < last_day) {
			daysFields += ` days.${current_day.toISODate()}`;
			current_day = current_day.plus({ days: 1 });
		}

		// Get the calendar (with previously created fields string)
		const existingCalendar = await this.CalendarModel.findById(
			calendarId,
			fields + daysFields,
		);
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');

		// Sort the days by date
		existingCalendar.days = sortMapByKeys(
			existingCalendar.days,
		) as ICalendar['days'];
		return existingCalendar;
	}
}
