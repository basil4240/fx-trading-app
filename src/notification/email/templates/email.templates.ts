import {
  FundingFailedEmailJob,
  FundingSuccessEmailJob,
  GenericEmailJob,
  PasswordChangedEmailJob,
  PasswordResetEmailJob,
  TradeConfirmationEmailJob,
  WelcomeEmailJob,
} from '../dto/email-job.dto';

// ─── Shared Styles ───────────────────────────────────────────────────────────

const primaryColor = '#007bff';
const secondaryColor = '#6c757d';
const successColor = '#28a745';
const dangerColor = '#dc3545';

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; border: 1px solid #e9e9e9; border-radius: 8px; overflow: hidden; }
    .header { background-color: ${primaryColor}; color: #ffffff; padding: 20px; text-align: center; }
    .content { padding: 30px; }
    .footer { background-color: #f8f9fa; color: ${secondaryColor}; padding: 15px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
    .otp { font-size: 32px; font-weight: bold; color: ${primaryColor}; letter-spacing: 5px; margin: 20px 0; text-align: center; }
    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .data-table td { padding: 10px; border-bottom: 1px solid #eee; }
    .data-table td:first-child { font-weight: bold; color: ${secondaryColor}; width: 40%; }
    .success { color: ${successColor}; font-weight: bold; }
    .danger { color: ${dangerColor}; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FX Trading App</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} FX Trading App. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

// ─── Templates ───────────────────────────────────────────────────────────────

export const WelcomeTemplate = (data: WelcomeEmailJob['data']) => ({
  subject: 'Welcome to FX Trading App!',
  html: baseLayout(`
    <h2>Hello, ${data.fullname}!</h2>
    <p>We're excited to have you on board. To complete your registration, please use the following verification code:</p>
    <div class="otp">${data.otp}</div>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `),
  text: `Hello, ${data.fullname}! Welcome to FX Trading App. Your verification code is: ${data.otp}`,
});

export const passwordResetTemplate = (data: PasswordResetEmailJob['data']) => ({
  subject: 'Reset Your Password',
  html: baseLayout(`
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Please use the following code to proceed:</p>
    <div class="otp">${data.otp}</div>
    <p>This code will expire in 2 minutes. If you didn't request this, please secure your account immediately.</p>
  `),
  text: `You requested a password reset. Your code is: ${data.otp}. It expires in 2 minutes.`,
});

export const passwordChangedTemplate = (
  data: PasswordChangedEmailJob['data'],
) => ({
  subject: 'Password Changed Successfully',
  html: baseLayout(`
    <h2>Password Changed</h2>
    <p>Your password has been changed successfully. If you did not perform this action, please contact support immediately.</p>
    <div class="otp">${data.otp}</div>
  `),
  text: `Your password has been changed successfully. Verification code: ${data.otp}`,
});

export const genericTemplate = (data: GenericEmailJob['data']) => ({
  subject: data.subject,
  html: baseLayout(`
    <p>${data.content}</p>
  `),
  text: data.content,
});

export const fundingSuccessTemplate = (data: FundingSuccessEmailJob['data']) => ({
  subject: 'Wallet Funded Successfully!',
  html: baseLayout(`
    <h2 class="success">Deposit Confirmed</h2>
    <p>Your wallet has been successfully funded. The details of your transaction are below:</p>
    <table class="data-table">
      <tr><td>Amount</td><td>${data.amount} ${data.currency}</td></tr>
      <tr><td>Reference</td><td>${data.reference}</td></tr>
      <tr><td>Status</td><td class="success">Completed</td></tr>
    </table>
    <p>You can now use these funds for trading.</p>
  `),
  text: `Your wallet has been successfully funded with ${data.amount} ${data.currency}. Reference: ${data.reference}`,
});

export const fundingFailedTemplate = (data: FundingFailedEmailJob['data']) => ({
  subject: 'Wallet Funding Failed',
  html: baseLayout(`
    <h2 class="danger">Deposit Failed</h2>
    <p>Unfortunately, your attempt to fund your wallet was not successful.</p>
    <table class="data-table">
      <tr><td>Amount</td><td>${data.amount} ${data.currency}</td></tr>
      <tr><td>Reference</td><td>${data.reference}</td></tr>
      <tr><td>Reason</td><td class="danger">${data.reason || 'Transaction declined by provider'}</td></tr>
    </table>
    <p>Please try again or contact support if the issue persists.</p>
  `),
  text: `Your attempt to fund your wallet with ${data.amount} ${data.currency} failed. Reference: ${data.reference}`,
});

export const tradeConfirmationTemplate = (data: TradeConfirmationEmailJob['data']) => ({
  subject: 'Trade Confirmation',
  html: baseLayout(`
    <h2>Trade Receipt</h2>
    <p>A currency conversion has been successfully executed on your account.</p>
    <table class="data-table">
      <tr><td>Spent</td><td>${data.fromAmount} ${data.fromCurrency}</td></tr>
      <tr><td>Received</td><td>${data.toAmount} ${data.toCurrency}</td></tr>
      <tr><td>Exchange Rate</td><td>1 ${data.fromCurrency} = ${data.rate} ${data.toCurrency}</td></tr>
      <tr><td>Fee</td><td>${data.fee} ${data.toCurrency}</td></tr>
      <tr><td>Reference</td><td>${data.reference}</td></tr>
    </table>
    <p>Thank you for trading with us!</p>
  `),
  text: `Trade executed: Spent ${data.fromAmount} ${data.fromCurrency}, Received ${data.toAmount} ${data.toCurrency} at rate ${data.rate}.`,
});
