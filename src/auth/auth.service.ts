import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isValidObjectId } from 'mongoose';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService) {}

	async validateApiKey(apiKey: string): Promise<any> {
		const userId = apiKey.split(':')[0];

		if (!isValidObjectId(userId)) return null;
		const user = await this.usersService.getUser(userId, '');

		if (
			user &&
			user.api_key_hash &&
			(await bcrypt.compare(apiKey, user.api_key_hash))
		) {
			return user;
		}
		return null;
	}
}
