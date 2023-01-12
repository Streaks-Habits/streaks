import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enum/roles.enum';
import { Notifications } from '../schemas/user.schema';
import { Type } from 'class-transformer';

export class CreateUserDto {
	@ApiProperty()
	@IsString()
	@MaxLength(30)
	@IsNotEmpty()
	readonly username: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	readonly password: string;

	@ApiProperty()
	@IsEnum(Role)
	@IsNotEmpty()
	readonly role: Role;

	@ApiProperty()
	@IsOptional()
	@Type(() => Notifications)
	@ValidateNested()
	readonly notifications?: Notifications;
}
