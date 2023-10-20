import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	UnauthorizedException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch(UnauthorizedException)
export class RedirectLoginFilter<T extends UnauthorizedException>
	implements ExceptionFilter
{
	catch(exception: T, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<FastifyReply>();

		// FastifyReply.redirect() is not working, using native http response
		//response.status(302).redirect('/login');
		response.raw
			.writeHead(HttpStatus.TEMPORARY_REDIRECT, {
				location: '/login',
			})
			.end();
	}
}
