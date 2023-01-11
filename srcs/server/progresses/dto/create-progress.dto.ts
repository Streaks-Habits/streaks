import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecurrenceUnit } from '../enum/recurrence_unit.enum';

export class CreateProgressDto {
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
	@IsEnum(RecurrenceUnit)
	@IsNotEmpty()
	readonly recurrence_unit: RecurrenceUnit;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	readonly goal: number;
}
