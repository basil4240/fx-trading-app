import { baseEmailTemplate, emailComponents } from './base.template';

// Template Input Types
export interface WelcomeEmailData {
  fullname;
  otp: string;
}

export interface PasswordResetEmailData {
  otp: string;
}

export interface PasswordChangedEmailData {
  otp: string;
}

export interface GenericEmailData {
  content: string;
  subject: string;
}

// ─── Template Outputs ─────────────────────────────────────────────────────────
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Welcome Template
export function WelcomeTemplate(data: WelcomeEmailData): EmailTemplate {
  const subject = `Welcome — Thanks for Signing Up!`;

  const body = `
    ${emailComponents.greeting(data.fullname)}
    ${emailComponents.paragraph('Welcome to FX Trading App')}
    ${emailComponents.credentialBox([{ label: 'Your OTP', value: data.otp }])}
  `;

  const html = baseEmailTemplate({
    body,
  });

  const text = `
      Hello ${data.fullname},

      Welcome to FX Trading App

      Your Login Details:
        Your OTP:            ${data.otp}
 `.trim();

  return { subject, html, text };
}

// Password Reset Template
export function passwordResetTemplate(
  data: PasswordResetEmailData,
): EmailTemplate {
  const subject = `Password Reset Request`;

  const body = `
    ${emailComponents.paragraph(
      'We received a request to reset the password for your account. Use the OTP Below.',
    )}
    
    ${emailComponents.divider()}
   
     ${emailComponents.credentialBox([{ label: 'Your OTP', value: data.otp }])}
  `;

  const html = baseEmailTemplate({ body });

  const text = `
      We received a request to reset your password.

      Use this OTP: ${data.otp}.

      If you did not request a password reset, please ignore this email.

      Warm regards,
  `.trim();

  return { subject, html, text };
}

// Password Changed Template
export function passwordChangedTemplate(
  data: PasswordChangedEmailData,
): EmailTemplate {
  const subject = `Your Password Was Changed`;

  const body = `
    ${emailComponents.paragraph(
      'We received a request to change the password for your account. Use the OTP Below.',
    )}
    
    ${emailComponents.divider()}
   
     ${emailComponents.credentialBox([{ label: 'Your OTP', value: data.otp }])}
  `;

  const html = baseEmailTemplate({ body });

  const text = `
      We received a request to change your password.

      Use this OTP: ${data.otp}.

      If you did not request a password change, please ignore this email.

      Warm regards,
  `.trim();

  return { subject, html, text };
}

// Generic Template
export function genericTemplate(data: GenericEmailData): EmailTemplate {
  const subject = data.subject;

  const body = emailComponents.paragraph(data.content);

  const html = baseEmailTemplate({
    body,
  });

  const text = data.content;

  return { subject, html, text };
}
