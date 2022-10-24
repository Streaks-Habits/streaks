import { Document } from 'mongoose';

export interface IUser extends Document {
	readonly username: string;
	readonly password_hash: string;
}
