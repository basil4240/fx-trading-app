export interface EmailMessage {
  caption?: string;
  from?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  htmlBody: string;
  textBody: string;
}
