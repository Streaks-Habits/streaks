import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
	@ApiProperty()
	@IsString()
	@MaxLength(30)
	@IsNotEmpty()
	readonly username: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	readonly password_hash: string;
}
