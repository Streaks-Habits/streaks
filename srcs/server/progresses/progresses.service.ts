import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { Model, Types } from 'mongoose';
import { Role } from '../users/enum/roles.enum';
import { UserDoc } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { isValidObjectId } from '../utils';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { asProgressAccess, checkProgressAccess } from './progresses.utils';
import { Progress, RProgress } from './schemas/progress.schema';

@Injectable()
export class ProgressesService {
	constructor(
		@InjectModel('Progress') private ProgressModel: Model<Progress>,
		private readonly usersService: UsersService,
	) {}

	defaultFields =
		'_id name enabled recurrence recurrence_unit goal measures deadline current_progress';

	async create(
		requester: UserDoc,
		createProgressDto: CreateProgressDto,
		fields = this.defaultFields,
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

		const newProgress = await new this.ProgressModel(createProgress).save();
		// return findOne() instead of newProgress to apply fields selection
		// and compute virtual properties
		return this.findOne(
			requester,
			newProgress._id.toString(),
			undefined, // dateQuery
			fields,
		);
	}

	async findAll(
		requester: UserDoc,
		dateQuery: string,
		fields = this.defaultFields,
	): Promise<RProgress[]> {
		// Check given parameters
		let date = DateTime.now();
		if (dateQuery !== undefined) {
			date = DateTime.fromFormat(dateQuery, 'yyyy-MM-dd');
			if (!date.isValid)
				throw new BadRequestException(date.invalidExplanation);
		}

		const progresses = (await this.ProgressModel.find({}, fields).populate(
			'user',
			this.usersService.defaultFields,
		)) as RProgress[];

		return progresses;
	}

	async findAllForUser(
		requester: UserDoc,
		userId: string,
		dateQuery: string,
		fields = this.defaultFields,
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
		const progresses = (await this.ProgressModel.find(
			{ user: userId },
			fields,
		).populate('user', this.usersService.defaultFields)) as RProgress[];
		if (!progresses || progresses.length == 0)
			throw new NotFoundException('No progresses found');
		return progresses;
	}

	async findOne(
		requester: UserDoc,
		progressId: string,
		dateQuery: string,
		fields = this.defaultFields,
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
		const existingProgress = (await this.ProgressModel.findById(
			progressId,
			fields + ' user',
		).populate('user', this.usersService.defaultFields)) as RProgress;
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		// check that creator is the owner (except for admin)
		asProgressAccess(requester, existingProgress);

		return existingProgress;
	}

	async update(
		requester: UserDoc,
		progressId: string,
		updateProgressDto: UpdateProgressDto,
		fields = this.defaultFields,
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
		const existingProgress = (await this.ProgressModel.findByIdAndUpdate(
			progressId,
			updateProgress,
			{ new: true, fields: fields },
		).populate('user', this.usersService.defaultFields)) as RProgress;
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		return existingProgress;
	}

	async delete(
		requester: UserDoc,
		progressId: string,
		fields = this.defaultFields,
	): Promise<RProgress> {
		// Check given parameters
		if (!isValidObjectId(progressId))
			throw new NotFoundException('Progress not found');

		// check that requester is the owner (except for admin)
		await checkProgressAccess(requester, progressId, this.ProgressModel);

		// Delete progress
		const deletedProgress = (await this.ProgressModel.findByIdAndDelete(
			progressId,
			{ fields: fields },
		).populate('user', this.usersService.defaultFields)) as RProgress;
		if (!deletedProgress) throw new NotFoundException('Progress not found');
		return deletedProgress;
	}

	async addMeasure(
		requester: UserDoc,
		progressId: string,
		value: string,
		forDateQuery: string,
		fields = this.defaultFields,
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
		const existingProgress = (await this.ProgressModel.findByIdAndUpdate(
			progressId,
			{
				// (type of measures is: Map<string, number>)
				$set: { [`measures.${forDate.getTime()}`]: value },
			},
			{ new: true, fields: fields },
		).populate('user', this.usersService.defaultFields)) as RProgress;
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		return existingProgress;
	}

	async deleteMeasureRange(
		requester: UserDoc,
		progressId: string,
		fromDateQuery: string,
		toDateQuery: string,
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
		const existingProgress = (await this.ProgressModel.findByIdAndUpdate(
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
			{ new: true, fields: this.defaultFields },
		).populate('user', this.usersService.defaultFields)) as RProgress;
		if (!existingProgress)
			throw new NotFoundException('Progress not found');

		return existingProgress;
	}
}
