import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './mongoose-exception.filter';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

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
}
bootstrap();
