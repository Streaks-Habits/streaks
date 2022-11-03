import {
	Controller,
	Get,
	HttpStatus,
	Post,
	Render,
	Request,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { LocalAuthGuard } from './auth/guard/local.guard';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('/login')
	@Render('login')
	getLogin() {
		return { message: 'Hello from back!' };
	}

	@UseGuards(LocalAuthGuard)
	@Post('/login')
	async login(@Res() response, @Request() request) {
		const auth_token = await this.authService.login(request.user);
		response.cookie('auth-token', auth_token, {
			httpOnly: true,
			maxAge:
				this.configService.get<number>('AUTH_COOKIE_EXPIRES') * 1000,
		});
		return response
			.status(HttpStatus.OK)
			.send({ 'auth-token': auth_token });
	}

	@UseGuards(JwtAuthGuard)
	@Get('/profile')
	getProfile(@Request() request) {
		return request.user;
	}
}
