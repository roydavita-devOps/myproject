import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/restaurant-premium-editorial-redesign');

const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 1100 },
};

const screenshotPaths = {
  mobile: `${outputRoot}/restaurant-premium-mobile.png`,
  tablet: `${outputRoot}/restaurant-premium-tablet.png`,
  desktop: `${outputRoot}/restaurant-premium-desktop.png`,
  headerCta: `${outputRoot}/restaurant-premium-header-cta.png`,
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

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseURL}/site/${payload.tenant.slug}`, { waitUntil: 'networkidle' });
    await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
    await waitForImages(page);
    await validateRestaurantPremium(page, viewportName);
    await page.screenshot({ path: screenshotPaths[viewportName], fullPage: true });
  }

  await page.setViewportSize(viewports.desktop);
  await page.goto(`${baseURL}/site/${payload.tenant.slug}`, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: /reserve a table/i }).first().screenshot({ path: screenshotPaths.headerCta });
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

console.log(`Restaurant Premium editorial evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function validateRestaurantPremium(page, viewportName) {
  await validateNoHorizontalScroll(page, viewportName);

  const images = await page.locator('img').evaluateAll((items) =>
    items.map((img) => ({
      alt: img.getAttribute('alt') ?? '',
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    })),
  );
  const brokenImages = images.filter((img) => !img.complete || img.naturalWidth < 1 || img.naturalHeight < 1);
  if (brokenImages.length > 0) throw new Error(`${viewportName} has broken images: ${JSON.stringify(brokenImages)}`);

  const ctas = page.locator('a[data-template-cta], #services button');
  const ctaCount = await ctas.count();
  if (ctaCount < 1) throw new Error(`${viewportName} has no CTA`);
  for (let index = 0; index < ctaCount; index += 1) {
    const cta = ctas.nth(index);
    const text = (await cta.textContent())?.trim() ?? '';
    if (!(await cta.isVisible())) throw new Error(`${viewportName} has hidden CTA at ${index}`);
    if (!text) throw new Error(`${viewportName} has blank CTA at ${index}`);
  }

  await page.getByRole('link', { name: /reserve a table/i }).first().waitFor({ state: 'visible' });
  const headerCtaColor = await page.getByRole('link', { name: /reserve a table/i }).first().evaluate((element) => getComputedStyle(element).color);
  if (headerCtaColor !== 'rgb(255, 255, 255)') {
    throw new Error(`${viewportName} header CTA foreground is not white: ${headerCtaColor}`);
  }
  await page.getByRole('link', { name: /explore signature dishes/i }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /explore full menu/i }).waitFor({ state: 'visible' });

  const genericWhatsAppCount = await page.getByText('Chat WhatsApp', { exact: true }).count();
  if (genericWhatsAppCount > 0) throw new Error(`${viewportName} still renders generic Chat WhatsApp CTA`);

  const blankSections = await page.locator('section').evaluateAll((sections) =>
    sections.filter((section) => (section.textContent ?? '').trim().length < 5).length,
  );
  if (blankSections > 0) throw new Error(`${viewportName} has blank sections`);

  results.push({ viewport: viewportName, images: images.length, ctas: ctaCount, status: 'passed' });
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
  const websiteId = 'restaurant-premium-editorial-website';
  return {
    id: websiteId,
    tenantId: 'restaurant-premium-editorial-tenant',
    tenant: { slug: 'stage-98d-restaurant-editorial' },
    templateId: 'restaurant-premium-editorial-template',
    themeId: 'restaurant-premium-editorial-theme',
    status: 'PUBLISHED',
    businessName: 'Aurum Dining House',
    tagline: 'Private dining, signature plates, and a refined evening table.',
    description: 'A focused restaurant experience for guests who want to see the menu, understand the atmosphere, and reserve without friction.',
    address: 'Jl. Dining Premium No. 17, Jakarta',
    phone: '02160001006',
    whatsapp: '081260010060',
    email: 'reserve@aurum-dining.demo',
    mapsUrl: 'https://maps.google.com',
    openingHours: {
      Monday: '11.00 - 22.00',
      Tuesday: '11.00 - 22.00',
      Wednesday: '11.00 - 22.00',
      Thursday: '11.00 - 22.00',
      Friday: '11.00 - 23.00',
      Saturday: '10.00 - 23.00',
      Sunday: '10.00 - 22.00',
    },
    template: {
      id: 'restaurant-premium-editorial-template',
      name: 'restaurant_premium',
      businessType: 'RESTAURANT',
      schema: { templateKey: 'restaurant_premium', rendererKey: 'restaurant_premium' },
    },
    theme: {
      id: 'restaurant-premium-editorial-theme',
      name: 'Restaurant Premium editorial theme',
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
