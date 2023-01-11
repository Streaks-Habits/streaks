import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Role } from '../enum/roles.enum';

@Schema()
export class User {
	@Prop({ required: true, unique: true })
	username: string;

	@Prop({ required: true })
	password_hash: string;

	@Prop({ required: true })
	role: Role;

	@Prop({ required: false })
	api_key_hash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDoc = User & { _id: Types.ObjectId };

/*
 * This is the class that will be used when we return data to the client
 * It will be used to generate the swagger documentation
 * Difference with the User class:
 *   - _id is added
 *   - password_hash is removed
 *   - api_key_hash is removed
 */
export class RUser {
	// Add _id
	@ApiProperty({ type: String })
	_id: Types.ObjectId | string;

	// Add other User properties
	@ApiProperty({ type: String, uniqueItems: true })
	username: string;

	@ApiProperty({ type: Role, enum: Role })
	role: Role;
}
