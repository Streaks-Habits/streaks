import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	Request,
	Res,
	UseGuards,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiHeader,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { Role } from '../users/enum/roles.enum';
import { CalendarsService } from './calendars.service';
import { MultiAuthGuard } from '../auth/guard/multi-auth.guard';

@Controller('/api/v1/calendars')
export class CalendarsController {
	constructor(private readonly calendarsService: CalendarsService) {}

	/*
	 * CREATE
	 */
	@Post()
	@UseGuards(MultiAuthGuard, RolesGuard)
	// User allowed, will check after that user can only create a calendar for himself
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiCreatedResponse({
		description: 'The created calendar',
	})
	// #endregion doc
	async create(
		@Res() response,
		@Request() request,
		@Body() createCalendarDto: CreateCalendarDto,
	) {
		return response
			.status(HttpStatus.CREATED)
			.send(
				await this.calendarsService.create(
					request.user,
					createCalendarDto,
				),
			);
	}

	/*
	 * READ ALL
	 */
	@Get()
	@UseGuards(MultiAuthGuard, RolesGuard)
	@Roles(Role.Admin)
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'All calendars',
		isArray: true,
	})
	// #endregion doc
	async findAll(@Res() response, @Request() request) {
		return response
			.status(HttpStatus.OK)
			.send(await this.calendarsService.findAll(request.user));
	}

	/*
	 * READ ALL FOR USER
	 */
	@Get('/user/:id')
	@UseGuards(MultiAuthGuard, RolesGuard)
	// User allowed, will check after that user can only get his own calendar
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'All user calendars',
	})
	// #endregion doc
	async findAllForUser(
		@Res() response,
		@Request() request,
		@Param('id') userId: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.findAllForUser(
					request.user,
					userId,
				),
			);
	}

	/*
	 * READ ONE
	 */
	@Get(':id')
	@UseGuards(MultiAuthGuard, RolesGuard)
	// User allowed, will check after that user can only get his own calendar
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The calendar',
	})
	// #endregion doc
	async findOne(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.findOne(request.user, calendarId),
			);
	}

	/*
	 * UPDATE
	 */
	@Put(':id')
	@UseGuards(MultiAuthGuard, RolesGuard)
	// User allowed, will check after that user can only update his own calendar
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The updated calendar',
	})
	// #endregion doc
	async update(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
		@Body() updateCalendarDto: UpdateCalendarDto,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.update(
					request.user,
					calendarId,
					updateCalendarDto,
				),
			);
	}

	/*
	 * DELETE
	 */
	@Delete(':id')
	@UseGuards(MultiAuthGuard, RolesGuard)
	// User allowed, will check after that user can only delete his own calendar
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The deleted calendar',
	})
	// #endregion doc
	async delete(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(await this.calendarsService.delete(request.user, calendarId));
	}

	/*
	 * SET STATE
	 */
	@Post('/state/:id/:state')
	@UseGuards(MultiAuthGuard, RolesGuard)
	// User allowed, will check after that user can only set a state in his own calendar
	@Roles(Role.Admin, Role.User)
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'TODO',
	})
	// #endregion doc
	async setState(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
		@Param('state') state: string,
		@Query('for') forQuery: string, // YYYY-MM-DD
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.setState(
					request.user,
					calendarId,
					state,
					forQuery,
				),
			);
	}

	/*
	 * GET MONTH
	 */
	@UseGuards(MultiAuthGuard, RolesGuard)
	@Roles(Role.Admin, Role.User) // User allowed, will check after that user can only get a month of his own calendar
	@Get('/month/:id')
	// #region doc
	@ApiTags('Calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'TODO',
	})
	// #endregion doc
	async getMonth(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
		@Query('month') monthQuery: string, // YYYY-MM
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.getMonth(
					request.user,
					calendarId,
					monthQuery,
				),
			);
	}
}
