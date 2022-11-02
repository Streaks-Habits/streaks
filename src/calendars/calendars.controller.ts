import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
	Put,
	Request,
	Res,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiCreatedResponse,
	ApiHeader,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { Role } from '../users/enum/roles.enum';
import { CalendarsService } from './calendars.service';

@Controller('/api/v1/calendars')
export class CalendarsController {
	constructor(private readonly calendarsService: CalendarsService) {}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiCreatedResponse({
		description: 'The created calendar',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin, Role.User) // User allowed, will check after that user can only create a calendar for himself
	@Post('/add')
	async createCalendar(
		@Res() response,
		@Request() request,
		@Body() createCalendarDto: CreateCalendarDto,
	) {
		return response
			.status(HttpStatus.CREATED)
			.send(
				await this.calendarsService.createCalendar(
					request.user,
					createCalendarDto,
				),
			);
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The updated calendar',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin, Role.User) // User allowed, will check after that user can only update his own calendar
	@Put('/update/:id')
	async updateCalendar(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
		@Body() updateCalendarDto: UpdateCalendarDto,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.updateCalendar(
					request.user,
					calendarId,
					updateCalendarDto,
				),
			);
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'All calendars',
		isArray: true,
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Get('/list')
	async getCalendars(@Res() response) {
		return response
			.status(HttpStatus.OK)
			.send(await this.calendarsService.getAllCalendars());
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The calendar',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin, Role.User) // User allowed, will check after that user can only get his own calendar
	@Get('/calendar/:id')
	async getCalendar(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.getCalendar(
					request.user,
					calendarId,
				),
			);
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The deleted calendar',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin, Role.User) // User allowed, will check after that user can only delete his own calendar
	@Delete('/delete/:id')
	async deleteCalendar(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.deleteCalendar(
					request.user,
					calendarId,
				),
			);
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'TODO',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin, Role.User) // User allowed, will check after that user can only set a state in his own calendar
	@Put('/set_state/:id/:date/:state')
	async setState(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
		@Param('date') dateString: string,
		@Param('state') state: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.setState(
					request.user,
					calendarId,
					dateString,
					state,
				),
			);
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'TODO',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin, Role.User) // User allowed, will check after that user can only get a month of his own calendar
	@Get('/month/:id/:month')
	async getMonth(
		@Res() response,
		@Request() request,
		@Param('id') calendarId: string,
		@Param('month') monthString: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.getMonth(
					request.user,
					calendarId,
					monthString,
				),
			);
	}
}
