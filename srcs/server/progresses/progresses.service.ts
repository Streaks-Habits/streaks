import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime, DateTimeUnit } from 'luxon';
import { Model, Types } from 'mongoose';
import { Role } from '../users/enum/roles.enum';
import { UserDoc } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { isValidObjectId } from '../utils';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { asProgressAccess, checkProgressAccess } from './progresses.utils';
import { Progress, ProgressDoc, RProgress } from './schemas/progress.schema';
import { RecurrenceUnit } from './enum/recurrence_unit.enum';

@Injectable()
export class ProgressesService {
	constructor(
		@InjectModel('Progress') private ProgressModel: Model<Progress>,
		private readonly usersService: UsersService,
	) {}

	fieldsToFetch = '';
	fieldsToReturn =
		'_id name user enabled recurrence_unit goal deadline current_progress';

	async create(
		requester: UserDoc,
		createProgressDto: CreateProgressDto,
		fields = this.fieldsToReturn,
	): Promise<RProgress> {
		// using getUser to check if user exists (will throw NotFoundException if not)
		const owner = await this.usersService.findOne(createProgressDto.user);

		// check that requester is the owner (except for admin)
		if (
			requester.role != Role.Admin &&
			owner._id.toString() != requester._id.toString()
		)
			throw new UnauthorizedException(
				'you are not allowed to create a progress for this user',
			);

		// create a new progress object with given parameters
		const createProgress: Progress = {
			name: createProgressDto.name,
			user: new Types.ObjectId(owner._id),
			enabled: createProgressDto.enabled,
			recurrence_unit: createProgressDto.recurrence_unit,
			goal: createProgressDto.goal,
		};

		const newProgress = (await new this.ProgressModel(
			createProgress,
		).save()) as unknown as ProgressDoc;

		return this.filterProgress(
			await this.addVirtualProps(newProgress, DateTime.now().toJSDate()),
			fields,
		);
	}

	async findAll(
		requester: UserDoc,
		dateQuery: string,
		fields = this.fieldsToReturn,
	): Promise<RProgress[]> {
		// Check given parameters
		let date = DateTime.now();
		if (dateQuery !== undefined) {
			date = DateTime.fromFormat(dateQuery, 'yyyy-MM-dd');
			if (!date.isValid)
				throw new BadRequestException(date.invalidExplanation);
		}

		const progresses = await this.ProgressModel.find({}, this.fieldsToFetch)
			.populate('user', this.usersService.defaultFields)
			.lean();

		// Add virtual props and filter
		const rProgresses: RProgress[] = [];
		for (const progress of progresses) {
			asProgressAccess(requester, progress);
			rProgresses.push(
				this.filterProgress(
					await this.addVirtualProps(progress, date.toJSDate()),
					fields,
				),
			);
		}

		return rProgresses;
	}

	async findAllForUser(
		requester: UserDoc,
		userId: string,
		dateQuery: string,
		fields = this.fieldsToReturn,
	): Promise<RProgress[]> {
		// Check given parameters
		if (!isValidObjectId(userId))
			throw new NotFoundException('User not found');

		let date = DateTime.now();
		if (dateQuery !== undefined) {
			date = DateTime.fromFormat(dateQuery, 'yyyy-MM-dd');
			if (!date.isValid)
				throw new BadRequestException(date.invalidExplanation);
		}

		// Get progresses
		const progresses = await this.ProgressModel.find(
			{ user: userId },
			this.fieldsToFetch,
		)
			.populate('user', this.usersService.defaultFields)
			.lean();

		if (!progresses || progresses.length == 0)
			throw new NotFoundException('No progresses found');

		// Add virtual props and filter
		const rProgresses: RProgress[] = [];
		for (const progress of progresses) {
			asProgressAccess(requester, progress);
			rProgresses.push(
				this.filterProgress(
					await this.addVirtualProps(progress, date.toJSDate()),
					fields,
				),
			);
		}

		return rProgresses;
	}

	async findOne(
		requester: UserDoc,
		progressId: string,
		dateQuery: string,
		fields = this.fieldsToReturn,
	): Promise<RProgress> {
		// Check given parameters
		if (!isValidObjectId(progressId))
			throw new NotFoundException('Progress not found');

		let date = DateTime.now();
		if (dateQuery !== undefined) {
			date = DateTime.fromFormat(dateQuery, 'yyyy-MM-dd');
			if (!date.isValid)
				throw new BadRequestException(date.invalidExplanation);
		}

		// Get progress
		const existingProgress = await this.ProgressModel.findById(
			progressId,
			this.fieldsToFetch,
		)
			.populate('user', this.usersService.defaultFields)
			.lean();
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		asProgressAccess(requester, existingProgress);

		// Add virtual props and filter
		return this.filterProgress(
			await this.addVirtualProps(existingProgress, date.toJSDate()),
			fields,
		);
	}

	async update(
		requester: UserDoc,
		progressId: string,
		updateProgressDto: UpdateProgressDto,
		fields = this.fieldsToReturn,
	): Promise<RProgress> {
		// Check given parameters
		if (!isValidObjectId(progressId))
			throw new NotFoundException('Progress not found');

		// check that requester is the owner (except for admin)
		await checkProgressAccess(requester, progressId, this.ProgressModel);

		// Create a new progress object with given parameters
		const updateProgress: Progress = {
			name: updateProgressDto.name,
			user: undefined,
			enabled: updateProgressDto.enabled,
			recurrence_unit: updateProgressDto.recurrence_unit,
			goal: updateProgressDto.goal,
		};
		if (updateProgressDto.user)
			// check that user exists (will throw NotFoundException if not)
			updateProgress.user = new Types.ObjectId(
				(await this.usersService.findOne(updateProgressDto.user))._id,
			);

		// Update progress with the new object
		const existingProgress = await this.ProgressModel.findByIdAndUpdate(
			progressId,
			updateProgress,
			{ new: true, fields: this.fieldsToFetch },
		)
			.populate('user', this.usersService.defaultFields)
			.lean();
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		// Add virtual props and filter
		return this.filterProgress(
			await this.addVirtualProps(
				existingProgress,
				DateTime.now().toJSDate(),
			),
			fields,
		);
	}

	async delete(
		requester: UserDoc,
		progressId: string,
		fields = this.fieldsToReturn,
	): Promise<RProgress> {
		// Check given parameters
		if (!isValidObjectId(progressId))
			throw new NotFoundException('Progress not found');

		// check that requester is the owner (except for admin)
		await checkProgressAccess(requester, progressId, this.ProgressModel);

		// Delete progress
		const deletedProgress = await this.ProgressModel.findByIdAndDelete(
			progressId,
			{ fields: this.fieldsToFetch },
		)
			.populate('user', this.usersService.defaultFields)
			.lean();
		if (!deletedProgress) throw new NotFoundException('Progress not found');

		// Add virtual props and filter
		return this.filterProgress(
			await this.addVirtualProps(
				deletedProgress,
				DateTime.now().toJSDate(),
			),
			fields,
		);
	}

	async addMeasure(
		requester: UserDoc,
		progressId: string,
		value: string,
		forDateQuery: string,
		fields = this.fieldsToReturn,
	): Promise<RProgress> {
		// Check given parameters
		if (!isValidObjectId(progressId))
			throw new NotFoundException('Progress not found');
		if (isNaN(Number(value)))
			throw new BadRequestException('value must be a number');

		let forDate = new Date();
		if (forDateQuery !== undefined) {
			const forDate_luxon = DateTime.fromISO(forDateQuery);
			if (!forDate_luxon.isValid)
				throw new BadRequestException(forDate_luxon.invalidExplanation);
			forDate = forDate_luxon.toJSDate();
		}

		// check that requester is the owner (except for admin)
		const progress = await checkProgressAccess(
			requester,
			progressId,
			this.ProgressModel,
			'enabled',
		);

		// Check that progress is enabled
		if (!progress.enabled)
			throw new BadRequestException('Progress is disabled');

		// Add measure
		const existingProgress = await this.ProgressModel.findByIdAndUpdate(
			progressId,
			{
				// (type of measures is: Map<string, number>)
				$set: { [`measures.${forDate.getTime()}`]: value },
			},
			{ new: true, fields: this.fieldsToFetch },
		)
			.populate('user', this.usersService.defaultFields)
			.lean();
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		// Add virtual props and filter
		return this.filterProgress(
			await this.addVirtualProps(
				existingProgress,
				DateTime.now().toJSDate(),
			),
			fields,
		);
	}

	async deleteMeasureRange(
		requester: UserDoc,
		progressId: string,
		fromDateQuery: string,
		toDateQuery: string,
		fields = this.fieldsToReturn,
	): Promise<RProgress> {
		// Check given parameters
		if (!isValidObjectId(progressId))
			throw new NotFoundException('Progress not found');

		if (fromDateQuery === undefined)
			throw new BadRequestException('?from query is required');
		if (toDateQuery === undefined)
			throw new BadRequestException('?to query is required');

		const fromDate_luxon = DateTime.fromISO(fromDateQuery);
		if (!fromDate_luxon.isValid)
			throw new BadRequestException(fromDate_luxon.invalidExplanation);
		const fromDate = fromDate_luxon.toJSDate();

		const toDate_luxon = DateTime.fromISO(toDateQuery);
		if (!toDate_luxon.isValid)
			throw new BadRequestException(toDate_luxon.invalidExplanation);
		const toDate = toDate_luxon.toJSDate();

		// check that requester is the owner (except for admin)
		const progress = await checkProgressAccess(
			requester,
			progressId,
			this.ProgressModel,
			'enabled',
		);

		// Check that progress is enabled
		if (!progress.enabled)
			throw new BadRequestException('Progress is disabled');

		// Delete measure range
		const existingProgress = await this.ProgressModel.findByIdAndUpdate(
			progressId,
			{
				$pull: {
					measures: {
						date: {
							$gte: fromDate,
							$lte: toDate,
						},
					},
				},
			},
			{ new: true, fields: this.fieldsToFetch },
		)
			.populate('user', this.usersService.defaultFields)
			.lean();
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		// Add virtual props and filter
		return this.filterProgress(
			await this.addVirtualProps(
				existingProgress,
				DateTime.now().toJSDate(),
			),
			fields,
		);
	}

	/**
	 * Compute the progress for a given date (current_progress and deadline)
	 *
	 * @param progress The just fetched progress
	 * @param date The date to compute the progress for
	 * @returns The computed progress (a combination of RProgress and ProgressDoc)
	 */
	async addVirtualProps(
		progress: ProgressDoc,
		date: Date,
	): Promise<RProgress & ProgressDoc> {
		const computed = {} as RProgress & ProgressDoc;

		const now = DateTime.fromJSDate(date);
		// slice(0, -2) to remove 'ly' from unit => 'yearly' -> 'year', 'monthly' -> 'month'
		const unit =
			progress.recurrence_unit == RecurrenceUnit.Daily
				? 'day'
				: progress.recurrence_unit.slice(0, -2);

		// Deadline
		computed['deadline'] = now.endOf(unit as DateTimeUnit).toJSDate();

		// Current progress
		if (progress.measures) {
			const start = now
				.startOf(unit as DateTimeUnit)
				.valueOf()
				.toString();
			const end = now
				.endOf(unit as DateTimeUnit)
				.valueOf()
				.toString();
			// Filter measures between start and end
			// We take timestamp as string because the keys of the map are strings
			computed['current_progress'] = Array.from(
				Object.entries(progress.measures),
			)
				.filter(([key]) => key >= start && key <= end)
				.reduce((acc, [, value]) => acc + value, 0);
		} else {
			computed['current_progress'] = 0;
		}

		return { ...progress, ...computed };
	}

	/**
	 * Filter an object to keep only the fileds of a RPogress
	 *
	 * @param progress The object to filter
	 * @returns The filtered object
	 * @see RPogress
	 */
	filterProgress(progress: any, fields = this.fieldsToReturn): RProgress {
		// Get keys of RProgress class
		const keys = fields.split(' ');

		console.log(keys, progress);

		const filtered = {} as RProgress;
		for (const key of Object.keys(progress)) {
			if (!keys.includes(key)) delete progress[key];
			// if (keys.includes(key)) filtered[key] = progress[key];
		}

		console.log(progress, filtered);

		return progress;
	}
}
