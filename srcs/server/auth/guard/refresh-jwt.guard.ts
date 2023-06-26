import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { DateTime } from 'luxon';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async canActivate(context: ExecutionContext) {
		// We assume that cookie will always be valid,
		// because there is the JwtAuthGuard before this guard
		// /!\ If the cookie isn't valid, there is a big security issue
		// because the user might be issued a new valid cookie from
		// an invalid one

		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		// Check if the cookie has expired
		const cookie = JwtStrategy.extractJWT(request);
		if (cookie) {
			const payload = JSON.parse(
				Buffer.from(cookie.split('.')[1], 'base64').toString(),
			);

			// Expiry to date
			const expiryDate = DateTime.fromSeconds(payload.exp);

			// If expires in less than a week
			const aWeek = DateTime.now().plus({ days: 7 });
			if (aWeek > expiryDate) {
				// Sign the new cookie
				const newCookieValue = await this.jwtService.signAsync({
					sub: payload.sub,
					username: payload.username,
					role: payload.role,
				});
				// Set the new cookie
				response.cookie('auth-token', newCookieValue, {
					httpOnly: true,
					path: '/',
					maxAge: this.configService.get<number>(
						'AUTH_COOKIE_EXPIRES',
					),
				});
			}
		}
		return true;
	}
}
