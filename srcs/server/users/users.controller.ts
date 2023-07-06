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
import {
	ApiCreatedResponse,
	ApiHeader,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enum/roles.enum';
import { UsersService } from './users.service';
import { MultiAuthGuard } from '../auth/guard/multi-auth.guard';
import { RefreshJwtGuard } from '../auth/guard/refresh-jwt.guard';
import { RUser } from './schemas/user.schema';

@Controller('/api/v1/users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	/*
	 * CREATE
	 */
	@Post()
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	// #region doc
	@ApiTags('Users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiCreatedResponse({
		description: "The created user's data",
	})
	// #endregion doc
	async create(@Res() response, @Body() createUserDto: CreateUserDto) {
		return response
			.status(HttpStatus.CREATED)
			.send(await this.usersService.create(createUserDto));
	}

	/*
	 * READ ALL
	 */
	@Get()
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	// #region doc
	@ApiTags('Users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "All users' data",
		isArray: true,
	})
	// #endregion doc
	async findAll(@Res() response) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.findAll());
	}

	/*
	 * READ ONE
	 */
	@Get(':id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	// #region doc
	@ApiTags('Users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "The user's data",
	})
	// #endregion doc
	async findOne(@Res() response, @Param('id') userId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.findOne(userId));
	}

	/*
	 * UPDATE
	 */
	@Put(':id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	// #region doc
	@ApiTags('Users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "The updated user's data",
	})
	// #endregion doc
	async update(
		@Res() response,
		@Param('id') userId: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.update(userId, updateUserDto));
	}

	/*
	 * DELETE
	 */
	@Delete(':id')
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	// #region doc
	@ApiTags('Users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "The deleted user's data",
	})
	// #endregion doc
	async delete(@Res() response, @Param('id') userId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.delete(userId));
	}

	/*
	 * GENERATE API KEY
	 */
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin)
	@Get('/api_key/:id')
	// #region doc
	@ApiTags('Users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The generated api key',
		type: String,
	})
	// #endregion doc
	async generateApiKey(@Res() response, @Param('id') userId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.generateApiKey(userId));
	}

	/*
	 * GET CURRENT USER
	 */
	@UseGuards(MultiAuthGuard, RolesGuard, RefreshJwtGuard)
	@Roles(Role.Admin, Role.User)
	@Get('/me')
	// #region doc
	@ApiTags('Users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "The current user's data",
		type: RUser,
	})
	// #endregion doc
	async getCurrentUser(@Res() response, @Request() request) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.getCurrentUser(request.user));
	}
}
