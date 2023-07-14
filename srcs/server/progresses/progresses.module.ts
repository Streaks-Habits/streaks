import { CallHandler, ExecutionContext, Injectable, Module, NestInterceptor } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ProgressesController } from './progresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	Measure,
	MeasureSchema,
	Progress,
	ProgressSchema,
} from './schemas/progress.schema';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Observable, map } from 'rxjs';


@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Progress.name, schema: ProgressSchema },
			{ name: Measure.name, schema: MeasureSchema },
		]),
		UsersModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('AUTH_JWT_SECRET'),
				signOptions: {
					expiresIn: configService.get<number>('AUTH_JWT_EXPIRES'),
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [ProgressesController],
	providers: [
		ProgressesService,],
	exports: [ProgressesService],
})
export class ProgressesModule {}
