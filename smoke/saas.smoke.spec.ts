import { APIRequestContext, Page, expect, request, test } from '@playwright/test';

const password = 'Password12345';
const pngBytes = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAMUlEQVRIiWNQTX79n5aYYdQC1dEgUh1NRaqjGS15tKhIHi1Nk0crnNejVebrwd2qAABNdoDM/L94YAAAAABJRU5ErkJggg==',
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
      await expect(page.getByLabel('Tenant slug')).toHaveCount(0);
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
      expect(body.url).toContain('-medium.webp');
      expect(body.mimeType).toBe('image/webp');

      const attachLogo = await api.patch(`/api/v1/websites/${websiteId}/theme-assets`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { logoUrl: body.url },
      });
      expect(attachLogo.ok()).toBeTruthy();
      const websiteWithLogo = await attachLogo.json();
      expect(websiteWithLogo.theme.logoUrl).toBe(body.url);

      const publicFile = await api.get(body.url);
      expect(publicFile.ok()).toBeTruthy();
      expect(publicFile.headers()['content-type']).toContain('image/webp');

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
      expect(galleryBody.url).toContain('-large.webp');
      expect(galleryBody.mimeType).toBe('image/webp');
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
      await expect(page.getByText(`/site/${slug}`).first()).toBeVisible();
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
        await expect(page.getByText('Why choose us')).toBeVisible();
        await expect(page.getByText('Our quality commitment')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Gallery' })).toBeVisible();
        await expect(page.getByText('Business information')).toBeVisible();

        await assertTemplateCtas(page);
      });
    }

    await api.dispose();
  });

  test('validates laundry-suka-suka laundry template across viewports', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    await ensureLaundrySukaSukaDemo(api);

    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 1100 },
    ];

    for (const viewport of viewports) {
      await test.step(`verify laundry template on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/site/laundry-suka-suka');

        await expect(page.getByText('Laundry service website')).toBeVisible();
        await expect(page.getByRole('link', { name: /schedule pickup/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /view services/i })).toBeVisible();
        await expect(page.getByText('Layanan laundry yang mudah dipilih')).toBeVisible();
        await expect(page.getByText('Why choose us')).toBeVisible();
        await expect(page.getByText('Pickup & delivery')).toBeVisible();
        await expect(page.getByText('Process timeline')).toBeVisible();
        await expect(page.getByText('Our laundry process')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Gallery' })).toBeVisible();
        await expect(page.getByText('Business information')).toBeVisible();

        await assertTemplateCtas(page);
      });
    }

    await api.dispose();
  });

  test('validates clinic-sehat-sentosa clinic template across viewports', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    await ensureClinicSehatSentosaDemo(api);

    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 1100 },
    ];

    for (const viewport of viewports) {
      await test.step(`verify clinic template on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/site/clinic-sehat-sentosa');

        await expect(page.getByText('Clinic professional website')).toBeVisible();
        const hero = page.locator('#home');
        await expect(hero.getByRole('link', { name: /book appointment/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /view services/i })).toBeVisible();
        await expect(page.getByText('Healthcare services patients can understand')).toBeVisible();
        await expect(page.getByText('Healthcare professionals')).toBeVisible();
        await expect(page.getByText('Appointment process')).toBeVisible();
        await expect(page.getByText('Opening hours, location, and contact')).toBeVisible();
        await expect(page.getByText('Need clinic information today?')).toBeVisible();

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

  test('validates corporate-maju-bersama corporate template across viewports', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    await ensureCorporateMajuBersamaDemo(api);

    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 1100 },
    ];

    for (const viewport of viewports) {
      await test.step(`verify corporate template on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/site/corporate-maju-bersama');

        await expect(page.getByText('Corporate executive website')).toBeVisible();
        const hero = page.locator('#home');
        await expect(hero.getByRole('link', { name: /start consultation/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /view services/i })).toBeVisible();
        await expect(page.getByText('Built for clear executive communication')).toBeVisible();
        await expect(page.getByText('Professional services for business growth')).toBeVisible();
        await expect(page.getByText('Why choose us')).toBeVisible();
        await expect(page.getByText('Experienced leadership team')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Client logos' })).toBeVisible();
        await expect(page.getByText('Discuss a business engagement')).toBeVisible();

        await assertTemplateCtas(page);
      });
    }

    await api.dispose();
  });

  test('validates cafe-senja-modern cafe template across viewports', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    await ensureCafeSenjaModernDemo(api);

    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 1100 },
    ];

    for (const viewport of viewports) {
      await test.step(`verify cafe template on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/site/cafe-senja-modern');

        await expect(page.getByText('Cafe modern website')).toBeVisible();
        const hero = page.locator('#home');
        await expect(hero.getByRole('link', { name: /chat cafe/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /view menu/i })).toBeVisible();
        await expect(page.getByText('Cafe menu made easy to browse')).toBeVisible();
        await expect(page.getByText('Drinks worth coming back for')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Gallery' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
        await expect(page.getByText('Location and opening hours')).toBeVisible();
        await expect(page.getByText('Plan your next coffee visit')).toBeVisible();

        await assertTemplateCtas(page);
      });
    }

    await api.dispose();
  });

  test('validates restaurant premium template sections across viewports', async ({ page, baseURL }) => {
    await page.route('**/api/v1/public/site/restaurant-premium-demo', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildPremiumWebsitePayload('restaurant_premium')),
      });
    });

    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 1100 },
    ];

    for (const viewport of viewports) {
      await test.step(`verify restaurant premium on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${baseURL}/site/restaurant-premium-demo`);

        await expect(page.locator('main')).toHaveAttribute('data-template-key', 'restaurant_premium');
        await expect(page.getByText('Restaurant reservations')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Dishes Worth the Visit' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'From the Kitchen to the Table' })).toBeVisible();
        const services = page.locator('#signature-dishes');
        await expect(services.getByText('Chef Signature Rice Set')).toBeVisible();
        await expect(services.getByText('Slow Cooked Beef Plate')).toBeVisible();
        await expect(services.getByText('Seasonal Family Platter')).toHaveCount(0);
        await services.getByRole('button', { name: /explore full menu/i }).click();
        const dialog = page.getByRole('dialog', { name: /full restaurant menu/i });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button', { name: /all/i })).toBeVisible();
        await expect(dialog.getByText('Chef Signature Rice Set')).toBeVisible();
        await expect(dialog.getByText('Seasonal Family Platter')).toBeVisible();
        await dialog.getByRole('button', { name: /close full menu/i }).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole('heading', { name: 'Ambience Gallery' })).toBeVisible();
        await expect(page.getByText('Reserve your table tonight')).toBeVisible();
        const hero = page.locator('#home');
        await expect(page.locator('header').getByRole('link', { name: /reserve a table/i })).toBeVisible();
        if (viewport.width >= 768) {
          await expect(page.locator('header').getByRole('link', { name: 'Visit' })).toHaveAttribute('href', '#visit-reservation');
        }
        await expect(hero.getByRole('link', { name: /reserve a table/i })).toHaveCount(0);
        await expect(hero.getByRole('link', { name: /explore signature dishes/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /get directions/i })).toBeVisible();
        await expect(hero.getByText('Tue - Sat, 11.00 - 22.00')).toBeVisible();
        await expect(page.locator('#visit-reservation').getByText('Tue - Sat, 11.00 - 22.00')).toBeVisible();
        await expect(page.getByText(/mode:|openTime:|closeTime:|specific/)).toHaveCount(0);
        await expect(page.getByText('Reserve via WhatsApp')).toBeVisible();
        await expect(page.getByText('Call Restaurant')).toBeVisible();

        await assertTemplateCtas(page);
      });
    }
  });

  test('validates cafe premium template sections across viewports', async ({ page, baseURL }) => {
    await page.route('**/api/v1/public/site/cafe-premium-demo', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildPremiumWebsitePayload('cafe_premium')),
      });
    });

    const viewports = [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 1100 },
    ];

    for (const viewport of viewports) {
      await test.step(`verify cafe premium on ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${baseURL}/site/cafe-premium-demo`);

        await expect(page.locator('main')).toHaveAttribute('data-template-key', 'cafe_premium');
        await expect(page.getByText('Specialty coffee corner')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Crafted for Slow Mornings' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Fresh From the Bar' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Morning Favorites' })).toBeVisible();
        const services = page.locator('#signature-brews');
        await expect(services.getByText('House Reserve Latte')).toBeVisible();
        await expect(services.getByText('Weekend Brunch Plate')).toBeVisible();
        await expect(services.getByText('Single Origin Pour Over')).toHaveCount(0);
        await services.getByRole('button', { name: /open cafe menu/i }).click();
        const dialog = page.getByRole('dialog', { name: /coffee & bites/i });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button', { name: /all/i })).toBeVisible();
        await expect(dialog.getByText('House Reserve Latte')).toBeVisible();
        await expect(dialog.getByText('Single Origin Pour Over')).toBeVisible();
        await expect(dialog.getByText('Chat WhatsApp')).toHaveCount(0);
        await dialog.getByRole('button', { name: /close full menu/i }).click();
        await expect(dialog).toBeHidden();
        await expect(page.getByRole('heading', { name: /Inside the Cafe|Slow Corners/ })).toBeVisible();
        await expect(page.getByText('Plan your next coffee visit')).toBeVisible();
        const hero = page.locator('#home');
        await expect(hero.getByRole('link', { name: /explore menu/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /get directions/i })).toBeVisible();
        await expect(hero.getByRole('link', { name: /chat whatsapp|message cafe/i })).toHaveCount(0);

        await assertTemplateCtas(page);
      });
    }
  });

  test('allows a restaurant tenant to apply Restaurant Premium and render it publicly', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    const stamp = Date.now();
    const slug = `restaurant-template-${stamp}`;
    const email = `restaurant-template-${stamp}@example.com`;
    const session = await createTemplateSelectionTenant(api, {
      businessName: `Restaurant Template ${stamp}`,
      slug,
      email,
      businessType: 'RESTAURANT',
    });

    await seedSession(page, session);
    await page.goto(`/app/websites/${session.websiteId}`);
    await expect(page.getByText('Business slug')).toBeVisible();
    await expect(page.getByLabel('Public URL slug')).toHaveValue(slug);
    await page.getByLabel('Open Time').fill('12:00');
    await page.getByLabel('Close Time').fill('21:00');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByLabel('Open Time')).toHaveValue('12:00');
    await expect(page.getByLabel('Close Time')).toHaveValue('21:00');
    await expect.poll(async () => {
      const response = await api.get(`/api/v1/websites/${session.websiteId}`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const website = await response.json();
      return `${website.openingHours?.openTime}-${website.openingHours?.closeTime}`;
    }).toBe('12:00-21:00');

    const category = await api.post('/api/v1/menu-categories', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      data: { websiteId: session.websiteId, name: 'asdasda' },
    });
    expect(category.ok()).toBeTruthy();
    const categoryBody = await category.json();
    const menuItem = await api.post('/api/v1/menus', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      data: { websiteId: session.websiteId, categoryId: categoryBody.id, name: 'Safe Category Delete Dish', price: 42000 },
    });
    expect(menuItem.ok()).toBeTruthy();

    await page.goto('/app/menu');
    const typoCategoryRow = page.locator('span').filter({ hasText: /^asdasda$/ }).first();
    await expect(typoCategoryRow).toBeVisible();
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Menu items in this category will be moved to No category.');
      await dialog.accept();
    });
    await typoCategoryRow.locator('..').getByRole('button', { name: /delete/i }).click();
    await expect(page.locator('span').filter({ hasText: /^asdasda$/ })).toHaveCount(0);
    await expect(page.locator('input[value="Safe Category Delete Dish"]')).toBeVisible();

    await page.goto(`/app/websites/${session.websiteId}/templates`);

    await expect(page.getByRole('heading', { name: 'Templates', exact: true })).toBeVisible();
    const restaurantClassic = page.getByTestId('template-section-classic-templates').locator('article').filter({ hasText: 'Restaurant Classic' });
    await expect(restaurantClassic.getByRole('button', { name: /^current$/i })).toBeVisible();
    const restaurantPremium = page.getByTestId('template-section-premium-templates').locator('article').filter({ hasText: 'Restaurant Premium' });
    await expect(restaurantPremium.getByText('Premium', { exact: true })).toBeVisible();
    await expect(restaurantPremium.getByText('Approved Premium', { exact: true })).toBeVisible();
    await restaurantPremium.getByRole('button', { name: /use template/i }).click();
    await expect(page.getByRole('dialog', { name: /change template to restaurant premium/i })).toBeVisible();
    await page.getByRole('button', { name: /confirm change/i }).click();
    await expect(restaurantPremium.getByRole('button', { name: /^current$/i })).toBeVisible();

    const publicSite = await api.get(`/api/v1/public/site/${slug}`);
    expect(publicSite.ok()).toBeTruthy();
    const publicBody = await publicSite.json();
    expect(publicBody.template.schema.templateKey).toBe('restaurant_premium');

    await page.goto(`/site/${slug}`);
    await expect(page.locator('main')).toHaveAttribute('data-template-key', 'restaurant_premium');
    await expect(page.getByText('Restaurant reservations')).toBeVisible();
    await expect(page.getByText('Daily, 12.00 - 21.00').first()).toBeVisible();

    await api.dispose();
  });

  test('allows a cafe tenant to apply Cafe Premium and render it publicly', async ({ page, baseURL }) => {
    const api = await request.newContext({ baseURL });
    const stamp = Date.now();
    const slug = `cafe-template-${stamp}`;
    const email = `cafe-template-${stamp}@example.com`;
    const session = await createTemplateSelectionTenant(api, {
      businessName: `Cafe Template ${stamp}`,
      slug,
      email,
      businessType: 'CAFE',
    });

    await seedSession(page, session);
    await page.goto(`/app/websites/${session.websiteId}/templates`);

    await expect(page.getByRole('heading', { name: 'Templates', exact: true })).toBeVisible();
    const cafeModern = page.getByTestId('template-section-classic-templates').locator('article').filter({ hasText: 'Cafe Modern' });
    await expect(cafeModern.getByRole('button', { name: /^current$/i })).toBeVisible();
    const cafePremium = page.getByTestId('template-section-premium-templates').locator('article').filter({ hasText: 'Cafe Premium' });
    await expect(cafePremium.getByText('Premium', { exact: true })).toBeVisible();
    await expect(cafePremium.getByText('Approved Premium', { exact: true })).toBeVisible();
    await cafePremium.getByRole('button', { name: /use template/i }).click();
    await expect(page.getByRole('dialog', { name: /change template to cafe premium/i })).toBeVisible();
    await page.getByRole('button', { name: /confirm change/i }).click();
    await expect(cafePremium.getByRole('button', { name: /^current$/i })).toBeVisible();

    const publicSite = await api.get(`/api/v1/public/site/${slug}`);
    expect(publicSite.ok()).toBeTruthy();
    const publicBody = await publicSite.json();
    expect(publicBody.template.schema.templateKey).toBe('cafe_premium');

    await page.goto(`/site/${slug}`);
    await expect(page.locator('main')).toHaveAttribute('data-template-key', 'cafe_premium');
    await expect(page.getByText('Specialty coffee corner')).toBeVisible();
    await expect(page.getByRole('link', { name: /explore menu/i })).toBeVisible();

    await api.dispose();
  });
});

async function assertTemplateCtas(page: Page) {
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
}

function buildPremiumWebsitePayload(templateKey: 'restaurant_premium' | 'cafe_premium') {
  const isRestaurant = templateKey === 'restaurant_premium';

  return {
    id: `${templateKey}-website`,
    tenantId: `${templateKey}-tenant`,
    tenant: { slug: isRestaurant ? 'restaurant-premium-demo' : 'cafe-premium-demo' },
    templateId: `${templateKey}-template`,
    themeId: `${templateKey}-theme`,
    status: 'PUBLISHED',
    businessName: isRestaurant ? 'Restaurant Premium Demo' : 'Cafe Premium Demo',
    tagline: isRestaurant ? 'Curated dining for memorable local occasions.' : 'Specialty coffee, brunch, and slow everyday moments.',
    description: isRestaurant
      ? 'Premium restaurant validation tenant for chef story, signature dishes, reservation CTA, gallery, reviews, and contact flows.'
      : 'Premium cafe validation tenant for brand story, signature menu, visit planning, gallery, reviews, and contact flows.',
    address: isRestaurant ? 'Jl. Premium Dining No. 17, Jakarta' : 'Jl. Kopi Premium No. 21, Bandung',
    phone: isRestaurant ? '02160001006' : '02260001007',
    whatsapp: isRestaurant ? '081260010060' : '081270010070',
    email: isRestaurant ? 'reserve@restaurant-premium.demo' : 'hello@cafe-premium.demo',
    mapsUrl: 'https://maps.google.com',
    openingHours: isRestaurant
      ? {
          mode: 'specific',
          days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          openTime: '11:00',
          closeTime: '22:00',
        }
      : {
          mode: 'daily',
          openTime: '08:00',
          closeTime: '23:00',
        },
    template: {
      id: `${templateKey}-template`,
      name: templateKey,
      businessType: isRestaurant ? 'RESTAURANT' : 'CAFE',
      schema: { templateKey, rendererKey: templateKey },
    },
    theme: {
      id: `${templateKey}-theme`,
      name: `${templateKey} theme`,
      primaryColor: isRestaurant ? '#1f2937' : '#0f766e',
      secondaryColor: isRestaurant ? '#f7c873' : '#f97316',
      accentColor: isRestaurant ? '#0f766e' : '#facc15',
    },
    categories: isRestaurant
      ? [
          { id: 'rp-cat-signature', websiteId: `${templateKey}-website`, name: 'Signature Plates', sortOrder: 1 },
          { id: 'rp-cat-family', websiteId: `${templateKey}-website`, name: 'Family Menu', sortOrder: 2 },
        ]
      : [
          { id: 'cp-cat-drinks', websiteId: `${templateKey}-website`, name: 'Drinks', sortOrder: 1 },
          { id: 'cp-cat-brunch', websiteId: `${templateKey}-website`, name: 'Brunch', sortOrder: 2 },
        ],
    menus: isRestaurant
      ? [
          { id: 'rp-menu-1', websiteId: `${templateKey}-website`, categoryId: 'rp-cat-signature', name: 'Chef Signature Rice Set', description: 'House signature rice with curated sides.', price: '58000', isFeatured: true, sortOrder: 1 },
          { id: 'rp-menu-2', websiteId: `${templateKey}-website`, categoryId: 'rp-cat-signature', name: 'Slow Cooked Beef Plate', description: 'Tender beef with aromatic spices.', price: '68000', isFeatured: true, sortOrder: 2 },
          { id: 'rp-menu-3', websiteId: `${templateKey}-website`, categoryId: 'rp-cat-family', name: 'Seasonal Family Platter', description: 'Shareable premium platter.', price: '128000', isFeatured: false, sortOrder: 3 },
        ]
      : [
          { id: 'cp-menu-1', websiteId: `${templateKey}-website`, categoryId: 'cp-cat-drinks', name: 'House Reserve Latte', description: 'Espresso blend with balanced house syrup.', price: '42000', isFeatured: true, sortOrder: 1 },
          { id: 'cp-menu-2', websiteId: `${templateKey}-website`, categoryId: 'cp-cat-drinks', name: 'Single Origin Pour Over', description: 'Rotating beans brewed by hand.', price: '48000', isFeatured: false, sortOrder: 2 },
          { id: 'cp-menu-3', websiteId: `${templateKey}-website`, categoryId: 'cp-cat-brunch', name: 'Weekend Brunch Plate', description: 'Warm toast with seasonal garnish.', price: '68000', isFeatured: true, sortOrder: 3 },
          { id: 'cp-menu-4', websiteId: `${templateKey}-website`, categoryId: 'cp-cat-drinks', name: 'Craft Mocktail Coffee', description: 'Bright non-alcoholic coffee drink.', price: '46000', isFeatured: false, sortOrder: 4 },
        ],
    galleries: [],
    reviews: [],
  };
}

async function createTemplateSelectionTenant(
  api: APIRequestContext,
  input: { businessName: string; slug: string; email: string; businessType: string },
) {
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: input.businessName,
      slug: input.slug,
      adminName: 'Template Admin',
      email: input.email,
      password,
      businessType: input.businessType,
    },
  });
  expect(register.ok()).toBeTruthy();
  const session = await register.json();

  const websites = await api.get('/api/v1/websites', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect(websites.ok()).toBeTruthy();
  const [website] = await websites.json();
  expect(website?.id).toBeTruthy();

  const update = await api.put(`/api/v1/websites/${website.id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    data: {
      businessName: input.businessName,
      tagline: 'Template selection validation tenant.',
      description: 'Smoke tenant used to validate template selection persistence and public rendering.',
      address: 'Jl. Template Selection No. 1, Jakarta',
      phone: '02170001008',
      whatsapp: '081280010080',
      email: input.email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { display: 'Daily, 12.00 - 21.00' },
    },
  });
  expect(update.ok()).toBeTruthy();

  const publish = await api.patch(`/api/v1/websites/${website.id}/publish`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect(publish.ok()).toBeTruthy();

  return {
    ...session,
    websiteId: website.id,
  };
}

async function seedSession(page: Page, session: { accessToken: string; refreshToken: string; user: unknown }) {
  await page.addInitScript((authSession) => {
    window.localStorage.setItem('umkm.accessToken', authSession.accessToken);
    window.localStorage.setItem('umkm.refreshToken', authSession.refreshToken);
    window.localStorage.setItem('umkm.user', JSON.stringify(authSession.user));
  }, session);
}

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

async function ensureLaundrySukaSukaDemo(api: APIRequestContext) {
  const existing = await api.get('/api/v1/public/site/laundry-suka-suka');
  if (existing.ok()) return;

  const email = 'admin@laundry-suka-suka.demo';
  const password = 'Password12345';
  const tenantSlug = 'laundry-suka-suka';

  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Laundry Suka Suka',
      slug: tenantSlug,
      adminName: 'Demo Admin',
      email,
      password,
      businessType: 'LAUNDRY',
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
      businessName: 'Laundry Suka Suka',
      tagline: 'Cucian rapi, wangi, dan tepat waktu.',
      description: 'Laundry demo untuk validasi template laundry dengan layanan, harga, pickup, dan kontak langsung.',
      address: 'Jl. Demo Laundry No. 8, Bandung',
      phone: '02220001002',
      whatsapp: '081220010020',
      email: 'halo@laundry-suka-suka.demo',
      mapsUrl: 'https://maps.google.com',
    },
  });
  expect(update.ok()).toBeTruthy();

  const publish = await api.patch(`/api/v1/websites/${website.id}/publish`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect(publish.ok()).toBeTruthy();
}

async function ensureClinicSehatSentosaDemo(api: APIRequestContext) {
  const existing = await api.get('/api/v1/public/site/clinic-sehat-sentosa');
  if (existing.ok()) {
    const body = await existing.json();
    if (body.whatsapp && body.phone && body.mapsUrl) return;
  }

  const email = 'admin@clinic-sehat-sentosa.demo';
  const password = 'Password12345';
  const tenantSlug = 'clinic-sehat-sentosa';

  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Clinic Sehat Sentosa',
      slug: tenantSlug,
      adminName: 'Demo Admin',
      email,
      password,
      businessType: 'CLINIC',
    },
  });

  if (!register.ok()) {
    const loginExisting = await api.post('/api/v1/auth/login', {
      data: { email, password, tenantSlug },
    });
    expect(loginExisting.ok()).toBeTruthy();
    await updateAndPublishClinicDemo(api, (await loginExisting.json()).accessToken);
    return;
  }

  const login = await api.post('/api/v1/auth/login', {
    data: { email, password, tenantSlug },
  });
  expect(login.ok()).toBeTruthy();
  const session = await login.json();
  await updateAndPublishClinicDemo(api, session.accessToken);
}

async function updateAndPublishClinicDemo(api: APIRequestContext, accessToken: string) {
  const websites = await api.get('/api/v1/websites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(websites.ok()).toBeTruthy();
  const [website] = await websites.json();
  expect(website?.id).toBeTruthy();

  const update = await api.put(`/api/v1/websites/${website.id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      businessName: 'Clinic Sehat Sentosa',
      tagline: 'Professional medical care for families and local community.',
      description: 'Clinic demo untuk validasi Clinic Professional Template dengan layanan medis, dokter, appointment, dan contact CTA.',
      address: 'Jl. Sehat Sentosa No. 12, Jakarta',
      phone: '02130001003',
      whatsapp: '081230010030',
      email: 'halo@clinic-sehat-sentosa.demo',
      mapsUrl: 'https://maps.google.com',
      openingHours: {
        Monday: '08.00 - 20.00',
        Tuesday: '08.00 - 20.00',
        Wednesday: '08.00 - 20.00',
        Thursday: '08.00 - 20.00',
        Friday: '08.00 - 20.00',
        Saturday: '08.00 - 16.00',
      },
    },
  });
  expect(update.ok()).toBeTruthy();

  const publish = await api.patch(`/api/v1/websites/${website.id}/publish`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(publish.ok()).toBeTruthy();
}

async function ensureCorporateMajuBersamaDemo(api: APIRequestContext) {
  const existing = await api.get('/api/v1/public/site/corporate-maju-bersama');
  if (existing.ok()) {
    const body = await existing.json();
    if (body.whatsapp && body.phone && body.mapsUrl) return;
  }

  const email = 'admin@corporate-maju-bersama.demo';
  const tenantSlug = 'corporate-maju-bersama';

  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Corporate Maju Bersama',
      slug: tenantSlug,
      adminName: 'Demo Admin',
      email,
      password,
      businessType: 'LOCAL_SERVICE',
    },
  });

  if (!register.ok()) {
    const loginExisting = await api.post('/api/v1/auth/login', {
      data: { email, password, tenantSlug },
    });
    expect(loginExisting.ok()).toBeTruthy();
    await updateAndPublishCorporateDemo(api, (await loginExisting.json()).accessToken);
    return;
  }

  const login = await api.post('/api/v1/auth/login', {
    data: { email, password, tenantSlug },
  });
  expect(login.ok()).toBeTruthy();
  await updateAndPublishCorporateDemo(api, (await login.json()).accessToken);
}

async function updateAndPublishCorporateDemo(api: APIRequestContext, accessToken: string) {
  const websites = await api.get('/api/v1/websites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(websites.ok()).toBeTruthy();
  const [website] = await websites.json();
  expect(website?.id).toBeTruthy();

  const update = await api.put(`/api/v1/websites/${website.id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      businessName: 'Corporate Maju Bersama',
      tagline: 'Executive business advisory for growing local companies.',
      description: 'Corporate demo untuk validasi Corporate Executive Template dengan services, team, client logos, testimonial, gallery, dan CTA.',
      address: 'Jl. Eksekutif No. 45, Jakarta',
      phone: '02140001004',
      whatsapp: '081240010040',
      email: 'hello@corporate-maju-bersama.demo',
      mapsUrl: 'https://maps.google.com',
    },
  });
  expect(update.ok()).toBeTruthy();

  const publish = await api.patch(`/api/v1/websites/${website.id}/publish`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(publish.ok()).toBeTruthy();
}

async function ensureCafeSenjaModernDemo(api: APIRequestContext) {
  const existing = await api.get('/api/v1/public/site/cafe-senja-modern');
  if (existing.ok()) {
    const body = await existing.json();
    if (body.whatsapp && body.phone && body.mapsUrl) return;
  }

  const email = 'admin@cafe-senja-modern.demo';
  const tenantSlug = 'cafe-senja-modern';

  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Cafe Senja Modern',
      slug: tenantSlug,
      adminName: 'Demo Admin',
      email,
      password,
      businessType: 'CAFE',
    },
  });

  if (!register.ok()) {
    const loginExisting = await api.post('/api/v1/auth/login', {
      data: { email, password, tenantSlug },
    });
    expect(loginExisting.ok()).toBeTruthy();
    await updateAndPublishCafeDemo(api, (await loginExisting.json()).accessToken);
    return;
  }

  const login = await api.post('/api/v1/auth/login', {
    data: { email, password, tenantSlug },
  });
  expect(login.ok()).toBeTruthy();
  await updateAndPublishCafeDemo(api, (await login.json()).accessToken);
}

async function updateAndPublishCafeDemo(api: APIRequestContext, accessToken: string) {
  const websites = await api.get('/api/v1/websites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(websites.ok()).toBeTruthy();
  const [website] = await websites.json();
  expect(website?.id).toBeTruthy();

  const update = await api.put(`/api/v1/websites/${website.id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      businessName: 'Cafe Senja Modern',
      tagline: 'Modern coffee, brunch, and warm everyday hangout.',
      description: 'Cafe demo untuk validasi Cafe Modern Template dengan featured menu, signature drinks, gallery, reviews, location, dan CTA.',
      address: 'Jl. Kopi Senja No. 18, Bandung',
      phone: '02250001005',
      whatsapp: '081250010050',
      email: 'hello@cafe-senja-modern.demo',
      mapsUrl: 'https://maps.google.com',
      openingHours: {
        Monday: '08.00 - 22.00',
        Tuesday: '08.00 - 22.00',
        Wednesday: '08.00 - 22.00',
        Thursday: '08.00 - 22.00',
        Friday: '08.00 - 23.00',
        Saturday: '08.00 - 23.00',
        Sunday: '09.00 - 22.00',
      },
    },
  });
  expect(update.ok()).toBeTruthy();

  const publish = await api.patch(`/api/v1/websites/${website.id}/publish`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(publish.ok()).toBeTruthy();
}
