import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Role } from './users/enum/roles.enum';
import { RUser } from './users/schemas/user.schema';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import { areRegistrationsEnabled } from './utils';

@Injectable()
export class AppService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
	) {}

	async register(
		username: string,
		password: string,
		passwordRepeat: string,
	): Promise<RUser> {
		// Check if registrations are enabled
		if (
			(await areRegistrationsEnabled(
				this.configService,
				this.usersService,
			)) === false
		)
			throw new UnauthorizedException('Registrations are disabled');

		if (!username || username.length == 0)
			throw new BadRequestException('Username cannot be empty');
		if (!password || password.length == 0)
			throw new BadRequestException('Password cannot be empty');
		if (!passwordRepeat || passwordRepeat.length == 0)
			throw new BadRequestException('Password repeat cannot be empty');
		if (password !== passwordRepeat)
			throw new BadRequestException('Passwords do not match');

		const user = await this.usersService.create({
			username: username,
			password: password,
			role: Role.User,
		});
		return user;
	}
}
