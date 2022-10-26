import { Role } from '../enum/roles.enum';

export interface IUser {
	_id: string;
	username: string;
	password_hash: string;
	role: Role;
	api_key_hash: string;
}
