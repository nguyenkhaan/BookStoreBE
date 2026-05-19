import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
	constructor(private readonly mailerService: MailerService) {}
	//_______________HELPER
	gradeMapping(grade : string | null) 
	{
		if (grade == 'GOLD') 
			return { text: 'Vàng', color: '#d4af37' } 
		if (grade == "SILVER") return { text: 'Bạc', color: '#94a3b8' }
		if (grade == "BRONZE") return { text: 'Đồng', color: '#b45309' } 
		return { text: 'Chưa có thông tin', color: '#6b7280' }
	};

	async sendWelcomeMail(
		to: string,
		subject: string,
		template: string,
		context: Record<string, string>,
	) {
		await this.mailerService.sendMail({
			to,
			subject: subject,
			template: template,
			context: context,
		});
	}
}
