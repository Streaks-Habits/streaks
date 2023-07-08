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
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { isValidObjectId } from '../utils';
import { UsersService } from '../users/users.service';
import { State } from './enum/state.enum';
import { Role } from '../users/enum/roles.enum';
import { asCalendarAccess, checkCalendarAccess } from './calendars.utils';
import { Calendar, RCalendar } from './schemas/calendar.schema';
import { UserDoc } from '../users/schemas/user.schema';

@Injectable()
export class CalendarsService {
	constructor(
		@InjectModel('Calendar') private CalendarModel: Model<Calendar>,
		private readonly usersService: UsersService,
	) {}

	defaultFields = '_id name enabled agenda notifications';

	async create(
		requester: UserDoc,
		createCalendarDto: CreateCalendarDto,
		fields = this.defaultFields,
	): Promise<RCalendar> {
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
		const createCalendar: Calendar = {
			name: createCalendarDto.name,
			user: new Types.ObjectId(owner._id),
			enabled: createCalendarDto.enabled,
			agenda: createCalendarDto.agenda,
			notifications: createCalendarDto.notifications,
		};

		const newCalendar = await new this.CalendarModel(createCalendar).save();
		// return getCalendar instead of newCalendar to apply fields selection
		return this.findOne(requester, newCalendar._id.toString(), fields);
	}

	async findAll(
		requester: UserDoc,
		fields = this.defaultFields,
	): Promise<RCalendar[]> {
		const calendarsData = (await this.CalendarModel.find({}, fields)
			.populate('user', this.usersService.defaultFields)
			.lean()) as RCalendar[];

		for (const calendar of calendarsData) {
			// Compute streak
			const streakUpdated = await this.computeStreak(
				requester,
				calendar._id.toString(),
			);
			calendar.current_streak = streakUpdated.current_streak;
			calendar.streak_expended_today =
				streakUpdated.streak_expended_today;
		}

		return calendarsData;
	}

	async findAllForUser(
		requester: UserDoc,
		userId: string,
		fields = this.defaultFields,
	): Promise<RCalendar[]> {
		const calendarsData = (await this.CalendarModel.find(
			{
				user: userId,
			},
			fields + ' user',
		)
			.populate('user', this.usersService.defaultFields)
			.lean()) as RCalendar[];
		if (!calendarsData || calendarsData.length == 0)
			throw new NotFoundException('No calendars found');

		for (const calendar of calendarsData) {
			// Compute streak
			const streakUpdated = await this.computeStreak(
				requester,
				calendar._id.toString(),
			);
			calendar.current_streak = streakUpdated.current_streak;
			calendar.streak_expended_today =
				streakUpdated.streak_expended_today;
		}
		return calendarsData;
	}

	async findOne(
		requester: UserDoc,
		calendarId: string,
		fields = this.defaultFields,
	): Promise<RCalendar> {
		// Check given parameters
		calendarId = calendarId.toString().trim();
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// Get calendar
		const existingCalendar = (await this.CalendarModel.findById(
			calendarId,
			fields + ' user',
		)
			.populate('user', this.usersService.defaultFields)
			.lean()) as RCalendar;
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');

		// check that creator is the owner (except for admin)
		asCalendarAccess(requester, existingCalendar);

		// Compute streak
		const streakUpdated = await this.computeStreak(requester, calendarId);
		existingCalendar.current_streak = streakUpdated.current_streak;
		existingCalendar.streak_expended_today =
			streakUpdated.streak_expended_today;

		return existingCalendar;
	}

	async update(
		requester: UserDoc,
		calendarId: string,
		updateCalendarDto: UpdateCalendarDto,
		fields = this.defaultFields,
	): Promise<RCalendar> {
		// Check given parameters
		calendarId = calendarId.toString().trim();
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

		// Create a new calendar object with given parameters
		const updateCalendar: Calendar = {
			name: updateCalendarDto.name,
			user: undefined,
			enabled: updateCalendarDto.enabled,
			agenda: updateCalendarDto.agenda,
			notifications: updateCalendarDto.notifications,
		};
		if (updateCalendarDto.user)
			// using getUser to check if user exists (will throw NotFoundException if not)
			updateCalendar.user = new Types.ObjectId(
				(await this.usersService.findOne(updateCalendarDto.user))._id,
			);

		// Update calendar with the new object
		const existingCalendar = (await this.CalendarModel.findByIdAndUpdate(
			calendarId,
			updateCalendar,
			{ new: true, fields: fields },
		)
			.populate('user', this.usersService.defaultFields)
			.lean()) as RCalendar;
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');

		// Compute streak
		const streakUpdated = await this.computeStreak(requester, calendarId);
		existingCalendar.current_streak = streakUpdated.current_streak;
		existingCalendar.streak_expended_today =
			streakUpdated.streak_expended_today;

		return existingCalendar;
	}

	async delete(
		requester: UserDoc,
		calendarId: string,
		fields = this.defaultFields,
	): Promise<RCalendar> {
		// Check given parameters
		calendarId = calendarId.toString().trim();
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

		// Delete calendar
		const deletedCalendar = (await this.CalendarModel.findByIdAndDelete(
			calendarId,
		)
			.select(fields)
			.populate('user', this.usersService.defaultFields)
			.lean()) as RCalendar;
		if (!deletedCalendar) throw new NotFoundException('Calendar not found');
		return deletedCalendar;
	}

	async setState(
		requester: UserDoc,
		calendarId: string,
		state: string,
		forQuery: string,
		fields = this.defaultFields,
	): Promise<RCalendar> {
		// Check given parameters
		calendarId = calendarId.toString().trim();
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		const calendar = await checkCalendarAccess(
			requester,
			calendarId,
			this.CalendarModel,
			'enabled',
		);

		// Check that the calendar is enabled
		if (!calendar.enabled)
			throw new BadRequestException('calendar is disabled');

		// Check that the date is valid
		let date = DateTime.now();
		if (forQuery !== undefined) {
			date = DateTime.fromFormat(forQuery, 'yyyy-MM-dd');
			if (!date.isValid)
				throw new BadRequestException(date.invalidExplanation);
			if (date.startOf('day') > DateTime.now().startOf('day'))
				throw new BadRequestException(
					"can't set state for future dates",
				);
		} else forQuery = date.toFormat('yyyy-MM-dd');

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
		).populate('user', this.usersService.defaultFields);
		if (!updatedCalendar) throw new NotFoundException('Calendar not found');

		// Update streak count
		const streakUpdated = await this.computeStreak(requester, calendarId);

		// Return updated state
		return {
			...updatedCalendar['_doc'],
			current_streak: streakUpdated.current_streak,
			streak_expended_today: streakUpdated.streak_expended_today,
			days: {
				[forQuery]: state,
			},
		};
	}

	async getMonth(
		requester: UserDoc,
		calendarId: string,
		monthQuery: string,
		fields = this.defaultFields,
	): Promise<RCalendar> {
		// Check given parameters
		calendarId = calendarId.toString().trim();
		if (!isValidObjectId(calendarId))
			throw new NotFoundException('Calendar not found');

		// check that requester is the owner (except for admin)
		await checkCalendarAccess(requester, calendarId, this.CalendarModel);

		// Check that the month is valid
		let month = DateTime.now();
		if (monthQuery !== undefined) {
			month = DateTime.fromFormat(monthQuery, 'yyyy-MM');
			if (!month.isValid)
				throw new BadRequestException(month.invalidExplanation);
			if (month.endOf('month') > DateTime.now().endOf('month'))
				throw new BadRequestException(
					"can't get data of future months",
				);
		}

		// Create a fields string to select only the days of the given month
		let daysFields = '';
		const last_day = month.endOf('month');
		let current_day = month.startOf('month');

		while (current_day < last_day) {
			daysFields += ` days.${current_day.toISODate()}`;
			current_day = current_day.plus({ days: 1 });
		}

		// Get the calendar (with previously created fields string)
		const existingCalendar = (await this.CalendarModel.findById(
			calendarId,
			fields + daysFields,
		)
			.populate('user', this.usersService.defaultFields)
			.lean()) as RCalendar;
		if (!existingCalendar)
			throw new NotFoundException('Calendar not found');

		// Compute streak
		const streakUpdated = await this.computeStreak(requester, calendarId);
		existingCalendar.current_streak = streakUpdated.current_streak;
		existingCalendar.streak_expended_today =
			streakUpdated.streak_expended_today;

		return existingCalendar;
	}

	async computeStreak(
		requester: UserDoc,
		calendarId: string,
	): Promise<{ current_streak: number; streak_expended_today: boolean }> {
		// Check given parameters
		calendarId = calendarId.toString().trim();
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
		if (existingCalendar.days === undefined) {
			return {
				current_streak: 0,
				streak_expended_today: false,
			};
		}

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

		return {
			current_streak: streak,
			streak_expended_today,
		};
	}
}
