import { chromium, request } from '@playwright/test';

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/cafe-premium-hero-display-9.9b');
const password = 'Password12345';
const pngBytes = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAMUlEQVRIiWNQTX79n5aYYdQC1dEgUh1NRaqjGS15tKhIHi1Nk0crnNejVebrwd2qAABNdoDM/L94YAAAAABJRU5ErkJggg==',
  'base64',
);

const screenshotPaths = {
  cafePremiumHeroDisplayStatic: `${outputRoot}/cafe-premium-hero-display-static.png`,
  cafePremiumHeroDisplayRotatingImages: `${outputRoot}/cafe-premium-hero-display-rotating-images.png`,
  cafePremiumHeroSlideshowThumbnails: `${outputRoot}/cafe-premium-hero-slideshow-thumbnails.png`,
  cafePremiumPublicHeroSlideshow: `${outputRoot}/cafe-premium-public-hero-slideshow.png`,
  restaurantPremiumHeroDisplayRegression: `${outputRoot}/restaurant-premium-hero-display-regression.png`,
  classicCafeNoHeroDisplay: `${outputRoot}/classic-cafe-no-hero-display.png`,
};

mkdirSync(outputRoot, { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const results = [];

try {
  const cafeStatic = await createTenantWithTemplate('stage-99b-cafe-static', 'CAFE', 'cafe_premium', 'Stage 99B Cafe Static');
  await saveHeroMedia(cafeStatic, { heroMediaType: 'image', heroImages: [] });
  await loginAndOpenEditor(cafeStatic);
  await expectHeroDisplayVisible();
  await page.getByRole('button', { name: 'Static image' }).click();
  await page.getByTestId('hero-display-controls').screenshot({ path: screenshotPaths.cafePremiumHeroDisplayStatic });
  results.push({ target: 'cafe_premium_dashboard_static_controls', status: 'passed' });

  const cafeSlideshow = await createTenantWithTemplate('stage-99b-cafe-slideshow', 'CAFE', 'cafe_premium', 'Stage 99B Cafe Slideshow');
  const cafeHeroImages = await uploadHeroImages(cafeSlideshow, 3);
  await saveHeroMedia(cafeSlideshow, { heroMediaType: 'slideshow', heroImages: cafeHeroImages });
  await loginAndOpenEditor(cafeSlideshow);
  await expectHeroDisplayVisible();
  await expectButtonSelected('Rotating images');
  await page.getByTestId('hero-display-controls').screenshot({ path: screenshotPaths.cafePremiumHeroDisplayRotatingImages });
  await page.getByTestId('hero-display-controls').locator('figure').first().waitFor({ state: 'visible' });
  await page.getByTestId('hero-display-controls').screenshot({ path: screenshotPaths.cafePremiumHeroSlideshowThumbnails });
  results.push({ target: 'cafe_premium_dashboard_rotating_controls_and_thumbnails', status: 'passed' });

  await page.goto(`${baseURL}/site/${cafeSlideshow.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="cafe_premium"], #home').first().waitFor({ state: 'visible' });
  await page.locator('#home').screenshot({ path: screenshotPaths.cafePremiumPublicHeroSlideshow });
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  results.push({ target: 'cafe_premium_public_slideshow', status: 'passed' });

  const restaurant = await createTenantWithTemplate('stage-99b-restaurant', 'RESTAURANT', 'restaurant_premium', 'Stage 99B Restaurant Regression');
  const restaurantHeroImages = await uploadHeroImages(restaurant, 2);
  await saveHeroMedia(restaurant, { heroMediaType: 'slideshow', heroImages: restaurantHeroImages });
  await loginAndOpenEditor(restaurant);
  await expectHeroDisplayVisible();
  await expectButtonSelected('Rotating images');
  await page.getByTestId('hero-display-controls').screenshot({ path: screenshotPaths.restaurantPremiumHeroDisplayRegression });
  results.push({ target: 'restaurant_premium_dashboard_regression', status: 'passed' });

  const classicCafe = await createTenantWithTemplate('stage-99b-classic-cafe', 'CAFE', 'cafe_modern', 'Stage 99B Classic Cafe');
  await loginAndOpenEditor(classicCafe);
  if (await page.getByTestId('hero-display-controls').count()) {
    throw new Error('Classic Cafe unexpectedly rendered Hero Display controls.');
  }
  await page.getByText('Branding assets').locator('xpath=ancestor::section[1]').screenshot({ path: screenshotPaths.classicCafeNoHeroDisplay });
  results.push({ target: 'classic_cafe_no_hero_display_controls', status: 'passed' });
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

console.log(`Cafe Premium Stage 9.9B evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createTenantWithTemplate(slugPrefix, businessType, templateKey, businessName) {
  const stamp = Date.now() + Math.floor(Math.random() * 1000);
  const slug = `${slugPrefix}-${stamp}`;
  const email = `${slug}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName,
      slug,
      adminName: `${businessName} Admin`,
      email,
      password,
      businessType,
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
      businessName,
      tagline: templateKey === 'cafe_premium' ? 'Warm premium cafe hero display validation.' : 'Premium hero display validation.',
      description: 'Validation tenant for premium hero display controls and slideshow rendering.',
      address: 'Jl. Hero Display 99B, Jakarta',
      phone: '0219900992',
      whatsapp: '081299009992',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', openTime: '08:00', closeTime: '22:00' },
    },
  }), 'Update website');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/template`, {
    headers,
    data: { templateKey },
  }), `Assign template ${templateKey}`);

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish website');

  return { email, password, slug, websiteId: website.id, headers, templateKey, businessName };
}

async function uploadHeroImages(tenant, count) {
  const images = [];
  for (let index = 0; index < count; index += 1) {
    const upload = await api.post('/api/v1/uploads/hero', {
      headers: tenant.headers,
      multipart: {
        file: {
          name: `hero-${index + 1}.png`,
          mimeType: 'image/png',
          buffer: pngBytes,
        },
      },
    });
    if (!upload.ok()) throw new Error(`Hero upload failed: ${upload.status()} ${await upload.text()}`);
    const body = await upload.json();
    images.push({
      url: body.url,
      thumbnailUrl: body.thumbnailUrl,
      mediumUrl: body.mediumUrl,
      largeUrl: body.largeUrl,
      alt: `${tenant.businessName} hero image ${index + 1}`,
    });
  }
  return images;
}

async function saveHeroMedia(tenant, heroMedia) {
  await mustOk(api.patch(`/api/v1/websites/${tenant.websiteId}/theme-assets`, {
    headers: tenant.headers,
    data: { heroMedia },
  }), 'Save hero media');
}

async function loginAndOpenEditor(tenant) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await context.clearCookies();
  await page.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(tenant.email);
  await page.getByLabel('Password').fill(tenant.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/\/app\/dashboard/, { timeout: 15000 });
  await page.goto(`${baseURL}/app/websites/${tenant.websiteId}`, { waitUntil: 'networkidle' });
  await page.getByText('Branding assets').waitFor({ state: 'visible' });
}

async function expectHeroDisplayVisible() {
  await page.getByTestId('hero-display-controls').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Static image' }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Rotating images' }).waitFor({ state: 'visible' });
}

async function expectButtonSelected(name) {
  const className = await page.getByRole('button', { name }).getAttribute('class');
  if (!className?.includes('border-teal-700')) throw new Error(`${name} is not selected.`);
}

async function assertNoBrokenImages(targetPage) {
  const broken = await targetPage.evaluate(() => Array.from(document.images)
    .filter((image) => image.complete && image.naturalWidth === 0)
    .map((image) => image.getAttribute('alt') || image.getAttribute('src')));
  if (broken.length > 0) throw new Error(`Broken images detected: ${broken.join(', ')}`);
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

async function mustOk(responsePromise, label) {
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`${label} failed: ${response.status()} ${await response.text()}`);
  return response;
}

async function mustJson(responsePromise, label) {
  const response = await mustOk(responsePromise, label);
  return response.json();
}
