import { chromium, request } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/premium-full-menu-modal-r11a');
const password = 'Password12345';

const screenshotPaths = {
  fullMenuWarmPriceChip: `${outputRoot}/full-menu-warm-price-chip.png`,
  fullMenuWarmViewDetail: `${outputRoot}/full-menu-warm-view-detail.png`,
  fullMenuWarmFocusState: `${outputRoot}/full-menu-warm-focus-state.png`,
  fullMenuDetailWarmDescriptionLabel: `${outputRoot}/full-menu-detail-warm-description-label.png`,
  fullMenuDetailMobileWarmAccent: `${outputRoot}/full-menu-detail-mobile-warm-accent.png`,
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
  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  const dialog = await openFullMenu(page);
  await assertNoBlueTailwind(dialog);
  await expectText(page, 'Rp 68.000');
  await expectText(page, '$12.90');
  await dialog.screenshot({ path: screenshotPaths.fullMenuWarmPriceChip });
  results.push({ target: 'warm_price_chip', viewport: 'desktop', status: 'passed' });

  const beefCard = page.getByRole('button', { name: /Slow Cooked Beef Plate/i });
  await beefCard.screenshot({ path: screenshotPaths.fullMenuWarmViewDetail });
  results.push({ target: 'warm_view_detail', viewport: 'desktop', status: 'passed' });

  await beefCard.focus();
  await beefCard.screenshot({ path: screenshotPaths.fullMenuWarmFocusState });
  results.push({ target: 'warm_focus_state', viewport: 'desktop', status: 'passed' });

  await beefCard.click();
  await dialog.getByRole('heading', { name: 'Slow Cooked Beef Plate' }).last().waitFor({ state: 'visible' });
  await expectText(page, 'Description');
  await expectText(page, 'Tender beef with aromatic spices');
  await dialog.screenshot({ path: screenshotPaths.fullMenuDetailWarmDescriptionLabel });
  results.push({ target: 'warm_description_label', viewport: 'desktop', status: 'passed' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  const mobileDialog = await openFullMenu(page);
  await page.getByRole('button', { name: /Slow Cooked Beef Plate/i }).click();
  await mobileDialog.getByRole('heading', { name: 'Slow Cooked Beef Plate' }).last().waitFor({ state: 'visible' });
  await validateNoHorizontalScroll(page);
  await mobileDialog.screenshot({ path: screenshotPaths.fullMenuDetailMobileWarmAccent });
  results.push({ target: 'warm_mobile_detail', viewport: 'mobile', status: 'passed' });
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

console.log(`Premium full menu R11A evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createRestaurantPremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-98d-r11a-${stamp}`;
  const email = `stage-98d-r11a-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'R11A Bistro',
      slug,
      adminName: 'Stage R11A Admin',
      email,
      password,
      businessType: 'RESTAURANT',
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
      businessName: 'R11A Bistro',
      tagline: 'Warm premium menu accents.',
      description: 'Restaurant Premium evidence tenant for warm price chips, focus states, detail labels, and placeholders.',
      address: 'Jl. Premium Menu No. 11A, Jakarta',
      phone: '02190001110',
      whatsapp: '081290011100',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', openTime: '11:00', closeTime: '22:00' },
    },
  }), 'Update website');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/template`, {
    headers,
    data: { templateKey: 'restaurant_premium' },
  }), 'Assign template');

  const signatures = await mustJson(api.post('/api/v1/menu-categories', {
    headers,
    data: { websiteId: website.id, name: 'Signature Plates' },
  }), 'Create signature category');
  const desserts = await mustJson(api.post('/api/v1/menu-categories', {
    headers,
    data: { websiteId: website.id, name: 'Desserts' },
  }), 'Create dessert category');

  for (const item of [
    {
      categoryId: signatures.id,
      name: 'Slow Cooked Beef Plate',
      description: 'Tender beef with aromatic spices, charred vegetables, and a warm sauce designed for premium dinner browsing.',
      price: 68000,
      priceCurrency: 'IDR',
      isFeatured: true,
    },
    {
      categoryId: signatures.id,
      name: 'Chef Signature Rice Set',
      description: 'A complete signature plate with balanced flavor, texture, and house sambal.',
      price: 58000,
      priceCurrency: 'IDR',
      isFeatured: true,
    },
    {
      categoryId: desserts.id,
      name: 'Seasonal Dessert Plate',
      description: 'A refined dessert course with fruit, cream, and a crisp finish.',
      price: 12.9,
      priceCurrency: 'USD',
      isFeatured: false,
    },
  ]) {
    await mustOk(api.post('/api/v1/menus', {
      headers,
      data: { websiteId: website.id, ...item },
    }), `Create menu ${item.name}`);
  }

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish website');
  return { ...session, websiteId: website.id, slug };
}

async function openFullMenu(targetPage) {
  await targetPage.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await targetPage.getByRole('button', { name: /explore full menu/i }).click();
  const dialog = targetPage.getByRole('dialog', { name: /full restaurant menu/i });
  await dialog.waitFor({ state: 'visible' });
  if (await dialog.getByText('Chat WhatsApp', { exact: true }).count()) throw new Error('Restaurant full menu modal rendered Chat WhatsApp');
  return dialog;
}

async function assertNoBlueTailwind(target) {
  const blueClassElements = await target.locator('[class*="blue-"]').count();
  if (blueClassElements > 0) throw new Error(`Blue Tailwind class detected in Restaurant full menu modal: ${blueClassElements}`);
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
