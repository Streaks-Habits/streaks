import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Put,
	HttpStatus,
	Request,
	Res,
	UseGuards,
	Query,
	UseInterceptors,
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	HttpCode,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProgressesService } from './progresses.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { MultiAuthGuard } from '../auth/guard/multi-auth.guard';
import { Role } from '../users/enum/roles.enum';
import { Roles } from '../auth/decorator/roles.decorator';
import { RProgress } from './schemas/progress.schema';
import { RefreshJwtGuard } from '../auth/guard/refresh-jwt.guard';
import { Observable, map } from 'rxjs';

@Controller('/api/v1/progresses')
export class ProgressesController {
	constructor(private readonly progressesService: ProgressesService) {}

	/*
	 * CREATE
	 */
	@Post()
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	// User allowed, will check after that user can only create a progress for himself
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({ summary: 'Create a progress' })
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiCreatedResponse({
		type: RProgress,
		description: 'The created progress',
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized, you can't create a progress for this user.",
	})
	@ApiBadRequestResponse({
		description:
			'Bad request, one or more data is badly formatted / missing.',
	})
	// #endregion doc
	async create(
		@Res() response,
		@Request() request,
		@Body() createProgressDto: CreateProgressDto,
	) {
		return response
			.status(HttpStatus.CREATED)
			.send(
				await this.progressesService.create(
					request.user,
					createProgressDto,
				),
			);
	}

	/*
	 * READ ALL
	 */
	@Get()
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({ summary: 'Get all progresses, from every users' })
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiQuery({
		name: 'date',
		type: String,
		required: false,
		description:
			'The date on which the progress will be calculated. Maybe any date in the range. Default: now. Format: YYYY-MM-DD',
	})
	@ApiOkResponse({
		type: RProgress,
		isArray: true,
		description: 'A list of every progresses',
	})
	@ApiUnauthorizedResponse({
		description: 'Unauthorized, you are not an administrator.',
	})
	@ApiBadRequestResponse({
		description: 'Bad request, the date is not in the correct format.',
	})
	// #endregion doc
	async findAll(
		@Res() response,
		@Request() request,
		@Query('date') date: string, // YYYY-MM-DD
	) {
		return response
			.status(HttpStatus.OK)
			.send(await this.progressesService.findAll(request.user, date));
	}

	/*
	 * READ ALL FOR USER
	 */
	@Get('/user/:user_id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	// User allowed, will check after that user can only get his own progresses
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({ summary: 'Get every progresses of a user' })
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiParam({
		name: 'user_id',
		type: String,
		required: true,
		description: 'The id of the user',
	})
	@ApiQuery({
		name: 'date',
		type: String,
		required: false,
		description:
			'The date on which the progress will be calculated. Maybe any date in the range. Default: now. Format: YYYY-MM-DD',
	})
	@ApiOkResponse({
		type: RProgress,
		isArray: true,
		description: "A list of user's progresses",
	})
	@ApiUnauthorizedResponse({
		description: "Unauthorized, you can't access these progresses.",
	})
	@ApiBadRequestResponse({
		description: 'Bad request, the date is not in the correct format.',
	})
	// #endregion doc
	async findAllForUser(
		@Request() request,
		@Param('user_id') userId: string,
		@Query('date') date: string, // YYYY-MM-DD
	) {
		return await this.progressesService.findAllForUser(
			request.user,
			userId,
			date,
		);
	}

	/*
	 * READ ONE
	 */
	@Get(':progress_id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	// User allowed, will check after that user can only get his own progress
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({ summary: 'Get a progress' })
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiParam({
		name: 'progress_id',
		type: String,
		required: true,
		description: 'The id of the progress',
	})
	@ApiQuery({
		name: 'date',
		type: String,
		required: false,
		description:
			'The date on which the progress will be calculated. Maybe any date in the range. Default: now. Format: YYYY-MM-DD',
	})
	@ApiOkResponse({ type: RProgress, description: 'The progress' })
	@ApiUnauthorizedResponse({
		description: "Unauthorized, you can't access this progress.",
	})
	@ApiBadRequestResponse({
		description: 'Bad request, the date is not in the correct format.',
	})
	// #endregion doc
	async findOne(
		@Res() response,
		@Request() request,
		@Param('progress_id') progressId: string,
		@Query('date') date: string, // YYYY-MM-DD
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.progressesService.findOne(
					request.user,
					progressId,
					date,
				),
			);
	}

	/*
	 * UPDATE
	 */
	@Put(':progress_id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	// User allowed, will check after that user can only update his own progress
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({ summary: 'Update a progress' })
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiParam({
		name: 'progress_id',
		type: String,
		required: true,
		description: 'The id of the progress',
	})
	@ApiOkResponse({ type: RProgress, description: 'The updated progress' })
	@ApiUnauthorizedResponse({
		description: "Unauthorized, you can't update this progress.",
	})
	@ApiBadRequestResponse({
		description:
			'Bad request, one or more data is badly formatted / missing.',
	})
	// #endregion doc
	async update(
		@Res() response,
		@Request() request,
		@Param('progress_id') progressId: string,
		@Body() updateProgressDto: UpdateProgressDto,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.progressesService.update(
					request.user,
					progressId,
					updateProgressDto,
				),
			);
	}

	/*
	 * DELETE
	 */
	@Delete(':progress_id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	// User allowed, will check after that user can only delete his own progress
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({ summary: 'Delete a progress' })
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiParam({
		name: 'progress_id',
		type: String,
		required: true,
		description: 'The id of the progress',
	})
	@ApiOkResponse({ type: RProgress, description: 'The deleted progress' })
	@ApiUnauthorizedResponse({
		description: "Unauthorized, you can't delete this progress.",
	})
	@ApiBadRequestResponse({
		description:
			'Bad request, one or more data is badly formatted / missing.',
	})
	// #endregion doc
	async delete(
		@Res() response,
		@Request() request,
		@Param('progress_id') progressId: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.progressesService.delete(request.user, progressId),
			);
	}

	/*
	 * ADD MEASURE
	 */
	@Put('/measures/:progress_id/:measure')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	// User allowed, will check after that user can only add a measure to his own progress
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({ summary: 'Add a measure to a progress' })
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiParam({
		name: 'progress_id',
		type: String,
		required: true,
		description: 'The id of the progress',
	})
	@ApiParam({
		name: 'measure',
		type: Number,
		required: true,
		description: 'The mesure to add, may be positive or negative.',
	})
	@ApiQuery({
		name: 'for',
		type: String,
		required: false,
		description:
			'The date of the measure to be added. Default: now. Format: ISO Date, e.g. 2023-01-10T17:23:04.759Z',
	})
	@ApiOkResponse({ type: RProgress, description: 'The updated progress' })
	@ApiUnauthorizedResponse({
		description: "Unauthorized, you can't add measure to this progress.",
	})
	@ApiBadRequestResponse({
		description:
			'Bad request, one or more data is badly formatted / missing.',
	})
	// #endregion doc
	async addMeasure(
		@Res() response,
		@Request() request,
		@Param('progress_id') progressId: string,
		@Param('measure') value: string,
		@Query('for') forDate: string, // ISO Date, e.g. 2023-01-09T14:09:03.769Z
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.progressesService.addMeasure(
					request.user,
					progressId,
					value,
					forDate,
				),
			);
	}

	/*
	 * DELETE MEASURES
	 */
	@Delete('/measures/:progress_id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	// User allowed, will check after that user can only add a measure to his own progress
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Progresses')
	@ApiOperation({
		summary: 'Delete every measure in a time range for a progress',
	})
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiParam({
		name: 'progress_id',
		type: String,
		required: true,
		description: 'The id of the progress',
	})
	@ApiQuery({
		name: 'from',
		type: String,
		required: true,
		description:
			'The start date of the range. Format: ISO Date, e.g. 2023-01-01T00:00:00.000Z',
	})
	@ApiQuery({
		name: 'to',
		type: String,
		required: true,
		description:
			'The end date of the range. Format: ISO Date, e.g. 2023-01-31T00:00:00.000Z',
	})
	@ApiOkResponse({ type: RProgress, description: 'The updated progress' })
	@ApiUnauthorizedResponse({
		description: "Unauthorized, you can't add measure to this progress.",
	})
	@ApiBadRequestResponse({
		description:
			'Bad request, one or more data is badly formatted / missing.',
	})
	// #endregion doc
	async deleteMeasureRange(
		@Res() response,
		@Request() request,
		@Param('progress_id') progressId: string,
		@Query('from') fromDateQuery: string, // ISO Date, e.g. 2023-01-09T14:09:03.769Z
		@Query('to') toDateQuery: string, // ISO Date, e.g. 2023-01-09T14:09:03.769Z
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.progressesService.deleteMeasureRange(
					request.user,
					progressId,
					fromDateQuery,
					toDateQuery,
				),
			);
	}
}
