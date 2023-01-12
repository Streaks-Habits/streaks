import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { Types, Schema as MongooseSchema } from 'mongoose';
import { RUser, User } from '../../users/schemas/user.schema';
import { State } from '../enum/state.enum';

export class CalendarNotifications {
	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	@Prop({ required: true })
	reminders: boolean;

	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	@Prop({ required: true })
	congrats: boolean;
}

@Schema()
export class Calendar {
	@Prop({ required: true, type: String })
	name: string;

	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: User.name,
		required: true,
	})
	user: Types.ObjectId;

	@Prop({ required: false, type: Array<boolean>, isArray: true })
	agenda?: Array<boolean>;

	@Prop({ required: false })
	days?: Map<string, State>;

	@Prop({ required: false })
	notifications?: CalendarNotifications;
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
export type CalendarDoc = Calendar & { _id: Types.ObjectId };

/*
 * This is the class that will be used when we return data to the client
 * It will be used to generate the swagger documentation
 * Difference with the Calendar class:
 *   - _id is added
 *   - the user id is replaced by the user object
 *   - adding the current_streak and streak_expended_today that is dynamically computed
 *   - remove the days array
 */
export class RCalendar {
	// Add _id
	@ApiProperty({ type: String })
	_id: Types.ObjectId | string;

	@ApiProperty({ type: String })
	name: string;

	@ApiProperty({ type: RUser })
	user: RUser;

	@ApiProperty({ type: Boolean, isArray: true })
	agenda: Array<boolean>;

	@ApiProperty({ type: Number })
	current_streak: number;

	@ApiProperty({ type: Boolean })
	streak_expended_today: boolean;

	@ApiProperty({ type: CalendarNotifications })
	notifications?: CalendarNotifications;
}
