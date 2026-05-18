import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendWelcomeMail(to: string , subject : string , template : string , context : Record<string , string>) {
		await this.mailerService.sendMail({
			to,
			subject: subject,
			template: template,
			context: context 
		});
	}
}
