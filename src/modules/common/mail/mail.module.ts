import { EmailService } from '_common/mail/mail.service';
import { CompileTemplateService } from '_common/mail/utils/compile-templates';
import { Module } from '@nestjs/common';

@Module({
  providers: [EmailService, CompileTemplateService],
  exports: [EmailService, CompileTemplateService],
})
export class MailModule {}
