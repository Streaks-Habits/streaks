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
import { areRegistrationsEnabled, isDemoUserEnabled } from './utils';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
		private readonly usersService: UsersService,
	) {}

	@Get()
	@Render('index')
	getIndex() {
		return {
			demoUserEnabled: isDemoUserEnabled(this.configService),
		};
	}

	@Get('/login')
	@Render('login')
	async getLogin() {
		return {
			type: 'login',
			registrationsEnabled: await areRegistrationsEnabled(
				this.configService,
				this.usersService,
			),
			demoUserEnabled: isDemoUserEnabled(this.configService),
		};
	}

	@Get('/register')
	@Render('login')
	async getRegister(@Res() response) {
		const registrationsEnabled = await areRegistrationsEnabled(
			this.configService,
			this.usersService,
		);
		// If registrations are disabled, redirect to login
		if (!registrationsEnabled)
			response.redirect(HttpStatus.TEMPORARY_REDIRECT, '/login');

		return {
			type: 'register',
			registrationsEnabled: registrationsEnabled,
			demoUserEnabled: isDemoUserEnabled(this.configService),
		};
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
