import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HeaderApiKeyStrategy } from './strategy/api-key.strategy';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: configService.get<number>('AUTH_COOKIE_EXPIRES'),
				},
			}),
			inject: [ConfigService],
		}),
	],
	providers: [AuthService, HeaderApiKeyStrategy, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
