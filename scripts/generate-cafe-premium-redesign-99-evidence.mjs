import { chromium, request } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const backendRequire = createRequire(resolve('backend/package.json'));
const sharp = backendRequire('sharp');

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/cafe-premium-redesign-9.9');
const password = 'Password12345';

const screenshotPaths = {
  cafePremiumHeroDesktop: `${outputRoot}/cafe-premium-hero-desktop.png`,
  cafePremiumHeroMobile: `${outputRoot}/cafe-premium-hero-mobile.png`,
  cafePremiumSignatureBrews: `${outputRoot}/cafe-premium-signature-brews.png`,
  cafePremiumMenuPreview: `${outputRoot}/cafe-premium-menu-preview.png`,
  cafePremiumFullMenuModal: `${outputRoot}/cafe-premium-full-menu-modal.png`,
  cafePremiumMenuItemDetail: `${outputRoot}/cafe-premium-menu-item-detail.png`,
  cafePremiumStorySection: `${outputRoot}/cafe-premium-story-section.png`,
  cafePremiumGallery: `${outputRoot}/cafe-premium-gallery.png`,
  cafePremiumVisitSection: `${outputRoot}/cafe-premium-visit-section.png`,
  cafePremiumFooter: `${outputRoot}/cafe-premium-footer.png`,
  cafePremiumMobileFullPage: `${outputRoot}/cafe-premium-mobile-full-page.png`,
  restaurantPremiumRegressionCheck: `${outputRoot}/restaurant-premium-regression-check.png`,
};

mkdirSync(outputRoot, { recursive: true });
for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

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
  await expectText(page, 'Signature Brews');
  await expectText(page, 'Coffee & Bites');
  await expectText(page, 'Visit the Cafe');
  await page.locator('#home').screenshot({ path: screenshotPaths.cafePremiumHeroDesktop });
  await page.locator('#signature-brews').screenshot({ path: screenshotPaths.cafePremiumSignatureBrews });
  await page.locator('#coffee-bites').screenshot({ path: screenshotPaths.cafePremiumMenuPreview });
  await page.locator('#cafe-story').screenshot({ path: screenshotPaths.cafePremiumStorySection });
  await page.locator('#cafe-ambience').screenshot({ path: screenshotPaths.cafePremiumGallery });
  await page.locator('#visit-cafe').screenshot({ path: screenshotPaths.cafePremiumVisitSection });
  await page.locator('footer').screenshot({ path: screenshotPaths.cafePremiumFooter });
  results.push({ target: 'cafe_premium_desktop_sections', viewport: 'desktop', status: 'passed' });

  await page.getByRole('button', { name: /open cafe menu|view coffee & bites/i }).first().click();
  const dialog = page.getByRole('dialog', { name: /coffee & bites/i });
  await dialog.waitFor({ state: 'visible' });
  await assertNoModalWhatsApp(dialog);
  await expectText(page, 'Rp 48.000');
  await expectText(page, '$4.50');
  await dialog.screenshot({ path: screenshotPaths.cafePremiumFullMenuModal });
  await page.getByRole('button', { name: /Manual Brew Ritual/i }).click();
  await dialog.getByRole('heading', { name: 'Manual Brew Ritual' }).last().waitFor({ state: 'visible' });
  await dialog.screenshot({ path: screenshotPaths.cafePremiumMenuItemDetail });
  results.push({ target: 'cafe_premium_full_menu_and_detail', viewport: 'desktop', status: 'passed' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${cafe.slug}`, { waitUntil: 'networkidle' });
  await waitForTemplate(page, 'cafe_premium');
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await page.locator('#home').screenshot({ path: screenshotPaths.cafePremiumHeroMobile });
  await page.screenshot({ path: screenshotPaths.cafePremiumMobileFullPage, fullPage: true });
  results.push({ target: 'cafe_premium_mobile_no_overflow', viewport: 'mobile', status: 'passed' });

  const restaurant = await createRestaurantPremiumTenant();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/site/${restaurant.slug}`, { waitUntil: 'networkidle' });
  await waitForTemplate(page, 'restaurant_premium');
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await expectText(page, 'Explore Signature Dishes');
  await page.locator('#home').screenshot({ path: screenshotPaths.restaurantPremiumRegressionCheck });
  results.push({ target: 'restaurant_premium_regression_check', viewport: 'desktop', status: 'passed' });
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

console.log(`Cafe Premium Stage 9.9 evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createCafePremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-99-cafe-${stamp}`;
  const email = `stage-99-cafe-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Slow Corner Coffee',
      slug,
      adminName: 'Stage 99 Admin',
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
  const staticHero = await uploadImage(headers, website.id, 'hero', 'stage-99-cafe-hero.jpg', '#3c2518', '#d9a15f', 'Slow Corner Coffee');
  const heroImages = [
    await uploadImage(headers, website.id, 'hero', 'stage-99-cafe-slide-1.jpg', '#3c2518', '#d9a15f', 'Coffee Bar'),
    await uploadImage(headers, website.id, 'hero', 'stage-99-cafe-slide-2.jpg', '#4f6f52', '#d3a064', 'Morning Brew'),
    await uploadImage(headers, website.id, 'hero', 'stage-99-cafe-slide-3.jpg', '#9a4f35', '#e2a05e', 'Pastry Table'),
  ].map((upload, index) => ({
    url: upload.url,
    thumbnailUrl: upload.thumbnailUrl,
    mediumUrl: upload.mediumUrl,
    largeUrl: upload.largeUrl,
    alt: `Cafe Premium hero ${index + 1}`,
  }));

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: 'Slow Corner Coffee',
      tagline: 'Fresh brews, warm bites, and calm corners for everyday rituals.',
      description: 'A neighborhood specialty cafe with espresso, manual brew, pastry pairings, and comfortable corners for slow mornings.',
      address: 'Jl. Kopi Pagi No. 9, Jakarta',
      phone: '0219900999',
      whatsapp: '081299009999',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'specific', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], openTime: '08:00', closeTime: '22:00' },
    },
  }), 'Update cafe website');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/template`, {
    headers,
    data: { templateKey: 'cafe_premium' },
  }), 'Assign cafe premium template');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/theme-assets`, {
    headers,
    data: {
      heroImageUrl: staticHero.url,
      premiumColorPreset: 'roasted_cream',
      heroMedia: { heroMediaType: 'slideshow', heroImages },
    },
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

  for (let index = 0; index < 3; index += 1) {
    const upload = await uploadImage(headers, website.id, 'gallery', `stage-99-cafe-gallery-${index + 1}.jpg`, ['#3c2518', '#4f6f52', '#9a4f35'][index], ['#d9a15f', '#d3a064', '#e2a05e'][index], ['Coffee Bar', 'Pastry Table', 'Cozy Corner'][index]);
    await mustOk(api.post(`/api/v1/websites/${website.id}/gallery`, {
      headers,
      data: { imageUrl: upload.url, altText: `Cafe ambience ${index + 1}` },
    }), `Add gallery ${index + 1}`);
  }

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish cafe website');
  return { ...session, websiteId: website.id, slug, headers };
}

async function createRestaurantPremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-99-restaurant-regression-${stamp}`;
  const email = `stage-99-restaurant-regression-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Regression Bistro',
      slug,
      adminName: 'Stage 99 Restaurant Admin',
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
  const hero = await uploadImage(headers, website.id, 'hero', 'stage-99-restaurant-hero.jpg', '#4a1f13', '#d9a45d', 'Premium Dining');

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: 'Regression Bistro',
      tagline: 'Restaurant Premium regression check.',
      description: 'Restaurant Premium remains the locked foundation reference while Cafe Premium is redesigned separately.',
      address: 'Jl. Regression No. 99, Jakarta',
      phone: '0219900888',
      whatsapp: '081299008888',
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
    data: { heroImageUrl: hero.url, premiumColorPreset: 'editorial_umber' },
  }), 'Save restaurant hero');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish restaurant website');
  return { ...session, websiteId: website.id, slug };
}

async function uploadImage(headers, websiteId, assetType, name, background, accent, label) {
  const svg = Buffer.from(`
    <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${background}"/>
          <stop offset="1" stop-color="#17100b"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#g)"/>
      <circle cx="1030" cy="410" r="230" fill="${accent}" opacity="0.56"/>
      <rect x="260" y="655" width="900" height="86" rx="43" fill="#fff3d9" opacity="0.25"/>
      <rect x="310" y="520" width="560" height="58" rx="29" fill="#ffffff" opacity="0.16"/>
      <text x="250" y="310" fill="#fff3d9" font-size="84" font-family="Georgia">${label}</text>
    </svg>
  `);
  const buffer = await sharp(svg).jpeg({ quality: 92 }).toBuffer();
  const response = await api.post(`/api/v1/uploads/${assetType}`, {
    headers,
    multipart: {
      websiteId,
      file: { name, mimeType: 'image/jpeg', buffer },
    },
  });
  if (!response.ok()) throw new Error(`${assetType} upload failed: ${response.status()} ${await response.text()}`);
  return response.json();
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
  if (await dialog.getByText('Chat WhatsApp', { exact: true }).count()) throw new Error('Cafe menu modal rendered Chat WhatsApp');
  if (await dialog.getByText('Order via WhatsApp', { exact: true }).count()) throw new Error('Cafe menu modal rendered order WhatsApp CTA');
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
