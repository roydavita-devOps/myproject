import { chromium, request } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/restaurant-premium-editorial-redesign-r1');
const password = 'Password12345';

const screenshotPaths = {
  heroDesktop: `${outputRoot}/restaurant-premium-hero-desktop.png`,
  visitReservationDesktop: `${outputRoot}/restaurant-premium-visit-reservation-desktop.png`,
  mobile: `${outputRoot}/restaurant-premium-mobile.png`,
  openingHoursEditor: `${outputRoot}/restaurant-premium-opening-hours-editor.png`,
};

mkdirSync(outputRoot, { recursive: true });
for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const payload = buildRestaurantPremiumPayload();
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];

try {
  await page.route(`**/api/v1/public/site/${payload.tenant.slug}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${baseURL}/site/${payload.tenant.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await validatePublicRestaurantPremium(page, 'desktop');
  await page.locator('#home').screenshot({ path: screenshotPaths.heroDesktop });
  await page.getByRole('heading', { name: 'Visit & Reservation' }).locator('..').locator('..').screenshot({
    path: screenshotPaths.visitReservationDesktop,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${payload.tenant.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await validatePublicRestaurantPremium(page, 'mobile');
  await page.screenshot({ path: screenshotPaths.mobile, fullPage: true });

  await captureOpeningHoursEditor(page);
} finally {
  await context.close();
  await browser.close();
}

const resultPath = `${outputRoot}/visual-validation-results.json`;
writeFileSync(resultPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseURL,
  screenshots: screenshotPaths,
  results,
}, null, 2));

console.log(`Restaurant Premium R1 evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function validatePublicRestaurantPremium(page, viewportName) {
  await validateNoHorizontalScroll(page, viewportName);
  await waitForImages(page);

  await page.locator('header').getByRole('link', { name: /reserve a table/i }).waitFor({ state: 'visible' });
  const heroReserveCount = await page.locator('#home').getByRole('link', { name: /reserve a table/i }).count();
  if (heroReserveCount > 0) throw new Error(`${viewportName} hero still renders Reserve a Table`);

  await page.locator('#home').getByRole('link', { name: /explore signature dishes/i }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /explore full menu/i }).waitFor({ state: 'visible' });
  await page.getByText('Daily, 12.00 - 21.00').first().waitFor({ state: 'visible' });

  const reservationTitle = page.getByText('Reserve your table tonight').first();
  await reservationTitle.waitFor({ state: 'visible' });
  const reservationTitleColor = await reservationTitle.evaluate((element) => getComputedStyle(element).color);
  if (reservationTitleColor !== 'rgb(255, 255, 255)') {
    throw new Error(`${viewportName} reservation title is not readable white text: ${reservationTitleColor}`);
  }

  await page.getByText('Reserve a table or ask what is available today.').waitFor({ state: 'visible' });
  await page.getByText('Reserve via WhatsApp').waitFor({ state: 'visible' });
  await page.getByText('Call Restaurant').waitFor({ state: 'visible' });

  const genericWhatsAppCount = await page.getByText('Chat WhatsApp', { exact: true }).count();
  if (genericWhatsAppCount > 0) throw new Error(`${viewportName} still renders generic Chat WhatsApp CTA`);

  results.push({ target: 'restaurant_premium_public', viewport: viewportName, status: 'passed' });
}

async function captureOpeningHoursEditor(page) {
  const api = await request.newContext({ baseURL });
  const stamp = Date.now();
  const slug = `stage-98d-r1-${stamp}`;
  const email = `stage-98d-r1-${stamp}@example.com`;

  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: `Stage 98D R1 ${stamp}`,
      slug,
      adminName: 'Stage R1 Admin',
      email,
      password,
      businessType: 'RESTAURANT',
    },
  });
  if (!register.ok()) throw new Error(`Register failed: ${register.status()} ${await register.text()}`);
  const session = await register.json();

  const websites = await api.get('/api/v1/websites', {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!websites.ok()) throw new Error(`Website list failed: ${websites.status()} ${await websites.text()}`);
  const [website] = await websites.json();

  await page.addInitScript((authSession) => {
    window.localStorage.setItem('umkm.accessToken', authSession.accessToken);
    window.localStorage.setItem('umkm.refreshToken', authSession.refreshToken);
    window.localStorage.setItem('umkm.user', JSON.stringify(authSession.user));
  }, session);

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${baseURL}/app/websites/${website.id}`, { waitUntil: 'networkidle' });
  const field = page.getByLabel('Opening Hours');
  await field.waitFor({ state: 'visible' });
  await field.fill('Daily, 12.00 - 21.00');
  const saveResponse = page.waitForResponse((response) =>
    response.url().includes(`/api/v1/websites/${website.id}`) &&
    response.request().method() === 'PUT' &&
    response.ok(),
  );
  await page.getByRole('button', { name: /save changes/i }).click();
  await saveResponse;

  const saved = await api.get(`/api/v1/websites/${website.id}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  if (!saved.ok()) throw new Error(`Website fetch failed: ${saved.status()} ${await saved.text()}`);
  const savedWebsite = await saved.json();
  if (savedWebsite.openingHours?.display !== 'Daily, 12.00 - 21.00') {
    throw new Error(`Opening hours were not saved: ${JSON.stringify(savedWebsite.openingHours)}`);
  }

  await page.locator('form').first().screenshot({ path: screenshotPaths.openingHoursEditor });
  results.push({ target: 'opening_hours_editor', viewport: 'desktop', status: 'passed' });
  await api.dispose();
}

async function waitForImages(page) {
  await page.waitForFunction(() =>
    Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
    null,
    { timeout: 15_000 },
  );
}

async function validateNoHorizontalScroll(page, label) {
  const scroll = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (scroll.scrollWidth > scroll.clientWidth + 1) {
    throw new Error(`${label} has horizontal scroll: ${scroll.scrollWidth} > ${scroll.clientWidth}`);
  }
}

function buildRestaurantPremiumPayload() {
  const websiteId = 'restaurant-premium-r1-website';
  return {
    id: websiteId,
    tenantId: 'restaurant-premium-r1-tenant',
    tenant: { slug: 'stage-98d-r1-restaurant-premium' },
    templateId: 'restaurant-premium-r1-template',
    themeId: 'restaurant-premium-r1-theme',
    status: 'PUBLISHED',
    businessName: 'Aurum Dining House',
    tagline: 'Private dining, signature plates, and a refined evening table.',
    description: 'A focused restaurant experience for guests who want to see the menu, understand the atmosphere, and reserve without friction.',
    address: 'Jl. Dining Premium No. 17, Jakarta',
    phone: '02160001006',
    whatsapp: '081260010060',
    email: 'reserve@aurum-dining.demo',
    mapsUrl: 'https://maps.google.com',
    openingHours: { display: 'Daily, 12.00 - 21.00' },
    template: {
      id: 'restaurant-premium-r1-template',
      name: 'restaurant_premium',
      businessType: 'RESTAURANT',
      schema: { templateKey: 'restaurant_premium', rendererKey: 'restaurant_premium' },
    },
    theme: {
      id: 'restaurant-premium-r1-theme',
      name: 'Restaurant Premium R1 theme',
      primaryColor: '#561c24',
      secondaryColor: '#d6a650',
      accentColor: '#d6a650',
      typography: {
        heading: 'Georgia',
        body: 'Inter',
        premiumColorPreset: 'elegant_maroon',
      },
      heroImageUrl: imageSvg('', '#561c24', '#d6a650'),
    },
    categories: [
      { id: 'r-cat-signature', websiteId, name: 'Signature Plates', sortOrder: 1 },
      { id: 'r-cat-family', websiteId, name: 'Family Menu', sortOrder: 2 },
    ],
    menus: [
      menu('r-menu-1', websiteId, 'r-cat-signature', 'Chef Signature Rice Set', 'House signature rice with curated sides.', '58000', true, 1, '#561c24'),
      menu('r-menu-2', websiteId, 'r-cat-signature', 'Slow Cooked Beef Plate', 'Tender beef with aromatic spices.', '68000', true, 2, '#7c2d12'),
      menu('r-menu-3', websiteId, 'r-cat-family', 'Seasonal Family Platter', 'Shareable premium platter for small celebrations.', '128000', true, 3, '#854d0e'),
      menu('r-menu-4', websiteId, 'r-cat-family', 'Private Dining Dessert', 'Warm dessert for intimate dining.', '42000', false, 4, '#163b2f'),
    ],
    galleries: [
      gallery('gallery-1', imageSvg('Dining Ambience', '#17120c', '#d6a650'), 'Dining ambience'),
      gallery('gallery-2', imageSvg('Signature Table', '#4a2f1f', '#c28f5c'), 'Signature table'),
      gallery('gallery-3', imageSvg('Private Room', '#163b2f', '#e3a261'), 'Private room'),
    ],
    reviews: [
      { id: 'review-1', customerName: 'Nadia', rating: 5, comment: 'The signature dishes and reservation flow made planning dinner easy.' },
      { id: 'review-2', customerName: 'Arman', rating: 5, comment: 'The restaurant felt premium from the first screen.' },
    ],
  };
}

function menu(id, websiteId, categoryId, name, description, price, isFeatured, sortOrder, color) {
  return {
    id,
    websiteId,
    categoryId,
    name,
    description,
    price,
    isFeatured,
    sortOrder,
    imageUrl: imageSvg(name, color, '#f7c873'),
  };
}

function gallery(id, imageUrl, altText) {
  return { id, category: 'ambience', imageUrl, altText };
}

function imageSvg(label, primary, accent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${primary}" offset="0"/><stop stop-color="${accent}" offset="1"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="930" cy="180" r="190" fill="rgba(255,255,255,.16)"/><circle cx="210" cy="610" r="220" fill="rgba(255,255,255,.12)"/><text x="80" y="430" font-family="Georgia, serif" font-size="72" font-weight="700" fill="white">${escapeSvg(label)}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function escapeSvg(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[char]));
}
