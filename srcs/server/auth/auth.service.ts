import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RUser, UserDoc } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { isValidObjectId } from '../utils';
import { AdminUser } from './admin.object';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService,
		private jwtService: JwtService,
	) {}

	async validateApiKey(apiKey: string): Promise<UserDoc | null> {
		if (apiKey === this.configService.get('ADMIN_API_KEY'))
			return AdminUser;

		const userId = apiKey.split(':')[0];

		if (!isValidObjectId(userId)) return null;
		try {
			const user = await this.usersService.userModel.findById(
				userId,
				'api_key_hash',
			);

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
	): Promise<UserDoc | null> {
		// TODO: findOne (pour avoir tout ce qu'il faut)
		const user = await this.usersService.userModel.findOne(
			{ username: username },
			'_id username role password_hash',
		);

		if (user && (await bcrypt.compare(password, user.password_hash))) {
			user.password_hash = undefined;
			return user;
		}
		return null;
	}

	async login(user: RUser | UserDoc): Promise<string> {
		const payload = {
			username: user.username,
			sub: user._id,
			role: user.role,
		};
		return this.jwtService.sign(payload);
	}
}
