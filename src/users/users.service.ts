import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './interface/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
	constructor(@InjectModel('User') private UserModel: Model<IUser>) {}

	async createUser(createUserDto: CreateUserDto): Promise<IUser> {
		const newUser = await new this.UserModel(createUserDto);
		return newUser.save();
	}

	async updateUser(
		userId: string,
		updateUserDto: UpdateUserDto,
	): Promise<IUser> {
		const existingUser = await this.UserModel.findByIdAndUpdate(
			userId,
			updateUserDto,
			{ new: true },
		);
		if (!existingUser) {
			throw new NotFoundException(`User #${userId} not found`);
		}
		return existingUser;
	}

	async getAllUsers(): Promise<IUser[]> {
		const userData = await this.UserModel.find();
		if (!userData || userData.length == 0) {
			throw new NotFoundException('Users data not found!');
		}
		return userData;
	}

	async getUser(UserId: string): Promise<IUser> {
		const existingUser = await this.UserModel.findById(UserId).exec();
		if (!existingUser) {
			throw new NotFoundException(`User #${UserId} not found`);
		}
		return existingUser;
	}

	async deleteUser(UserId: string): Promise<IUser> {
		const deletedUser = await this.UserModel.findByIdAndDelete(UserId);
		if (!deletedUser) {
			throw new NotFoundException(`User #${UserId} not found`);
		}
		return deletedUser;
	}

	async generateApiKey(userId: string): Promise<string> {
		const api_key = `${userId}:${crypto.randomBytes(16).toString('hex')}`;
		const api_key_hash = await bcrypt.hash(api_key, 10);

		const existingUser = await this.UserModel.findByIdAndUpdate(
			userId,
			{ api_key_hash },
			{ new: true },
		);
		if (!existingUser) {
			throw new NotFoundException(`User #${userId} not found`);
		}
		return api_key;
	}
}
