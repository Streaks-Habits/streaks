import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(private configService: ConfigService) {
		const JWT_SECRET = configService.get<string>('AUTH_JWT_SECRET');

		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWT,
				ExtractJwt.fromAuthHeaderAsBearerToken(),
			]),
			ignoreExpiration: false,
			secretOrKey: JWT_SECRET,
		});
	}

	static extractJWT(req: Request): string | null {
		if (
			req.cookies &&
			'auth-token' in req.cookies &&
			req.cookies['auth-token'].length > 0
		) {
			return req.cookies['auth-token'];
		}
		return null;
	}

	async validate(payload: any) {
		return {
			_id: payload.sub,
			username: payload.username,
			role: payload.role,
		};
	}
}
