import { chromium, request } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/restaurant-premium-editorial-redesign-r2');
const password = 'Password12345';

const screenshotPaths = {
  fullMenuModal: `${outputRoot}/restaurant-premium-full-menu-modal.png`,
  fullMenuModalMobile: `${outputRoot}/restaurant-premium-full-menu-modal-mobile.png`,
  categoryDeleteUi: `${outputRoot}/menu-category-delete-ui.png`,
  businessInfoSlugEditor: `${outputRoot}/business-info-slug-editor.png`,
  loginWithoutTenantSlug: `${outputRoot}/login-without-tenant-slug.png`,
  openingHoursPicker: `${outputRoot}/opening-hours-picker.png`,
  publicOpeningHours: `${outputRoot}/restaurant-premium-opening-hours-public.png`,
};

mkdirSync(outputRoot, { recursive: true });
for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];

try {
  const session = await createRestaurantPremiumTenant();

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' });
  if (await page.getByLabel('Tenant slug').count()) throw new Error('Login still renders Tenant slug');
  await page.locator('form').screenshot({ path: screenshotPaths.loginWithoutTenantSlug });
  results.push({ target: 'login_without_tenant_slug', viewport: 'desktop', status: 'passed' });

  await seedSession(page, session);
  await page.goto(`${baseURL}/app/websites/${session.websiteId}`, { waitUntil: 'networkidle' });
  await page.getByText('Business slug').locator('..').locator('..').screenshot({ path: screenshotPaths.businessInfoSlugEditor });
  await page.getByRole('group', { name: 'Opening Hours' }).screenshot({ path: screenshotPaths.openingHoursPicker });
  results.push({ target: 'business_info_slug_and_opening_hours', viewport: 'desktop', status: 'passed' });

  await page.goto(`${baseURL}/app/menu`, { waitUntil: 'networkidle' });
  await page.getByText('Categories').locator('..').screenshot({ path: screenshotPaths.categoryDeleteUi });
  results.push({ target: 'menu_category_delete_ui', viewport: 'desktop', status: 'passed' });

  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /explore full menu/i }).click();
  const dialog = page.getByRole('dialog', { name: /full restaurant menu/i });
  await dialog.waitFor({ state: 'visible' });
  if (await dialog.getByText('Chat WhatsApp', { exact: true }).count()) throw new Error('Restaurant modal still renders Chat WhatsApp');
  await dialog.screenshot({ path: screenshotPaths.fullMenuModal });
  results.push({ target: 'restaurant_premium_full_menu_modal', viewport: 'desktop', status: 'passed' });
  await dialog.getByRole('button', { name: /close full menu/i }).click();

  await page.getByRole('heading', { name: 'Opening hours' }).locator('..').screenshot({ path: screenshotPaths.publicOpeningHours });
  results.push({ target: 'restaurant_premium_public_opening_hours', viewport: 'desktop', status: 'passed' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /explore full menu/i }).click();
  const mobileDialog = page.getByRole('dialog', { name: /full restaurant menu/i });
  await mobileDialog.waitFor({ state: 'visible' });
  await validateNoHorizontalScroll(page);
  await mobileDialog.screenshot({ path: screenshotPaths.fullMenuModalMobile });
  results.push({ target: 'restaurant_premium_full_menu_modal', viewport: 'mobile', status: 'passed' });
} finally {
  await context.close();
  await browser.close();
  await api.dispose();
}

const resultPath = `${outputRoot}/visual-validation-results.json`;
writeFileSync(resultPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseURL,
  screenshots: screenshotPaths,
  results,
}, null, 2));

console.log(`Restaurant Premium R2 evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createRestaurantPremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-98d-r2-${stamp}`;
  const email = `stage-98d-r2-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: `Stage 98D R2 Restaurant ${stamp}`,
      slug,
      adminName: 'Stage R2 Admin',
      email,
      password,
      businessType: 'RESTAURANT',
    },
  });
  if (!register.ok()) throw new Error(`Register failed: ${register.status()} ${await register.text()}`);
  const session = await register.json();
  const headers = { Authorization: `Bearer ${session.accessToken}` };

  const websites = await api.get('/api/v1/websites', { headers });
  if (!websites.ok()) throw new Error(`Website list failed: ${websites.status()} ${await websites.text()}`);
  const [website] = await websites.json();

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: `Stage 98D R2 Restaurant ${stamp}`,
      tagline: 'Premium menu and reservation validation.',
      description: 'Restaurant Premium R2 evidence tenant for menu modal, slug, category delete, and structured opening hours.',
      address: 'Jl. Premium Foundation No. 9, Jakarta',
      phone: '02190001009',
      whatsapp: '081290010090',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', openTime: '12:00', closeTime: '21:00' },
    },
  }), 'Update website');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/template`, {
    headers,
    data: { templateKey: 'restaurant_premium' },
  }), 'Assign template');

  const signature = await mustJson(api.post('/api/v1/menu-categories', {
    headers,
    data: { websiteId: website.id, name: 'Signature Plates' },
  }), 'Create signature category');
  await mustOk(api.post('/api/v1/menu-categories', {
    headers,
    data: { websiteId: website.id, name: 'asdasda' },
  }), 'Create typo category');

  for (const item of [
    { name: 'Chef Signature Rice Set', description: 'House signature rice with curated sides.', price: 58000, isFeatured: true },
    { name: 'Slow Cooked Beef Plate', description: 'Tender beef with aromatic spices.', price: 68000, isFeatured: true },
    { name: 'Seasonal Family Platter', description: 'Shareable premium platter.', price: 128000, isFeatured: false },
  ]) {
    await mustOk(api.post('/api/v1/menus', {
      headers,
      data: { websiteId: website.id, categoryId: signature.id, ...item },
    }), `Create menu ${item.name}`);
  }

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish website');

  return { ...session, websiteId: website.id, slug };
}

async function mustOk(responsePromise, label) {
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`${label} failed: ${response.status()} ${await response.text()}`);
  return response;
}

async function mustJson(responsePromise, label) {
  const response = await mustOk(responsePromise, label);
  return response.json();
}

async function seedSession(targetPage, session) {
  await targetPage.addInitScript((authSession) => {
    window.localStorage.setItem('umkm.accessToken', authSession.accessToken);
    window.localStorage.setItem('umkm.refreshToken', authSession.refreshToken);
    window.localStorage.setItem('umkm.user', JSON.stringify(authSession.user));
  }, session);
}

async function validateNoHorizontalScroll(targetPage) {
  const scroll = await targetPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (scroll.scrollWidth > scroll.clientWidth + 1) {
    throw new Error(`Horizontal scroll detected: ${scroll.scrollWidth} > ${scroll.clientWidth}`);
  }
}
