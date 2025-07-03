import { Injectable } from '@nestjs/common';
import { EmailTemplatePayload } from './types/mail-template.type';
import { MailerService } from '@nestjs-modules/mailer';
import { CompileTemplateService } from '_common/mail/utils/compile-templates';

@Injectable()
export class EmailService {
  /**
   * Service to send emails using the MailerService.
   * It compiles email templates and sends them to specified recipients.
   */
  constructor(
    private readonly mailService: MailerService,
    private readonly compileTemplate: CompileTemplateService,
  ) {}

  async sendEmail(emailDto: EmailTemplatePayload, context: any): Promise<void> {
    const { recipients, subject = 'Validate OTP' } = emailDto;
    const html = this.compileTemplate.compileTemplate('otp', context);
    try {
      const mailOptions = {
        from: process.env.GOOGLE_CLIENT_EMAIL,
        replyTo: process.env.GOOGLE_CLIENT_EMAIL,
        to: recipients,
        subject,
        html,
      };
      await this.mailService.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Error sending email: ${error}`);
    }
  }
}
