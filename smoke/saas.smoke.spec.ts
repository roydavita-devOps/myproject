import { expect, request, test } from '@playwright/test';

const password = 'Password12345';
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);

test.describe('SaaS smoke test', () => {
  test('covers login, logout, refresh token, create tenant, publish website, and upload logo', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    const stamp = Date.now();
    const slug = `smoke-${stamp}`;
    const email = `smoke-${stamp}@example.com`;

    await test.step('create tenant through registration API', async () => {
      const response = await api.post('/api/v1/auth/register', {
        data: {
          businessName: `Smoke Tenant ${stamp}`,
          slug,
          adminName: 'Smoke Admin',
          email,
          password,
          businessType: 'CAFE',
        },
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.user.email).toBe(email);
    });

    await test.step('login through UI', async () => {
      await page.goto('/auth/login');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByLabel('Tenant slug').fill(slug);
      await page.getByRole('button', { name: /login/i }).click();
      await expect(page).toHaveURL(/\/app\/dashboard/);
      await expect(page.getByText(email)).toBeVisible();
    });

    let accessToken = '';
    let refreshToken = '';
    let websiteId = '';

    await test.step('login and refresh token through API', async () => {
      const login = await api.post('/api/v1/auth/login', {
        data: { email, password, tenantSlug: slug },
      });
      expect(login.ok()).toBeTruthy();
      const session = await login.json();
      accessToken = session.accessToken;
      refreshToken = session.refreshToken;

      const refresh = await api.post('/api/v1/auth/refresh', {
        data: { refreshToken },
      });
      expect(refresh.ok()).toBeTruthy();
      const refreshed = await refresh.json();
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      expect(refreshed.user.email).toBe(email);
    });

    await test.step('publish website through API', async () => {
      const websites = await api.get('/api/v1/websites', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(websites.ok()).toBeTruthy();
      const websiteList = await websites.json();
      expect(websiteList.length).toBeGreaterThan(0);
      websiteId = websiteList[0].id;

      const publish = await api.patch(`/api/v1/websites/${websiteId}/publish`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(publish.ok()).toBeTruthy();
      const published = await publish.json();
      expect(published.status).toBe('PUBLISHED');

      const publicSite = await api.get(`/api/v1/public/site/${slug}`);
      expect(publicSite.ok()).toBeTruthy();
      const publicBody = await publicSite.json();
      expect(publicBody.businessName).toBe(`Smoke Tenant ${stamp}`);
    });

    await test.step('upload logo through API', async () => {
      const upload = await api.post('/api/v1/uploads/logo', {
        headers: { Authorization: `Bearer ${accessToken}` },
        multipart: {
          file: {
            name: 'logo.png',
            mimeType: 'image/png',
            buffer: pngBytes,
          },
        },
      });
      expect(upload.ok()).toBeTruthy();
      const body = await upload.json();
      expect(body.assetType).toBe('logo');
      expect(body.url).toContain('/api/v1/uploads/');

      const publicFile = await api.get(body.url);
      expect(publicFile.ok()).toBeTruthy();
      expect(publicFile.headers()['content-type']).toContain('image/png');
    });

    await test.step('logout through UI', async () => {
      await page.getByRole('button', { name: /logout/i }).click();
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    await api.dispose();
  });
});
