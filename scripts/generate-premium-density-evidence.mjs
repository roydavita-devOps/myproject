import { chromium, request } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve(process.env.EVIDENCE_OUTPUT_ROOT ?? 'docs/evidence/premium-density-redesign');
const password = 'Password12345';

const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 1100 },
};

const screenshotPaths = {
  restaurant: {
    mobile: `${outputRoot}/restaurant-premium/restaurant-premium-mobile.png`,
    tablet: `${outputRoot}/restaurant-premium/restaurant-premium-tablet.png`,
    desktop: `${outputRoot}/restaurant-premium/restaurant-premium-desktop.png`,
  },
  cafe: {
    mobile: `${outputRoot}/cafe-premium/cafe-premium-mobile.png`,
    tablet: `${outputRoot}/cafe-premium/cafe-premium-tablet.png`,
    desktop: `${outputRoot}/cafe-premium/cafe-premium-desktop.png`,
  },
  color: {
    mobile: `${outputRoot}/color-customization/color-customization-mobile.png`,
    desktop: `${outputRoot}/color-customization/color-customization-desktop.png`,
  },
};

mkdirSync(outputRoot, { recursive: true });
for (const group of Object.values(screenshotPaths)) {
  for (const file of Object.values(group)) mkdirSync(dirname(file), { recursive: true });
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];

try {
  await capturePremiumSite(page, 'restaurant_premium', screenshotPaths.restaurant);
  await capturePremiumSite(page, 'cafe_premium', screenshotPaths.cafe);
  await captureColorCustomization(page);
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

console.log(`Premium density evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function capturePremiumSite(page, templateKey, paths) {
  const payload = buildPremiumWebsitePayload(templateKey);
  const slug = payload.tenant.slug;

  await page.route(`**/api/v1/public/site/${slug}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport);
    await page.goto(`${baseURL}/site/${slug}`, { waitUntil: 'networkidle' });
    await page.locator(`main[data-template-key="${templateKey}"]`).waitFor({ state: 'visible' });
    await waitForImages(page);
    await validatePublicTemplate(page, templateKey, viewportName);
    await page.screenshot({ path: paths[viewportName], fullPage: true });
  }

  await page.unroute(`**/api/v1/public/site/${slug}`);
}

async function captureColorCustomization(page) {
  const api = await request.newContext({ baseURL });
  const stamp = Date.now();
  const slug = `premium-color-${stamp}`;
  const email = `premium-color-${stamp}@example.com`;

  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: `Premium Color ${stamp}`,
      slug,
      adminName: 'Premium Color Admin',
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

  const assign = await api.patch(`/api/v1/websites/${website.id}/template`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    data: { templateKey: 'restaurant_premium' },
  });
  if (!assign.ok()) throw new Error(`Template assign failed: ${assign.status()} ${await assign.text()}`);

  const theme = await api.patch(`/api/v1/websites/${website.id}/theme-assets`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    data: {
      premiumColorPreset: 'deep_green',
      primaryColor: '#163b2f',
      accentColor: '#c7a45a',
    },
  });
  if (!theme.ok()) throw new Error(`Theme color update failed: ${theme.status()} ${await theme.text()}`);

  await page.addInitScript((authSession) => {
    window.localStorage.setItem('umkm.accessToken', authSession.accessToken);
    window.localStorage.setItem('umkm.refreshToken', authSession.refreshToken);
    window.localStorage.setItem('umkm.user', JSON.stringify(authSession.user));
  }, session);

  for (const viewportName of ['mobile', 'desktop']) {
    await page.setViewportSize(viewports[viewportName]);
    await page.goto(`${baseURL}/app/websites/${website.id}/templates`, { waitUntil: 'networkidle' });
    await page.getByText('Brand Colors', { exact: true }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /save colors/i }).waitFor({ state: 'visible' });
    await validateNoHorizontalScroll(page, `color-customization-${viewportName}`);
    await page.screenshot({ path: screenshotPaths.color[viewportName], fullPage: true });
    results.push({ target: 'color-customization', viewport: viewportName, status: 'passed' });
  }

  await api.dispose();
}

async function validatePublicTemplate(page, templateKey, viewportName) {
  await validateNoHorizontalScroll(page, `${templateKey}-${viewportName}`);

  const images = await page.locator('img').evaluateAll((items) =>
    items.map((img) => ({
      alt: img.getAttribute('alt') ?? '',
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    })),
  );
  const brokenImages = images.filter((img) => !img.complete || img.naturalWidth < 1 || img.naturalHeight < 1);
  if (brokenImages.length > 0) {
    throw new Error(`${templateKey}-${viewportName} has broken images: ${JSON.stringify(brokenImages)}`);
  }

  const ctas = page.locator('a[data-template-cta], #services button');
  const ctaCount = await ctas.count();
  if (ctaCount < 1) throw new Error(`${templateKey}-${viewportName} has no CTA`);

  for (let index = 0; index < ctaCount; index += 1) {
    const cta = ctas.nth(index);
    if (!(await cta.isVisible())) throw new Error(`${templateKey}-${viewportName} has hidden CTA at index ${index}`);
    const text = (await cta.textContent())?.trim() ?? '';
    if (!text) throw new Error(`${templateKey}-${viewportName} has blank CTA at index ${index}`);
  }

  const blankSections = await page.locator('section').evaluateAll((sections) =>
    sections.filter((section) => (section.textContent ?? '').trim().length < 5).length,
  );
  if (blankSections > 0) throw new Error(`${templateKey}-${viewportName} has blank sections`);

  results.push({ target: templateKey, viewport: viewportName, images: images.length, ctas: ctaCount, status: 'passed' });
}

async function waitForImages(page) {
  try {
    await page.waitForFunction(() =>
      Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0),
      null,
      { timeout: 15_000 },
    );
  } catch (error) {
    const images = await page.locator('img').evaluateAll((items) =>
      items.map((img) => ({
        alt: img.getAttribute('alt') ?? '',
        src: img.getAttribute('src')?.slice(0, 120) ?? '',
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      })),
    );
    throw new Error(`Image wait failed: ${JSON.stringify(images)}`, { cause: error });
  }
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

function buildPremiumWebsitePayload(templateKey) {
  const isRestaurant = templateKey === 'restaurant_premium';
  const slug = isRestaurant ? 'stage-98c-restaurant-premium' : 'stage-98c-cafe-premium';
  const websiteId = `${templateKey}-stage-98c-website`;

  return {
    id: websiteId,
    tenantId: `${templateKey}-stage-98c-tenant`,
    tenant: { slug },
    templateId: `${templateKey}-stage-98c-template`,
    themeId: `${templateKey}-stage-98c-theme`,
    status: 'PUBLISHED',
    businessName: isRestaurant ? 'Aurum Dining House' : 'Sora Reserve Cafe',
    tagline: isRestaurant ? 'Curated private dining for refined local occasions.' : 'Slow coffee, brunch, and warm premium visits.',
    description: isRestaurant
      ? 'Premium restaurant validation tenant with adaptive signature dishes, cinematic gallery, and reservation-led conversion.'
      : 'Premium cafe validation tenant with adaptive signature menu, lifestyle gallery, and visit-focused conversion.',
    address: isRestaurant ? 'Jl. Dining Premium No. 17, Jakarta' : 'Jl. Kopi Premium No. 21, Bandung',
    phone: isRestaurant ? '02160001006' : '02260001007',
    whatsapp: isRestaurant ? '081260010060' : '081270010070',
    email: isRestaurant ? 'reserve@aurum-dining.demo' : 'hello@sora-reserve.demo',
    mapsUrl: 'https://maps.google.com',
    openingHours: {
      Monday: isRestaurant ? '11.00 - 22.00' : '08.00 - 23.00',
      Tuesday: isRestaurant ? '11.00 - 22.00' : '08.00 - 23.00',
      Wednesday: isRestaurant ? '11.00 - 22.00' : '08.00 - 23.00',
      Thursday: isRestaurant ? '11.00 - 22.00' : '08.00 - 23.00',
      Friday: isRestaurant ? '11.00 - 23.00' : '08.00 - 24.00',
      Saturday: isRestaurant ? '10.00 - 23.00' : '08.00 - 24.00',
      Sunday: isRestaurant ? '10.00 - 22.00' : '09.00 - 23.00',
    },
    template: {
      id: `${templateKey}-stage-98c-template`,
      name: templateKey,
      businessType: isRestaurant ? 'RESTAURANT' : 'CAFE',
      schema: { templateKey, rendererKey: templateKey },
    },
    theme: {
      id: `${templateKey}-stage-98c-theme`,
      name: `${templateKey} premium stage 9.8C theme`,
      primaryColor: isRestaurant ? '#561c24' : '#4f6f52',
      secondaryColor: isRestaurant ? '#d6a650' : '#c28f5c',
      accentColor: isRestaurant ? '#d6a650' : '#c28f5c',
      typography: {
        heading: 'Inter',
        body: 'Inter',
        premiumColorPreset: isRestaurant ? 'elegant_maroon' : 'sage_green',
      },
      heroImageUrl: imageSvg(isRestaurant ? 'Private Dining Room' : 'Premium Cafe Bar', isRestaurant ? '#561c24' : '#4f6f52', isRestaurant ? '#d6a650' : '#c28f5c'),
    },
    categories: isRestaurant
      ? [
          { id: 'r-cat-signature', websiteId, name: 'Signature Plates', sortOrder: 1 },
          { id: 'r-cat-family', websiteId, name: 'Family Menu', sortOrder: 2 },
        ]
      : [
          { id: 'c-cat-drinks', websiteId, name: 'Drinks', sortOrder: 1 },
          { id: 'c-cat-brunch', websiteId, name: 'Brunch', sortOrder: 2 },
        ],
    menus: isRestaurant
      ? [
          menu('r-menu-1', websiteId, 'r-cat-signature', 'Chef Signature Rice Set', 'House signature rice with curated sides.', '58000', true, 1, '#561c24'),
          menu('r-menu-2', websiteId, 'r-cat-signature', 'Slow Cooked Beef Plate', 'Tender beef with aromatic spices.', '68000', true, 2, '#7c2d12'),
          menu('r-menu-3', websiteId, 'r-cat-family', 'Seasonal Family Platter', 'Shareable premium platter.', '128000', true, 3),
          menu('r-menu-4', websiteId, 'r-cat-family', 'Private Dining Dessert', 'Warm dessert for intimate dining.', '42000', false, 4, '#854d0e'),
        ]
      : [
          menu('c-menu-1', websiteId, 'c-cat-drinks', 'House Reserve Latte', 'Espresso blend with balanced house syrup.', '42000', true, 1, '#4f6f52'),
          menu('c-menu-2', websiteId, 'c-cat-drinks', 'Single Origin Pour Over', 'Rotating beans brewed by hand.', '48000', true, 2, '#7c2d12'),
          menu('c-menu-3', websiteId, 'c-cat-brunch', 'Weekend Brunch Plate', 'Warm toast with seasonal garnish.', '68000', true, 3),
          menu('c-menu-4', websiteId, 'c-cat-drinks', 'Craft Mocktail Coffee', 'Bright non-alcoholic coffee drink.', '46000', false, 4, '#14532d'),
        ],
    galleries: [
      gallery('gallery-1', imageSvg(isRestaurant ? 'Dining Ambience' : 'Cafe Ambience', '#17120c', '#d6a650'), isRestaurant ? 'Dining ambience' : 'Cafe ambience'),
      gallery('gallery-2', imageSvg(isRestaurant ? 'Signature Table' : 'Coffee Bar', '#4a2f1f', '#c28f5c'), isRestaurant ? 'Signature table' : 'Coffee bar'),
      gallery('gallery-3', imageSvg(isRestaurant ? 'Private Room' : 'Lifestyle Corner', '#163b2f', '#e3a261'), isRestaurant ? 'Private room' : 'Lifestyle corner'),
    ],
    reviews: [],
  };
}

function menu(id, websiteId, categoryId, name, description, price, isFeatured, sortOrder, color) {
  const item = {
    id,
    websiteId,
    categoryId,
    name,
    description,
    price,
    isFeatured,
    sortOrder,
  };
  if (color) item.imageUrl = imageSvg(name, color, '#f7c873');
  return item;
}

function gallery(id, imageUrl, altText) {
  return { id, category: 'ambience', imageUrl, altText };
}

function imageSvg(label, primary, accent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${primary}" offset="0"/><stop stop-color="${accent}" offset="1"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="930" cy="180" r="190" fill="rgba(255,255,255,.16)"/><circle cx="210" cy="610" r="220" fill="rgba(255,255,255,.12)"/><text x="80" y="430" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="white">${escapeSvg(label)}</text></svg>`;
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
