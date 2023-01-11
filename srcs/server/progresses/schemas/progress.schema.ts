import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types, Schema as MongooseSchema, Date } from 'mongoose';
import { RUser, User } from '../../users/schemas/user.schema';
import { RecurrenceUnit } from '../enum/recurrence_unit.enum';

@Schema()
class Measure {
	@ApiProperty({ type: Date })
	@Prop({ required: true, type: Date })
	date: Date;

	@ApiProperty()
	@Prop({ required: true, type: Number })
	value: number;
}

@Schema()
export class Progress {
	@ApiProperty({ type: String })
	@Prop({ required: true, type: String })
	name: string;

	@ApiProperty({ type: Types.ObjectId })
	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: User.name,
		required: true,
	})
	user: Types.ObjectId;

	@ApiProperty({ type: String, enum: RecurrenceUnit })
	@Prop({ required: true, type: String, enum: RecurrenceUnit })
	recurrence_unit: RecurrenceUnit;

	@ApiProperty({ type: Number })
	@Prop({ required: true, type: Number })
	goal: number;

	@ApiProperty({ type: Measure, isArray: true })
	@Prop({ required: false, type: Measure, isArray: true })
	measures?: Measure[];
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
export type ProgressDoc = Progress & { _id: Types.ObjectId };

/*
 * This is the class that will be used when we return data to the client
 * It will be used to generate the swagger documentation
 * Difference with the Progress class:
 *   - _id is added
 *   - the user id is replaced by the user object
 *   - adding the current_progress that is dynamically computed
 *   - remove the measures array
 */
export class RProgress {
	// Add _id
	@ApiProperty({ type: String })
	_id: Types.ObjectId | string;

	@ApiProperty({ type: String })
	name: string;

	@ApiProperty({ type: RUser })
	user: RUser;

	@ApiProperty({ type: String, enum: RecurrenceUnit })
	recurrence_unit: RecurrenceUnit;

	@ApiProperty({ type: Number })
	goal: number;

	@ApiProperty({ type: Number })
	current_progress: number;
}
