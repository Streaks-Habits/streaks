import { Document } from 'mongoose';
import { Role } from '../enum/roles.enum';

export interface IUser extends Document {
	readonly username: string;
	readonly password_hash: string;
	readonly role: Role;
	readonly api_key_hash: string;
}
