import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { Role } from '../users/enum/roles.enum';
import { IUser } from '../users/interface/user.interface';
import { UsersService } from '../users/users.service';
import { isValidObjectId } from '../utils';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService,
		private jwtService: JwtService,
	) {}

	async validateApiKey(apiKey: string): Promise<IUser | null> {
		if (apiKey === this.configService.get('ADMIN_API_KEY'))
			return {
				_id: new Types.ObjectId(0),
				role: Role.Admin,
				username: '',
				password_hash: '',
			};

		const userId = apiKey.split(':')[0];

		if (!isValidObjectId(userId)) return null;
		try {
			const user = await this.usersService.getUser(userId, '');

			if (
				user &&
				user.api_key_hash &&
				(await bcrypt.compare(apiKey, user.api_key_hash))
			) {
				return user;
			}
		} catch (e) {
			return null;
		}

		return null;
	}

	async validateCredentials(
		username: string,
		password: string,
	): Promise<IUser | null> {
		const user = await this.usersService.getUserByUsername(
			username,
			'_id username role password_hash',
		);

		if (user && (await bcrypt.compare(password, user.password_hash))) {
			user.password_hash = undefined;
			return user;
		}
		return null;
	}

	async login(user: IUser): Promise<string> {
		const payload = {
			username: user.username,
			sub: user._id,
			role: user.role,
		};
		return this.jwtService.sign(payload);
	}
}
