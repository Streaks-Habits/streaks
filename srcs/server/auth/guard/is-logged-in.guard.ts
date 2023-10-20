import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsLoggedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const authToken =
			request.cookies['auth-token'] || request.headers['authorization'];

		if (authToken) {
			request.logged_in = true;
			return true;
		}
		request.logged_in = false;
		return true;
	}
}
