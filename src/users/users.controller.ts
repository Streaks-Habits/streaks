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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('/api/v1/users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiTags('users')
	@Post('/add')
	async createUser(@Res() response, @Body() createUserDto: CreateUserDto) {
		try {
			const newUser = await this.usersService.createUser(createUserDto);
			return response.status(HttpStatus.CREATED).json({
				message: 'User has been created successfully',
				user: newUser,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
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
			return response.status(HttpStatus.OK).json({
				message: 'User has been successfully updated',
				user: existingUser,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}

	@ApiTags('users')
	@Get('/list')
	async getUsers(@Res() response) {
		try {
			const userData = await this.usersService.getAllUsers();
			return response.status(HttpStatus.OK).json({
				message: 'All users data found successfully',
				users: userData,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}

	@ApiTags('users')
	@Get('/user/:id')
	async getUser(@Res() response, @Param('id') userId: string) {
		try {
			const existingUser = await this.usersService.getUser(userId);
			return response.status(HttpStatus.OK).json({
				message: 'User found successfully',
				user: existingUser,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}

	@ApiTags('users')
	@Delete('/delete/:id')
	async deleteUser(@Res() response, @Param('id') userId: string) {
		try {
			const deletedUser = await this.usersService.deleteUser(userId);
			return response.status(HttpStatus.OK).json({
				message: 'User deleted successfully',
				user: deletedUser,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}
}
