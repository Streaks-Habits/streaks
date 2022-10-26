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
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enum/roles.enum';
import { UsersService } from './users.service';

@Controller('/api/v1/users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiTags('users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiCreatedResponse({
		description: "The created user's data",
		type: GetUserDto,
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Post('/add')
	async createUser(@Res() response, @Body() createUserDto: CreateUserDto) {
		return response
			.status(HttpStatus.CREATED)
			.send(await this.usersService.createUser(createUserDto));
	}

	@ApiTags('users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "The updated user's data",
		type: GetUserDto,
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Put('/update/:id')
	async updateUser(
		@Res() response,
		@Param('id') userId: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.updateUser(userId, updateUserDto));
	}

	@ApiTags('users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "All users' data",
		type: GetUserDto,
		isArray: true,
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Get('/list')
	async getUsers(@Res() response) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.getAllUsers());
	}

	@ApiTags('users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "The user's data",
		type: GetUserDto,
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Get('/user/:id')
	async getUser(@Res() response, @Param('id') userId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.getUser(userId));
	}

	@ApiTags('users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: "The deleted user's data",
		type: GetUserDto,
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Delete('/delete/:id')
	async deleteUser(@Res() response, @Param('id') userId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.deleteUser(userId));
	}

	@ApiTags('users')
	@ApiHeader({ name: 'x-api-key', description: 'Your api key' })
	@ApiOkResponse({
		description: 'The generated api key',
		type: String,
	})
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Put('/api_key/generate/:id')
	async generateApiKey(@Res() response, @Param('id') userId: string) {
		return response
			.status(HttpStatus.OK)
			.send(await this.usersService.generateApiKey(userId));
	}
}
