import {
	ArrayMaxSize,
	ArrayMinSize,
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CalendarNotifications } from '../schemas/calendar.schema';
import { Type } from 'class-transformer';

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
	@IsOptional()
	@IsBoolean()
	readonly enabled: boolean;

	@ApiProperty()
	@IsBoolean({ each: true })
	@ArrayMaxSize(7)
	@ArrayMinSize(7)
	@IsNotEmpty()
	readonly agenda: Array<boolean>;

	@ApiProperty()
	@IsOptional()
	@Type(() => CalendarNotifications)
	@ValidateNested()
	readonly notifications: CalendarNotifications;
}
