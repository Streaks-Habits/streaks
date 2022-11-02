import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './interface/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { isValidObjectId } from '../utils';

@Injectable()
export class UsersService {
	constructor(@InjectModel('User') private UserModel: Model<IUser>) {}

	defaultFields = '_id username role';

	async createUser(
		createUserDto: CreateUserDto,
		fields = this.defaultFields,
	): Promise<IUser> {
		const createUser: Omit<IUser, '_id'> = {
			username: createUserDto.username,
			password_hash: await bcrypt.hash(createUserDto.password, 10),
			role: createUserDto.role,
			api_key_hash: null,
		};

		const newUser = await new this.UserModel(createUser).save();
		// return getUser instead of newUser to apply fields selection
		return this.getUser(newUser._id.toString(), fields);
	}

	async updateUser(
		userId: string,
		updateUserDto: UpdateUserDto,
		fields = this.defaultFields,
	): Promise<IUser> {
		if (!isValidObjectId(userId))
			throw new NotFoundException('User not found');

		const updateUser: Omit<IUser, '_id'> = {
			username: updateUserDto.username,
			password_hash: undefined,
			role: updateUserDto.role,
			api_key_hash: undefined,
		};
		if (updateUserDto.password) {
			updateUser.password_hash = await bcrypt.hash(
				updateUserDto.password,
				10,
			);
		}

		const existingUser = await this.UserModel.findByIdAndUpdate(
			userId,
			updateUser,
			{ new: true, fields: fields },
		);
		if (!existingUser) throw new NotFoundException('User not found');
		return existingUser;
	}

	async getAllUsers(fields = this.defaultFields): Promise<IUser[]> {
		const userData = await this.UserModel.find({}, fields);
		if (!userData || userData.length == 0) {
			throw new NotFoundException('No users found');
		}
		return userData;
	}

	async getUser(userId: string, fields = this.defaultFields): Promise<IUser> {
		if (!isValidObjectId(userId))
			throw new NotFoundException('User not found');
		const existingUser = await this.UserModel.findById(
			userId,
			fields,
		).exec();
		if (!existingUser) throw new NotFoundException('User not found');
		return existingUser;
	}

	async deleteUser(
		userId: string,
		fields = this.defaultFields,
	): Promise<IUser> {
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
}
