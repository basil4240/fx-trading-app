export interface BaseEmailTemplateOptions {
  brandColor?: string;
  previewText?: string;
  body: string;
  year?: number;
}

/**
 * Wraps any email body in a consistent header + footer shell.
 * All styles are inline for maximum email client compatibility.
 */
export function baseEmailTemplate(options: BaseEmailTemplateOptions): string {
  const {
    brandColor = '#1188FF',
    previewText = '',
    body,
    year = new Date().getFullYear(),
  } = options;

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>FX Trading App</title>
        <!--[if mso]>
        <noscript>
          <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
        </noscript>
        <![endif]-->
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

        <!-- Preview text (hidden, shows in inbox snippet) -->
        ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

        <!-- Email wrapper -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f9;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">

                <!-- ─── HEADER ─────────────────────────────────────────────── -->
                <tr>
                  <td style="background-color:${brandColor};border-radius:8px 8px 0 0;padding:28px 40px;text-align:center;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                      FX Trading App
                    </h1>
                  </td>
                </tr>

                <!-- ─── BODY ──────────────────────────────────────────────── -->
                <tr>
                  <td style="background-color:#ffffff;padding:40px 40px 32px;border-left:1px solid #e8ecf0;border-right:1px solid #e8ecf0;">
                    ${body}
                  </td>
                </tr>

                <!-- ─── FOOTER ────────────────────────────────────────────── -->
                <tr>
                  <td style="background-color:#f8fafc;border:1px solid #e8ecf0;border-top:none;border-radius:0 0 8px 8px;padding:24px 40px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:12px;color:#8a94a6;line-height:1.5;">
                      This email was sent by <strong style="color:#5a6478;">FX Trading App</strong>.
                      If you did not expect this email, you can safely ignore it.
                    </p>
                    <p style="margin:0 0 12px;font-size:12px;color:#8a94a6;">
                      For support, please contact your system administrator.
                    </p>
                    <div style="border-top:1px solid #e8ecf0;margin:12px 0;"></div>
                    <p style="margin:0;font-size:11px;color:#b0b8c8;">
                      &copy; ${year} FX Trading App &mdash; All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
      </html>
  `.trim();
}

/**
 * Shared body components reused across templates
 */
export const emailComponents = {
  greeting: (name: string) =>
    `<p style="margin:0 0 16px;font-size:16px;color:#1a202c;font-weight:600;">Hello, ${name} 👋</p>`,

  paragraph: (text: string) =>
    `<p style="margin:0 0 16px;font-size:15px;color:#4a5568;line-height:1.7;">${text}</p>`,

  divider: () =>
    `<div style="border-top:1px solid #e8ecf0;margin:24px 0;"></div>`,

  button: (text: string, href: string, color = '#1188FF') =>
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
      <tr>
        <td style="background-color:${color};border-radius:6px;padding:0;">
          <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">${text}</a>
        </td>
      </tr>
    </table>`,

  credentialBox: (fields: { label: string; value: string }[]) =>
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f8fafc;border:1px solid #e8ecf0;border-radius:6px;margin:20px 0;">
      ${fields
        .map(
          ({ label, value }) => `
        <tr>
          <td style="padding:12px 20px;border-bottom:1px solid #e8ecf0;">
            <span style="display:block;font-size:11px;font-weight:600;color:#8a94a6;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">${label}</span>
            <span style="display:block;font-size:15px;color:#1a202c;font-weight:500;word-break:break-all;">${value}</span>
          </td>
        </tr>`,
        )
        .join('')}
    </table>`,

  warningBox: (text: string) =>
    `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;">
      <tr>
        <td style="background-color:#fffbeb;border:1px solid #f6d860;border-radius:6px;padding:14px 18px;">
          <p style="margin:0;font-size:13px;color:#92610a;line-height:1.6;">⚠️ &nbsp;${text}</p>
        </td>
      </tr>
    </table>`,

  signOff: (brandName: string) =>
    `<p style="margin:24px 0 0;font-size:14px;color:#4a5568;line-height:1.6;">Warm regards,<br/><strong style="color:#1a202c;">${brandName} Team</strong></p>`,
};
