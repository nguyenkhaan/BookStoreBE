import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
	imports: [
		ConfigModule,

		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				transport: {
					host: configService.get<string>('MAIL_HOST'),
					port: configService.get<number>('MAIL_PORT'),
					secure: false,
					auth: {
						user: configService.get<string>('MAIL_USER') || '',
						pass: configService.get<string>('MAIL_PASS') || '',
					},
				},

				defaults: {
					from: configService.get<string>('MAIL_FROM'),
				},

				template: {
					dir: join(__dirname, 'templates'),

					adapter: new HandlebarsAdapter(),

					options: {
						strict: true,
					},
				},
			}),
		}),
	],

	providers: [EmailService],

	exports: [EmailService],
})
export class EmailModule {}
