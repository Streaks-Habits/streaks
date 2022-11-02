import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { Role } from 'src/users/enum/roles.enum';
import { IUser } from 'src/users/interface/user.interface';
import { UsersService } from 'src/users/users.service';
import { isValidObjectId } from 'src/utils';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService,
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
}
