import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../enum/roles.enum';

export type UserDocument = User & Document;

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
