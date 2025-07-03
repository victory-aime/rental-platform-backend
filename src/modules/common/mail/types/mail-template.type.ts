import { Address } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';

export type EmailTemplateType = 'otp' | 'welcome';

export class EmailTemplatePayload {
  sender?: string | Address;
  recipients?: string | Address | Address[];
  subject?: string;
  cc?: string[];
  bcc?: string[];
  text: string;
  html?: string;
  message?: string;
  attachments?: Attachment[];
  type?: EmailTemplateType;
  [key: string]: any;
}

class Attachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
}
