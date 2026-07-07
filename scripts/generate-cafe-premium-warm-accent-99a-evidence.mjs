import { chromium, request } from '@playwright/test';

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/cafe-premium-warm-accent-9.9a');
const password = 'Password12345';

const screenshotPaths = {
  cafePremiumWarmMenuPlaceholders: `${outputRoot}/cafe-premium-warm-menu-placeholders.png`,
  cafePremiumWarmMenuPreview: `${outputRoot}/cafe-premium-warm-menu-preview.png`,
  cafePremiumWarmFullMenuModal: `${outputRoot}/cafe-premium-warm-full-menu-modal.png`,
  cafePremiumWarmMenuItemDetail: `${outputRoot}/cafe-premium-warm-menu-item-detail.png`,
  cafePremiumGalleryPlaceholderFixed: `${outputRoot}/cafe-premium-gallery-placeholder-fixed.png`,
  cafePremiumStoryWarmIcons: `${outputRoot}/cafe-premium-story-warm-icons.png`,
  cafePremiumMobileWarmPolish: `${outputRoot}/cafe-premium-mobile-warm-polish.png`,
  restaurantPremiumModalRegressionCheck: `${outputRoot}/restaurant-premium-modal-regression-check.png`,
};

mkdirSync(outputRoot, { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];

try {
  const cafe = await createCafePremiumTenant();

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/site/${cafe.slug}`, { waitUntil: 'networkidle' });
  await waitForTemplate(page, 'cafe_premium');
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await expectText(page, 'Cafe visual');
  await page.locator('#signature-brews').screenshot({ path: screenshotPaths.cafePremiumWarmMenuPlaceholders });
  await page.locator('#coffee-bites').screenshot({ path: screenshotPaths.cafePremiumWarmMenuPreview });
  await page.locator('#cafe-story').screenshot({ path: screenshotPaths.cafePremiumStoryWarmIcons });
  await page.locator('#cafe-ambience').screenshot({ path: screenshotPaths.cafePremiumGalleryPlaceholderFixed });
  results.push({ target: 'cafe_premium_warm_placeholders', viewport: 'desktop', status: 'passed' });

  await page.getByRole('button', { name: /open cafe menu|view coffee & bites/i }).first().click();
  const cafeDialog = page.getByRole('dialog', { name: /coffee & bites/i });
  await cafeDialog.waitFor({ state: 'visible' });
  await assertNoModalWhatsApp(cafeDialog);
  await cafeDialog.screenshot({ path: screenshotPaths.cafePremiumWarmFullMenuModal });
  await cafeDialog.getByRole('button', { name: /Manual Brew Ritual/i }).click();
  await cafeDialog.getByRole('heading', { name: 'Manual Brew Ritual' }).last().waitFor({ state: 'visible' });
  await cafeDialog.screenshot({ path: screenshotPaths.cafePremiumWarmMenuItemDetail });
  results.push({ target: 'cafe_premium_warm_modal_and_detail', viewport: 'desktop', status: 'passed' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${cafe.slug}`, { waitUntil: 'networkidle' });
  await waitForTemplate(page, 'cafe_premium');
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await page.screenshot({ path: screenshotPaths.cafePremiumMobileWarmPolish, fullPage: true });
  results.push({ target: 'cafe_premium_mobile_warm_polish', viewport: 'mobile', status: 'passed' });

  const restaurant = await createRestaurantPremiumTenant();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/site/${restaurant.slug}`, { waitUntil: 'networkidle' });
  await waitForTemplate(page, 'restaurant_premium');
  await page.getByRole('link', { name: /explore signature dishes/i }).click();
  await page.getByRole('button', { name: /explore full menu/i }).click();
  const restaurantDialog = page.getByRole('dialog', { name: /full restaurant menu/i });
  await restaurantDialog.waitFor({ state: 'visible' });
  await assertNoModalWhatsApp(restaurantDialog);
  await restaurantDialog.screenshot({ path: screenshotPaths.restaurantPremiumModalRegressionCheck });
  results.push({ target: 'restaurant_premium_modal_regression', viewport: 'desktop', status: 'passed' });
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

console.log(`Cafe Premium Stage 9.9A evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createCafePremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-99a-cafe-${stamp}`;
  const email = `stage-99a-cafe-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Warm Corner Coffee',
      slug,
      adminName: 'Stage 99A Admin',
      email,
      password,
      businessType: 'CAFE',
    },
  });
  if (!register.ok()) throw new Error(`Register failed: ${register.status()} ${await register.text()}`);
  const session = await register.json();
  const headers = { Authorization: `Bearer ${session.accessToken}` };

  const websites = await mustJson(api.get('/api/v1/websites', { headers }), 'Website list');
  const [website] = websites;

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: 'Warm Corner Coffee',
      tagline: 'Roasted coffee, pastry pairings, and calm corners.',
      description: 'A warm specialty cafe page for espresso, manual brew, pastries, and slow neighborhood visits.',
      address: 'Jl. Warm Accent No. 99A, Jakarta',
      phone: '0219900991',
      whatsapp: '081299009991',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', openTime: '08:00', closeTime: '22:00' },
    },
  }), 'Update cafe website');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/template`, {
    headers,
    data: { templateKey: 'cafe_premium' },
  }), 'Assign cafe premium template');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/theme-assets`, {
    headers,
    data: { premiumColorPreset: 'roasted_cream', heroMedia: { heroMediaType: 'image', heroImages: [] } },
  }), 'Save cafe theme assets');

  const coffee = await mustJson(api.post('/api/v1/menu-categories', { headers, data: { websiteId: website.id, name: 'Coffee' } }), 'Create coffee category');
  const bites = await mustJson(api.post('/api/v1/menu-categories', { headers, data: { websiteId: website.id, name: 'Pastry' } }), 'Create pastry category');

  for (const item of [
    { categoryId: coffee.id, name: 'House Cream Latte', description: 'Espresso, steamed milk, and soft caramel notes for slow mornings.', price: 42000, priceCurrency: 'IDR', isFeatured: true },
    { categoryId: coffee.id, name: 'Manual Brew Ritual', description: 'Single-origin coffee brewed clean and bright for focused cafe moments.', price: 48000, priceCurrency: 'IDR', isFeatured: true },
    { categoryId: bites.id, name: 'Butter Croissant Pairing', description: 'Warm pastry pairing for coffee dates and brunch tables.', price: 4.5, priceCurrency: 'USD', isFeatured: true },
    { categoryId: coffee.id, name: 'Seasonal Cold Brew', description: 'A chilled house favorite with a smooth finish and rotating flavor notes.', price: 46000, priceCurrency: 'IDR', isFeatured: false },
  ]) {
    await mustOk(api.post('/api/v1/menus', { headers, data: { websiteId: website.id, ...item } }), `Create menu ${item.name}`);
  }

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish cafe website');
  return { ...session, websiteId: website.id, slug, headers };
}

async function createRestaurantPremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-99a-restaurant-${stamp}`;
  const email = `stage-99a-restaurant-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Warm Regression Bistro',
      slug,
      adminName: 'Stage 99A Restaurant Admin',
      email,
      password,
      businessType: 'RESTAURANT',
    },
  });
  if (!register.ok()) throw new Error(`Restaurant register failed: ${register.status()} ${await register.text()}`);
  const session = await register.json();
  const headers = { Authorization: `Bearer ${session.accessToken}` };
  const websites = await mustJson(api.get('/api/v1/websites', { headers }), 'Restaurant website list');
  const [website] = websites;

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: 'Warm Regression Bistro',
      tagline: 'Restaurant Premium modal regression check.',
      description: 'Restaurant Premium remains unchanged while Cafe Premium receives cafe-specific accent polish.',
      address: 'Jl. Regression 99A, Jakarta',
      phone: '0219900881',
      whatsapp: '081299008881',
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', openTime: '11:00', closeTime: '22:00' },
    },
  }), 'Update restaurant website');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/template`, {
    headers,
    data: { templateKey: 'restaurant_premium' },
  }), 'Assign restaurant premium template');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/theme-assets`, {
    headers,
    data: { premiumColorPreset: 'editorial_umber' },
  }), 'Save restaurant theme');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish restaurant website');
  return { ...session, websiteId: website.id, slug };
}

async function waitForTemplate(targetPage, key) {
  await targetPage.locator(`main[data-template-key="${key}"]`).waitFor({ state: 'visible' });
}

async function assertNoBrokenImages(targetPage) {
  const broken = await targetPage.evaluate(() => Array.from(document.images)
    .filter((image) => image.complete && image.naturalWidth === 0)
    .map((image) => image.getAttribute('alt') || image.getAttribute('src')));
  if (broken.length > 0) throw new Error(`Broken images detected: ${broken.join(', ')}`);
}

async function assertNoModalWhatsApp(dialog) {
  if (await dialog.getByText('Chat WhatsApp', { exact: true }).count()) throw new Error('Premium modal rendered Chat WhatsApp');
  if (await dialog.getByText('Order via WhatsApp', { exact: true }).count()) throw new Error('Premium modal rendered order WhatsApp CTA');
}

async function expectText(targetPage, text) {
  await targetPage.getByText(text, { exact: false }).first().waitFor({ state: 'visible' });
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

async function validateNoHorizontalScroll(targetPage) {
  const scroll = await targetPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (scroll.scrollWidth > scroll.clientWidth + 1) {
    throw new Error(`Horizontal scroll detected: ${scroll.scrollWidth} > ${scroll.clientWidth}`);
  }
}
