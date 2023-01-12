import { Types } from 'mongoose';
import { Role } from '../users/enum/roles.enum';

export const AdminUser = {
	_id: new Types.ObjectId(0),
	role: Role.Admin,
	username: '',
	password_hash: '',
	api_key_hash: '',
};
