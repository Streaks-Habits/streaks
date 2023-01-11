import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserDoc } from 'srcs/server/users/schemas/user.schema';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(private authService: AuthService) {
		super();
	}

	async validate(username: string, password: string): Promise<UserDoc> {
		const user = await this.authService.validateCredentials(
			username,
			password,
		);

		if (!user) throw new UnauthorizedException();
		return user;
	}
}
