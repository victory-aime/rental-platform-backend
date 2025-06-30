// import { Injectable, OnModuleInit } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';
// import * as hbs from 'nodemailer-express-handlebars';
// import { join } from 'path';
//
// @Injectable()
// export class MailService implements OnModuleInit {
//   private transporter: nodemailer.Transporter;
//
//   async onModuleInit() {
//     this.transporter = nodemailer.createTransport({
//       host: 'smtp.example.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: 'user@example.com',
//         pass: 'your_password',
//       },
//     });
//
//     this.transporter.use(
//       'compile',
//       hbs({
//         viewEngine: {
//           partialsDir: join(__dirname, 'templates'),
//           defaultLayout: 'false',
//         },
//         viewPath: join(__dirname, 'templates'),
//         extName: '.hbs',
//       }),
//     );
//   }
//
//   async sendMail(to: string, subject: string): Promise<void> {
//     await this.transporter.sendMail({
//       from: '"Support" <support@example.com>',
//       to,
//       subject,
//     });
//   }
// }

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { EmailTemplatePayload } from './types/mail-template.type';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_CLIENT_EMAIL,
        pass: process.env.GOOGLE_CLIENT_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendEmail(emailDto: EmailTemplatePayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.GOOGLE_CLIENT_EMAIL,
      to: emailDto.payload?.email,
      subject: 'Validate OTP',
      text: `Your OTP code is : ${emailDto.otp}`,
    });
  }
}
