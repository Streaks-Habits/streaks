import { NestFactory } from '@nestjs/core';
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	ValidationPipe,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { Observable, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

import { AppModule } from './app.module';
import { MongoExceptionFilter } from './filters/mongoose-exception.filter';
import { areRegistrationsEnabled, isDemoUserEnabled } from './utils';
import { UsersService } from './users/users.service';
import { CronsService } from './crons/crons.service';
import { IsLoggedGuard } from './auth/guard/is-logged-in.guard';

function recursiveInterceptor(value: any): unknown {
	if (Array.isArray(value)) {
		return value.map(recursiveInterceptor);
	}
	if (typeof value !== 'object') return value;

	// Check that object have been lean()ed
	if (value.toObject) value = value.toObject();

	const properties_to_remove = [
		// User
		'password_hash',
		'api_key_hash',
	];

	// Remove properties
	for (const property of properties_to_remove) {
		if (value.hasOwnProperty(property)) {
			delete value[property];
			console.log(`Removed property ${property}`);
		}
	}

	// TODO: uncomment this (changes needed in the frontend and the clients)
	// Rename _id to id
	// if (value.hasOwnProperty('_id')) {
	// 	value.id = value._id;
	// 	delete value._id;
	// }

	return value;
}

@Injectable()
export class Interceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(map((value) => recursiveInterceptor(value)));
	}
}

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);
	const config = app.get<ConfigService>(ConfigService);

	await app.register(fastifyCookie, {
		secret: 'TODO: load this from a .env file',
	});

	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.useGlobalFilters(new MongoExceptionFilter());
	app.useGlobalInterceptors(new Interceptor());
	app.useGlobalGuards(new IsLoggedGuard());

	app.useStaticAssets({
		root: join(__dirname, '..', 'public'),
		prefix: '/public/',
	});
	app.useStaticAssets({
		root: join(__dirname, '..', 'styles'),
		prefix: '/styles/',
		decorateReply: false,
	});

	app.setViewEngine({
		engine: {
			ejs: require('ejs'),
		},
		templates: join(__dirname, '..', 'views'),
	});

	// Swagger
	const swaggerConfig = new DocumentBuilder()
		.setTitle('Streaks')
		.setDescription('The streaks API description')
		.setVersion('1.0')
		.build();
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('api', app, swaggerDocument, {
		// Hide the Swagger UI top bar
		customCss: '.swagger-ui .topbar { display: none }',
		customSiteTitle: 'Streaks API documentation',
	});

	await app.listen(config.get<number>('PORT') || 80, '::');

	console.log(`Application is running on: ${await app.getUrl()}`);

	// Are registrations enabled?
	// Get users service from imports
	const usersService = app.get<UsersService>(UsersService);
	const registrationsEnabled = await areRegistrationsEnabled(
		config,
		usersService,
	);
	console.log(
		`Registrations are ${registrationsEnabled ? 'enabled' : 'disabled'}`,
	);

	// Is demo user enabled?
	const demoUserEnabled = isDemoUserEnabled(config);
	if (demoUserEnabled) {
		usersService.createDemoUser();
	}
	console.log(`Demo user is ${demoUserEnabled ? 'enabled' : 'disabled'}`);

	// Set break days
	const cronsService = app.get<CronsService>(CronsService);
	await cronsService.setBreakDays();
}
bootstrap();
