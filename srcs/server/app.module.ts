import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CalendarsModule } from './calendars/calendars.module';
import { ProgressesModule } from './progresses/progresses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CronsModule } from './crons/crons.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URI'),
			}),
			inject: [ConfigService],
		}),
		ScheduleModule.forRoot(),
		AuthModule,
		UsersModule,
		CalendarsModule,
		ProgressesModule,
		NotificationsModule,
		CronsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
