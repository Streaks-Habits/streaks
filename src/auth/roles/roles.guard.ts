import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../../users/enum/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const roles = this.reflector.get<string[]>(
			'roles',
			context.getHandler(),
		);
		if (!roles) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		if (!user.role) user.role = Role.User;

		return roles.includes(user.role);
	}
}
