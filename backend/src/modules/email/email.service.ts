import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AuthEmailType = 'password-reset' | 'email-verification';

type AuthEmailPayload = {
  type: AuthEmailType;
  to: string;
  token: string;
};

type EmailDeliveryResult = {
  delivered: boolean;
  provider: 'resend';
  reason?: 'unconfigured' | 'provider-error';
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendAuthEmail(payload: AuthEmailPayload): Promise<EmailDeliveryResult> {
    const apiKey = this.config.get<string>('RESEND_API_KEY', '').trim();
    const from = this.config.get<string>('EMAIL_FROM', '').trim();
    const appUrl = this.config.get<string>('APP_PUBLIC_URL', '').trim();

    if (!apiKey || !from || !appUrl) {
      return { delivered: false, provider: 'resend', reason: 'unconfigured' };
    }

    const content = this.buildAuthEmail(payload, appUrl);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: payload.to,
          subject: content.subject,
          html: content.html,
          text: content.text,
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Resend email delivery failed with status ${response.status}`);
        return { delivered: false, provider: 'resend', reason: 'provider-error' };
      }

      return { delivered: true, provider: 'resend' };
    } catch (error) {
      this.logger.warn(`Resend email delivery failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      return { delivered: false, provider: 'resend', reason: 'provider-error' };
    }
  }

  private buildAuthEmail(payload: AuthEmailPayload, appUrl: string) {
    const baseUrl = appUrl.replace(/\/$/, '');
    const path = payload.type === 'password-reset' ? '/auth/reset-password' : '/auth/verify-email';
    const actionUrl = `${baseUrl}${path}?token=${encodeURIComponent(payload.token)}`;
    const title = payload.type === 'password-reset' ? 'Reset password UMKM Builder' : 'Verifikasi email UMKM Builder';
    const intro =
      payload.type === 'password-reset'
        ? 'Gunakan link berikut untuk membuat password baru.'
        : 'Gunakan link berikut untuk memverifikasi alamat email akun UMKM Builder.';

    return {
      subject: title,
      text: `${intro}\n\n${actionUrl}\n\nJika Anda tidak meminta email ini, abaikan pesan ini.`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h1 style="font-size:20px">${title}</h1>
          <p>${intro}</p>
          <p><a href="${actionUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none">Buka link</a></p>
          <p style="font-size:13px;color:#475569">Jika tombol tidak bisa dibuka, salin link ini:</p>
          <p style="font-size:13px;color:#475569">${actionUrl}</p>
          <p style="font-size:13px;color:#475569">Jika Anda tidak meminta email ini, abaikan pesan ini.</p>
        </div>
      `,
    };
  }
}
