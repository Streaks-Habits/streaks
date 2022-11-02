import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HeaderApiKeyStrategy } from './api-key.strategy';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [UsersModule, PassportModule],
	providers: [AuthService, HeaderApiKeyStrategy],
})
export class AuthModule {}
