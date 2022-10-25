import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-headerapikey';
import { AuthService } from './auth.service';

@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(
	Strategy,
	'api-key',
) {
	constructor(private authService: AuthService) {
		super(
			{ header: 'X-API-KEY', prefix: '' },
			true,
			async (apiKey, done) => {
				return this.validate(apiKey, done);
			},
		);
	}

	async validate(
		apiKey: string,
		done: (error: Error, data) => Record<any, any>,
	): Promise<any> {
		const user = await this.authService.validateApiKey(apiKey);

		if (!user) {
			done(new UnauthorizedException(), null);
		}
		done(null, user);
	}
}
