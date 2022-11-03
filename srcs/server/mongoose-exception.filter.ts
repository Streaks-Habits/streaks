import {
	Catch,
	ConflictException,
	ExceptionFilter,
	InternalServerErrorException,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import * as mongoose from 'mongoose';

@Catch(mongoose.mongo.MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
	catch(exception: MongoServerError) {
		switch (exception.code) {
			case 11000:
				throw new ConflictException(
					`Duplicate unique key ${Object.keys(exception.keyValue)}`,
				);
			default:
				throw new InternalServerErrorException(
					`MongoDB error code ${exception.code}, messge: ${exception.message}`,
				);
		}
	}
}
