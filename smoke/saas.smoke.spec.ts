import { APIRequestContext, expect, request, test } from '@playwright/test';

const password = 'Password12345';
const pngBytes = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

test.describe('SaaS smoke test', () => {
  test('covers login, logout, refresh token, create tenant, publish website, upload logo, and share panel', async ({ page, baseURL }) => {
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

    await test.step('upload logo and gallery through API', async () => {
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

      const attachLogo = await api.patch(`/api/v1/websites/${websiteId}/theme-assets`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { logoUrl: body.url },
      });
      expect(attachLogo.ok()).toBeTruthy();
      const websiteWithLogo = await attachLogo.json();
      expect(websiteWithLogo.theme.logoUrl).toBe(body.url);

      const publicFile = await api.get(body.url);
      expect(publicFile.ok()).toBeTruthy();
      expect(publicFile.headers()['content-type']).toContain('image/png');

      const galleryUpload = await api.post('/api/v1/uploads/gallery', {
        headers: { Authorization: `Bearer ${accessToken}` },
        multipart: {
          file: {
            name: 'gallery.png',
            mimeType: 'image/png',
            buffer: pngBytes,
          },
        },
      });
      expect(galleryUpload.ok()).toBeTruthy();
      const galleryBody = await galleryUpload.json();
      const attachGallery = await api.post(`/api/v1/websites/${websiteId}/gallery`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { imageUrl: galleryBody.url, altText: 'Smoke gallery' },
      });
      expect(attachGallery.ok()).toBeTruthy();
      const websiteWithGallery = await attachGallery.json();
      expect(websiteWithGallery.galleries.length).toBeGreaterThan(0);
    });

    await test.step('verify pilot-ready dashboard and share UI', async () => {
      await page.goto('/app/dashboard');
      await expect(page.getByText('Website readiness')).toBeVisible();
      await expect(page.getByText('Logo uploaded')).toBeVisible();
      await expect(page.getByText('Gallery')).toBeVisible();

      await page.goto(`/app/websites/${websiteId}`);
      await expect(page.getByText('Branding assets')).toBeVisible();
      await expect(page.getByText('Publish & share')).toBeVisible();
      await expect(page.getByText(`/site/${slug}`)).toBeVisible();
      await expect(page.getByRole('link', { name: /share whatsapp/i })).toHaveAttribute('href', /wa\.me/);
    });

    await test.step('verify mobile owner flow at 390x844', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/app/dashboard');
      await expect(page.getByText('Website readiness')).toBeVisible();
      await page.goto(`/app/websites/${websiteId}`);
      await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
      await expect(page.getByText('Branding assets')).toBeVisible();
      await expect(page.getByText('Publish & share')).toBeVisible();
    });

    await test.step('logout through UI', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.getByRole('button', { name: /logout/i }).click();
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    await api.dispose();
  });

  test('validates warteg-moncer restaurant CTA visibility across viewports', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    await ensureWartegMoncerDemo(api);

    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 1100 },
    ];

    for (const viewport of viewports) {
      await test.step(`verify restaurant CTAs on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/site/warteg-moncer');

        await expect(page.getByText('Restaurant landing page')).toBeVisible();

        const hero = page.locator('#home');
        await expect(hero.getByRole('link', { name: /chat whatsapp/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /view menu/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /get directions/i })).toBeVisible();
        await expect(page.locator('#contact a[data-template-cta]').first()).toBeVisible();
        await expect(page.locator('footer a[data-template-cta]').first()).toBeVisible();

        const ctas = page.locator('a[data-template-cta]');
        const count = await ctas.count();
        expect(count).toBeGreaterThan(0);

        for (let index = 0; index < count; index += 1) {
          const cta = ctas.nth(index);
          await expect(cta).toBeVisible();
          expect((await cta.textContent())?.trim().length ?? 0).toBeGreaterThan(0);
          await expect(cta.locator('svg')).toHaveCount(1);
          await expect(cta).toHaveAttribute('href', /.+/);
        }
      });
    }

    await api.dispose();
  });
});

async function ensureWartegMoncerDemo(api: APIRequestContext) {
  const existing = await api.get('/api/v1/public/site/warteg-moncer');
  if (existing.ok()) return;

  const email = 'admin@warteg-moncer.demo';
  const password = 'Password12345';
  const tenantSlug = 'warteg-moncer';

  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'WARTEG MONCER',
      slug: tenantSlug,
      adminName: 'Demo Admin',
      email,
      password,
      businessType: 'WARTEG',
    },
  });
  expect(register.ok()).toBeTruthy();

  const login = await api.post('/api/v1/auth/login', {
    data: { email, password, tenantSlug },
  });
  expect(login.ok()).toBeTruthy();
  const session = await login.json();

  const websites = await api.get('/api/v1/websites', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect(websites.ok()).toBeTruthy();
  const [website] = await websites.json();
  expect(website?.id).toBeTruthy();

  const update = await api.put(`/api/v1/websites/${website.id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    data: {
      businessName: 'WARTEG MONCER',
      tagline: 'Masakan rumahan hangat untuk makan siang cepat.',
      description: 'Warteg demo untuk validasi restaurant template dengan CTA WhatsApp, menu, dan maps.',
      address: 'Jl. Demo UMKM No. 9, Jakarta',
      phone: '02175001001',
      whatsapp: '081210010010',
      email: 'halo@warteg-moncer.demo',
      mapsUrl: 'https://maps.google.com',
    },
  });
  expect(update.ok()).toBeTruthy();

  const publish = await api.patch(`/api/v1/websites/${website.id}/publish`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect(publish.ok()).toBeTruthy();
}
