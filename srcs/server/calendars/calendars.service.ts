import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DateTime } from 'luxon';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { ICalendar } from './interface/calendar.interface';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { isValidObjectId } from '../utils';
import { UsersService } from '../users/users.service';
import { State } from './enum/state.enum';
import { Role } from '../users/enum/roles.enum';
import { IUser } from '../users/interface/user.interface';
import { asCalendarAccess, checkCalendarAccess } from './calendars.utils';

@Injectable()
export class CalendarsService {
	constructor(
		@InjectModel('Calendar') private CalendarModel: Model<ICalendar>,
		private readonly usersService: UsersService,
	) {}

	defaultFields = '_id name agenda current_streak streak_expended_today';

	async createCalendar(
		requester: IUser,
		createCalendarDto: CreateCalendarDto,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// using getUser to check if user exists (will throw NotFoundException if not)
		const owner = await this.usersService.findOne(createCalendarDto.user);

		// check that requester is the owner (except for admin)
		if (
			requester.role != Role.Admin &&
			owner._id.toString() != requester._id.toString()
		)
			throw new UnauthorizedException(
				'you are not allowed to create a calendar for this user',
			);

		// create a new calendar object with given parameters
		const createCalendar: Omit<ICalendar, '_id'> = {
			name: createCalendarDto.name,
			user: new Types.ObjectId(owner._id),
		};

		const newCalendar = await new this.CalendarModel(createCalendar).save();
		// return getCalendar instead of newCalendar to apply fields selection
		return this.getCalendar(requester, newCalendar._id.toString(), fields);
	}

	async updateCalendar(
		requester: IUser,
		calendarId: string,
		updateCalendarDto: UpdateCalendarDto,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

		// Create a new calendar object with given parameters
		const updateCalendar: Omit<ICalendar, '_id'> = {
			name: updateCalendarDto.name,
			user: undefined,
		};
		if (updateCalendarDto.user)
			// using getUser to check if user exists (will throw NotFoundException if not)
			updateCalendar.user = new Types.ObjectId(
				(await this.usersService.findOne(updateCalendarDto.user))._id,
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

	async getUserCalendars(
		requester: IUser,
		userId: string,
		fields = this.defaultFields,
	): Promise<ICalendar[]> {
		const calendarsData = await this.CalendarModel.find(
			{
				user: userId,
			},
			fields + ' user',
		);
		if (!calendarsData || calendarsData.length == 0)
			throw new NotFoundException('No calendars found');

		for (const calendar of calendarsData)
			asCalendarAccess(requester, calendar);
		return calendarsData;
	}

	async getCalendar(
		requester: IUser,
		calendarId: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// Get calendar
		const existingCalendar = await this.CalendarModel.findById(
			calendarId,
			fields + ' user',
		);
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');

		// check that creator is the owner (except for admin)
		asCalendarAccess(requester, existingCalendar);

		existingCalendar.user = undefined; // remove user from calendar
		return existingCalendar;
	}

	async deleteCalendar(
		requester: IUser,
		calendarId: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

		// Delete calendar
		const deletedCalendar = await this.CalendarModel.findByIdAndDelete(
			calendarId,
		).select(fields);
		if (!deletedCalendar) throw new NotFoundException('Calendar not found');
		return deletedCalendar;
	}

	async setState(
		requester: IUser,
		calendarId: string,
		dateString: string,
		state: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

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

		// Update streak count
		const streakUpdated = await this.computeStreak(
			requester,
			calendarId,
			fields,
		);

		// Return updated state
		return {
			...streakUpdated['_doc'],
			days: {
				[dateString]: state,
			},
		};
	}

	async getMonth(
		requester: IUser,
		calendarId: string,
		monthString: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

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

		return existingCalendar;
	}

	async computeStreak(
		requester: IUser,
		calendarId: string,
		fields = this.defaultFields,
	): Promise<ICalendar> {
		// Check given parameters
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

		// Get the calendar
		const existingCalendar = await this.CalendarModel.findById(
			calendarId,
			'days',
		);
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');

		// Compute streak
		let streak = 0;
		const streak_expended_today =
			existingCalendar.days.get(DateTime.now().toISODate()) ===
			State.Success;
		let yesterday = DateTime.now().minus({ days: 1 }).startOf('day');

		let continueWhile = true;
		while (continueWhile) {
			const currentSate = existingCalendar.days.get(
				yesterday.toISODate(),
			);
			if (currentSate === State.Success) {
				streak++;
			} else if (
				currentSate !== State.Freeze &&
				currentSate !== State.Breakday
			)
				continueWhile = false;

			yesterday = yesterday.minus({ days: 1 });
		}
		if (streak_expended_today) streak++;

		// Update calendar
		const updatedCalendar = await this.CalendarModel.findByIdAndUpdate(
			calendarId,
			{
				$set: {
					current_streak: streak,
					streak_expended_today: streak_expended_today,
				},
			},
			{ new: true, fields: fields },
		);
		if (!updatedCalendar) throw new NotFoundException('Calendar not found');

		return updatedCalendar;
	}
}
