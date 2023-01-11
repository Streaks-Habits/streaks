import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ProgressesController } from './progresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schemas/progress.schema';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Progress.name, schema: ProgressSchema },
		]),
		UsersModule,
	],
	controllers: [ProgressesController],
	providers: [ProgressesService],
	exports: [ProgressesService],
})
export class ProgressesModule {}
