import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
	Put,
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
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
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
	@Roles(Role.Admin)
	@Post('/add')
	async createCalendar(
		@Res() response,
		@Body() createCalendarDto: CreateCalendarDto,
	) {
		return response
			.status(HttpStatus.CREATED)
			.send(
				await this.calendarsService.createCalendar(createCalendarDto),
			);
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The updated calendar',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Put('/update/:id')
	async updateCalendar(
		@Res() response,
		@Param('id') calendarId: string,
		@Body() updateCalendarDto: UpdateCalendarDto,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.updateCalendar(
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
	@Roles(Role.Admin)
	@Get('/calendar/:id')
	async getCalendar(@Res() response, @Param('id') calendarId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.calendarsService.getCalendar(calendarId));
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The deleted calendar',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Delete('/delete/:id')
	async deleteCalendar(@Res() response, @Param('id') calendarId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.calendarsService.deleteCalendar(calendarId));
	}

	@ApiTags('calendars')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'TODO',
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Put('/set_state/:id/:date/:state')
	async setState(
		@Res() response,
		@Param('id') calendarId: string,
		@Param('date') dateString: string,
		@Param('state') state: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.setState(
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
	@Roles(Role.Admin)
	@Get('/month/:id/:month')
	async getMonth(
		@Res() response,
		@Param('id') calendarId: string,
		@Param('month') monthString: string,
	) {
		return response
			.status(HttpStatus.OK)
			.send(
				await this.calendarsService.getMonth(calendarId, monthString),
			);
	}
}
