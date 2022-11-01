import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type CalendarDocument = Calendar & Document;

@Schema()
export class Calendar {
	@Prop({ required: true })
	name: string;

	@Prop({
		type: MongooseSchema.Types.ObjectId,
		ref: User.name,
		required: true,
	})
	user: Types.ObjectId;

	@Prop({ required: false })
	agenda: Array<boolean>;

	@Prop({ required: false })
	days: Map<string, string>;
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
