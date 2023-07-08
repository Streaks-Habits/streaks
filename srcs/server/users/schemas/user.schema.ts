import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { Role } from '../enum/roles.enum';

export class MatrixNotification {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Prop({ required: true })
	room_id: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Prop({ required: true })
	start_date: string; // HH:MM 24h // format

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Prop({ required: true })
	end_date: string; // HH:MM 24h // format
}

export class Notifications {
	@ApiProperty()
	@IsOptional()
	@Type(() => MatrixNotification)
	@ValidateNested()
	@Prop({ required: false })
	matrix?: MatrixNotification;

	@ApiProperty()
	@IsOptional()
	@IsBoolean()
	@Prop({ required: false })
	day_done_notif_sent_today?: boolean;
}

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

	@Prop({ required: false })
	notifications?: Notifications;
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

	@ApiProperty()
	notifications?: Notifications;
}
