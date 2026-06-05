import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns unconfigured when Resend env is missing', async () => {
    const service = new EmailService(new ConfigService({}));

    await expect(service.sendAuthEmail({ type: 'password-reset', to: 'user@example.com', token: 'token' })).resolves.toEqual({
      delivered: false,
      provider: 'resend',
      reason: 'unconfigured',
    });
  });

  it('sends auth email through Resend when configured', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as typeof fetch;
    const service = new EmailService(
      new ConfigService({
        RESEND_API_KEY: 're_test',
        EMAIL_FROM: 'UMKM Builder <noreply@example.com>',
        APP_PUBLIC_URL: 'https://app.example.com',
      }),
    );

    await expect(service.sendAuthEmail({ type: 'email-verification', to: 'user@example.com', token: 'abc 123' })).resolves.toEqual({
      delivered: true,
      provider: 'resend',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer re_test' }),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(
      expect.objectContaining({
        from: 'UMKM Builder <noreply@example.com>',
        to: 'user@example.com',
      }),
    );
  });

  it('returns provider-error when Resend rejects the request', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 }) as typeof fetch;
    const service = new EmailService(
      new ConfigService({
        RESEND_API_KEY: 're_test',
        EMAIL_FROM: 'UMKM Builder <noreply@example.com>',
        APP_PUBLIC_URL: 'https://app.example.com',
      }),
    );

    await expect(service.sendAuthEmail({ type: 'password-reset', to: 'user@example.com', token: 'token' })).resolves.toEqual({
      delivered: false,
      provider: 'resend',
      reason: 'provider-error',
    });
  });
});
