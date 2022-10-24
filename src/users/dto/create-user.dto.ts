import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@MaxLength(30)
	@IsNotEmpty()
	readonly username: string;

	@IsString()
	@IsNotEmpty()
	readonly password_hash: string;
}
