import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types, Schema as MongooseSchema, Date } from 'mongoose';
import { DateTime, DateTimeUnit } from 'luxon';
import { RUser, User } from '../../users/schemas/user.schema';
import { RecurrenceUnit } from '../enum/recurrence_unit.enum';
import { Exclude } from 'class-transformer';

@Schema()
export class Measure {
	@ApiProperty({ type: Date })
	@Prop({ required: true, type: Date, index: true, unique: true })
	date: Date;

	@ApiProperty()
	@Prop({ required: true, type: Number })
	value: number;
}

export const MeasureSchema = SchemaFactory.createForClass(Measure);

@Schema({
	toJSON: { virtuals: true, getters: true },
	toObject: { virtuals: true, getters: true },
})
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

	@ApiProperty({ type: Boolean })
	@Prop({ required: true, type: Boolean, default: true })
	enabled: boolean;

	@ApiProperty({ type: String, enum: RecurrenceUnit })
	@Prop({ required: true, type: String, enum: RecurrenceUnit })
	recurrence_unit: RecurrenceUnit;

	@ApiProperty({ type: Number })
	@Prop({ required: true, type: Number })
	goal: number;

	@Prop({ required: false, type: Map, of: Number })
	// Map<timestamp, value>
	measures?: Map<number, number>;

	// deadline is a virtual property

	// current_progress is a virtual property
	// @ApiProperty({ type: Number })
	// @Prop({
	// 	get: function () {
	// 		console.log('meas', this.measures);
	// 		return 42;
	// 	},
	// })
	current_progress?: number;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

// Virtual properties
ProgressSchema.virtual('deadline', {
	ref: 'Progress',
	localField: '_id',
	foreignField: '_id',
	justOne: true,
}).get(function () {
	const now = DateTime.now();
	// slice(0, -2) to remove 'ly' from unit => 'yearly' -> 'year', 'monthly' -> 'month'
	const unit =
		this.recurrence_unit == RecurrenceUnit.Daily
			? 'day'
			: this.recurrence_unit.slice(0, -2);
	const end = now.endOf(unit as DateTimeUnit);
	return end.toJSDate() as unknown as Date;
});

ProgressSchema.virtual('current_progress', {
	ref: 'Progress',
	localField: '_id',
	foreignField: '_id',
	justOne: true,
}).get(function () {
	const now = DateTime.now();
	// slice(0, -2) to remove 'ly' from unit => 'yearly' -> 'year', 'monthly' -> 'month'
	const unit =
		this.recurrence_unit == RecurrenceUnit.Daily
			? 'day'
			: this.recurrence_unit.slice(0, -2);
	const start = now.startOf(unit as DateTimeUnit).valueOf();
	const end = now.endOf(unit as DateTimeUnit).valueOf();

	// Get measures if they exist
	if (!this.measures) return 0;

	console.log('measures', this.measures);

	// for (const [key, value] of this.measures.entries()) {
	// 	console.log('key  ', key);
	// 	console.log('start', start);
	// 	console.log('end  ', end);
	// 	console.log('value', value, typeof value);
	// }

	// Filter measures between start and end
	const sum = Array.from(this.measures.entries())
		.filter(([key]) => key >= start && key <= end)
		.reduce((acc, [, value]) => acc + value, 0);
	return sum;
});

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

	@ApiProperty({ type: Boolean })
	enabled: boolean;

	@ApiProperty({ type: String, enum: RecurrenceUnit })
	recurrence_unit: RecurrenceUnit;

	@ApiProperty({ type: Number })
	goal: number;

	@Exclude()
	measures?: Map<number, number>;

	@ApiProperty({ type: Number })
	current_progress: number;

	@ApiProperty({ type: Date })
	deadline: Date;
}
