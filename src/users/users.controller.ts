import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	InternalServerErrorException,
	Param,
	Post,
	Put,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles/roles.decorator';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enum/roles.enum';
import { UsersService } from './users.service';

@Controller('/api/v1/users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiTags('users')
	@UseGuards(AuthGuard('api-key'))
	@Post('/add')
	async createUser(
		@Res() response,
		@Req() request,
		@Body() createUserDto: CreateUserDto,
	) {
		try {
			const newUser = await this.usersService.createUser(createUserDto);
			return response.status(HttpStatus.CREATED).send({
				message: 'User has been created successfully',
				user: newUser,
			});
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException();
		}
	}

	@ApiTags('users')
	@Put('/update/:id')
	async updateUser(
		@Res() response,
		@Param('id') userId: string,
		@Body() updateUserDto: UpdateUserDto,
	) {
		try {
			const existingUser = await this.usersService.updateUser(
				userId,
				updateUserDto,
			);
			return response.status(HttpStatus.OK).send({
				message: 'User has been successfully updated',
				user: existingUser,
			});
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException();
		}
	}

	@ApiTags('users')
	@Get('/list')
	async getUsers(@Res() response) {
		try {
			const userData = await this.usersService.getAllUsers();
			return response.status(HttpStatus.OK).send({
				message: 'All users data found successfully',
				users: userData,
			});
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException();
		}
	}

	@ApiTags('users')
	@UseGuards(AuthGuard('api-key'), RolesGuard)
	@Roles(Role.Admin)
	@Get('/user/:id')
	async getUser(@Res() response, @Param('id') userId: string) {
		try {
			const existingUser = await this.usersService.getUser(userId);
			return response.status(HttpStatus.OK).send({
				message: 'User found successfully',
				user: existingUser,
			});
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException();
		}
	}

	@ApiTags('users')
	@Delete('/delete/:id')
	async deleteUser(@Res() response, @Param('id') userId: string) {
		try {
			const deletedUser = await this.usersService.deleteUser(userId);
			return response.status(HttpStatus.OK).send({
				message: 'User deleted successfully',
				user: deletedUser,
			});
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException();
		}
	}

	@ApiTags('users')
	@Put('/api_key/generate/:id')
	async generateApiKey(@Res() response, @Param('id') userId: string) {
		try {
			const api_key = await this.usersService.generateApiKey(userId);
			return response.status(HttpStatus.OK).send({
				message: 'Api key generated successfully',
				api_key,
			});
		} catch (err) {
			console.error(err);
			throw new InternalServerErrorException();
		}
	}
}
