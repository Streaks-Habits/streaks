import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enum/roles.enum';

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

	@ApiProperty()
	@IsEnum(Role)
	@IsNotEmpty()
	readonly role: Role;
}
