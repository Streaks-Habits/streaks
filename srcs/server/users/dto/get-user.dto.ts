import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enum/roles.enum';

export class GetUserDto {
	@ApiProperty()
	readonly _id: string;

	@ApiProperty()
	readonly username: string;

	@ApiProperty()
	readonly role: Role;
}
