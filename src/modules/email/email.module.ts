import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: 'localhost',
				port: 1025,
				secure: false,
			},
			defaults: {
				from: 'Beta Book - <noreply@example.com',
			},
			template: {
				dir: join(__dirname, 'templates'),

				adapter: new HandlebarsAdapter(),

				options: {
					strict: true,
				},
			},
		}),
	],
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
