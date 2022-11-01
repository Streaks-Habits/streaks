import {
	ArrayMaxSize,
	ArrayMinSize,
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarDto {
	@ApiProperty()
	@IsString()
	@MaxLength(50)
	@IsNotEmpty()
	readonly name: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	readonly user: string;

	@ApiProperty()
	@IsBoolean({ each: true })
	@ArrayMaxSize(7)
	@ArrayMinSize(7)
	@IsOptional()
	readonly agenda: boolean[];
}
