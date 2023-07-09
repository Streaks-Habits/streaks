import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { isValidObjectId } from '../utils';
import { RUser, User, UserDoc } from './schemas/user.schema';
import { AdminUser } from '../auth/admin.object';

@Injectable()
export class UsersService {
	constructor(@InjectModel('User') private UserModel: Model<User>) {}

	defaultFields = '_id username role notifications';
	userModel = this.UserModel;

	async create(
		createUserDto: CreateUserDto,
		fields = this.defaultFields,
	): Promise<RUser> {
		const createUser: User = {
			username: createUserDto.username,
			password_hash: await bcrypt.hash(createUserDto.password, 10),
			role: createUserDto.role,
			api_key_hash: null,
		};

		const newUser = await new this.UserModel(createUser).save();
		// return getUser instead of newUser to apply fields selection
		return this.findOne(newUser._id.toString(), fields);
	}

	async findAll(fields = this.defaultFields): Promise<RUser[]> {
		const userData = await this.UserModel.find({}, fields);
		if (!userData || userData.length == 0) {
			throw new NotFoundException('No users found');
		}
		return userData;
	}

	async findOne(userId: string, fields = this.defaultFields): Promise<RUser> {
		if (!isValidObjectId(userId))
			throw new NotFoundException('User not found');
		const existingUser = await this.UserModel.findById(
			userId,
			fields,
		).exec();
		if (!existingUser) throw new NotFoundException('User not found');
		return existingUser;
	}

	async update(
		userId: string,
		updateUserDto: UpdateUserDto,
		fields = this.defaultFields,
	): Promise<RUser> {
		if (!isValidObjectId(userId))
			throw new NotFoundException('User not found');

		const updateUser: User = {
			username: updateUserDto.username,
			password_hash: undefined,
			role: updateUserDto.role,
			api_key_hash: undefined,
			notifications: updateUserDto.notifications,
		};
		if (updateUserDto.password) {
			updateUser.password_hash = await bcrypt.hash(
				updateUserDto.password,
				10,
			);
		}
		if (Object.keys(updateUserDto.notifications).length == 0)
			updateUser.notifications = undefined;

		const existingUser = await this.UserModel.findByIdAndUpdate(
			userId,
			updateUser,
			{ new: true, fields: fields },
		);
		if (!existingUser) throw new NotFoundException('User not found');
		return existingUser;
	}

	async delete(userId: string, fields = this.defaultFields): Promise<RUser> {
		if (!isValidObjectId(userId))
			throw new NotFoundException('User not found');
		const deletedUser = await this.UserModel.findByIdAndDelete(userId, {
			fields: fields,
		});
		if (!deletedUser) throw new NotFoundException('User not found');
		return deletedUser;
	}

	async generateApiKey(userId: string): Promise<string> {
		if (!isValidObjectId(userId))
			throw new NotFoundException('User not found');
		const api_key = `${userId}:${crypto.randomBytes(16).toString('hex')}`;
		const api_key_hash = await bcrypt.hash(api_key, 10);

		const existingUser = await this.UserModel.findByIdAndUpdate(
			userId,
			{ api_key_hash },
			{ new: true },
		);
		if (!existingUser) throw new NotFoundException('User not found');
		return api_key;
	}

	async getCurrentUser(requester: UserDoc): Promise<RUser> {
		// If the user is the admin, return the admin object (admin.user.ts)
		if (requester.role == 'admin')
			return {
				_id: AdminUser._id,
				username: AdminUser.username,
				role: AdminUser.role,
				notifications: {
					day_done_notif_sent_today: false,
				},
			};
		return this.findOne(requester._id.toString());
	}

	async count(): Promise<number> {
		return await this.UserModel.countDocuments();
	}
}
