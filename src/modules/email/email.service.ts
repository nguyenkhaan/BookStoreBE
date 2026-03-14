import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
	private transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
	}

	async sendEmail(to: string, subject: string, html: string) {
		try {
			const info = await this.transporter.sendMail({
				from: `"Bookstore System" <${process.env.EMAIL_USER}>`,
				to,
				subject,
				html,
			});

			console.log('Email sent:', info.messageId);

			return {
				success: true,
				messageId: info.messageId,
			};
		} catch (err) {
			console.error('Send email error:', err);
			throw err;
		}
	}
}
