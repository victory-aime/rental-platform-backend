export type EmailTemplateType = 'otp' | 'welcome';

export interface EmailTemplatePayload {
  payload?: {
    lastName: string;
    firstName: string;
    email: string;
  };
  otp?: string;
  [key: string]: any;
}
