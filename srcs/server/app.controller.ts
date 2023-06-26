import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Post,
	Render,
	Request,
	Res,
	UseFilters,
	UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { LocalAuthGuard } from './auth/guard/local.guard';
import { RedirectLoginFilter } from './unauthorized-exception.filter';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	@Get()
	// @Redirect('/dashboard')
	getIndex(@Res() response) {
		// return;
		return response
			.status(HttpStatus.TEMPORARY_REDIRECT)
			.redirect('/dashboard');
	}

	@Get('/login')
	@Render('login')
	getLogin() {
		return { type: 'login' };
	}

	@Get('/register')
	@Render('login')
	getRegister() {
		return { type: 'register' };
	}

	@UseGuards(LocalAuthGuard)
	@Post('/login')
	async login(@Res() response, @Request() request) {
		const auth_token = await this.authService.login(request.user);
		response.cookie('auth-token', auth_token, {
			httpOnly: true,
			path: '/',
			maxAge: this.configService.get<number>('AUTH_COOKIE_EXPIRES'),
		});
		return response
			.status(HttpStatus.OK)
			.send({ 'auth-token': auth_token });
	}

	@Post('/register')
	async register(@Res() response, @Body() body) {
		const new_user = await this.appService.register(
			body.username,
			body.password,
			body.passwordRepeat,
		);
		const auth_token = await this.authService.login(new_user);
		response.cookie('auth-token', auth_token, {
			httpOnly: true,
			path: '/',
			maxAge: this.configService.get<number>('AUTH_COOKIE_EXPIRES'),
		});
		return response
			.status(HttpStatus.OK)
			.send({ 'auth-token': auth_token });
	}

	@UseGuards(JwtAuthGuard)
	@Get('/logout')
	async logout(@Res() response) {
		response.cookie('auth-token', '', {
			httpOnly: true,
			path: '/',
			maxAge: 0,
		});
		return response.status(HttpStatus.TEMPORARY_REDIRECT).redirect('/');
	}

	@UseGuards(JwtAuthGuard)
	@UseFilters(new RedirectLoginFilter())
	@Get('/dashboard')
	@Render('dashboard')
	getDashboard(@Request() request) {
		return {
			user: request.user,
		};
	}
}
