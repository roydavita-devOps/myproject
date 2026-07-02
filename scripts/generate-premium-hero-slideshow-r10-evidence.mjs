import { chromium, request } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const backendRequire = createRequire(resolve('backend/package.json'));
const sharp = backendRequire('sharp');

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/premium-hero-slideshow-r10');
const password = 'Password12345';

const screenshotPaths = {
  heroDisplaySettingsStatic: `${outputRoot}/hero-display-settings-static.png`,
  heroDisplaySettingsSlideshow: `${outputRoot}/hero-display-settings-slideshow.png`,
  heroSlideshowThumbnails: `${outputRoot}/hero-slideshow-thumbnails.png`,
  restaurantPremiumHeroSlideshowDesktop: `${outputRoot}/restaurant-premium-hero-slideshow-desktop.png`,
  restaurantPremiumHeroSlideshowMobile: `${outputRoot}/restaurant-premium-hero-slideshow-mobile.png`,
  restaurantPremiumHeroStaticFallback: `${outputRoot}/restaurant-premium-hero-static-fallback.png`,
  restaurantPremiumHeroReducedMotionFallback: `${outputRoot}/restaurant-premium-hero-reduced-motion-fallback.png`,
  heroSlideshowDeleteImage: `${outputRoot}/hero-slideshow-delete-image.png`,
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
  await seedSession(page, session);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/app/websites/${session.websiteId}`, { waitUntil: 'networkidle' });
  await heroDisplayPanel(page).screenshot({ path: screenshotPaths.heroDisplaySettingsStatic });
  results.push({ target: 'hero_display_settings_static', viewport: 'desktop', status: 'passed' });

  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await assertHeroReadable(page);
  await assertNoBrokenImages(page);
  await page.locator('#home').screenshot({ path: screenshotPaths.restaurantPremiumHeroStaticFallback });
  results.push({ target: 'restaurant_premium_static_hero_fallback', viewport: 'desktop', status: 'passed' });

  const heroImages = await uploadSlideshowImages(session);
  await saveHeroMedia(session, { heroMediaType: 'slideshow', heroImages });

  await page.goto(`${baseURL}/app/websites/${session.websiteId}`, { waitUntil: 'networkidle' });
  await heroDisplayPanel(page).screenshot({ path: screenshotPaths.heroDisplaySettingsSlideshow });
  await page.getByText('Hero 1').locator('..').locator('..').locator('..').screenshot({ path: screenshotPaths.heroSlideshowThumbnails });
  results.push({ target: 'hero_display_settings_slideshow', viewport: 'desktop', status: 'passed' });
  results.push({ target: 'hero_slideshow_thumbnails', viewport: 'desktop', status: 'passed' });

  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);
  await assertHeroReadable(page);
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await page.locator('#home').screenshot({ path: screenshotPaths.restaurantPremiumHeroSlideshowDesktop });
  results.push({ target: 'restaurant_premium_hero_slideshow', viewport: 'desktop', status: 'passed' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);
  await assertHeroReadable(page);
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await page.locator('#home').screenshot({ path: screenshotPaths.restaurantPremiumHeroSlideshowMobile });
  results.push({ target: 'restaurant_premium_hero_slideshow', viewport: 'mobile', status: 'passed' });

  const reducedContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await reducedPage.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await assertHeroReadable(reducedPage);
  await assertNoBrokenImages(reducedPage);
  await validateNoHorizontalScroll(reducedPage);
  await reducedPage.locator('#home').screenshot({ path: screenshotPaths.restaurantPremiumHeroReducedMotionFallback });
  await reducedContext.close();
  results.push({ target: 'restaurant_premium_reduced_motion_fallback', viewport: 'mobile', status: 'passed' });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/app/websites/${session.websiteId}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /remove/i }).first().click();
  await heroDisplayPanel(page).screenshot({ path: screenshotPaths.heroSlideshowDeleteImage });
  results.push({ target: 'hero_slideshow_delete_image', viewport: 'desktop', status: 'passed' });
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

console.log(`Premium hero slideshow R10 evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createRestaurantPremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-98d-r10-${stamp}`;
  const email = `stage-98d-r10-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'R10 Bistro',
      slug,
      adminName: 'Stage R10 Admin',
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
  const staticHero = await uploadHero(headers, website.id, 'r10-static-hero.jpg', '#3f1d14');

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: 'R10 Bistro',
      tagline: 'Calm premium dining hero slideshow.',
      description: 'Restaurant Premium evidence tenant for static and rotating hero images with readable overlays.',
      address: 'Jl. Premium Slideshow No. 10, Jakarta',
      phone: '02190001010',
      whatsapp: '081290010100',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', openTime: '11:00', closeTime: '22:00' },
    },
  }), 'Update website');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/template`, {
    headers,
    data: { templateKey: 'restaurant_premium' },
  }), 'Assign template');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/theme-assets`, {
    headers,
    data: {
      heroImageUrl: staticHero.url,
      premiumColorPreset: 'editorial_umber',
      heroMedia: { heroMediaType: 'image', heroImages: [] },
    },
  }), 'Save static hero assets');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish website');

  return { ...session, websiteId: website.id, slug, headers };
}

async function uploadSlideshowImages(session) {
  const colors = ['#6f2f1f', '#172554', '#365314'];
  const uploads = [];
  for (let index = 0; index < colors.length; index += 1) {
    const upload = await uploadHero(session.headers, session.websiteId, `r10-slideshow-${index + 1}.jpg`, colors[index]);
    uploads.push({
      url: upload.url,
      thumbnailUrl: upload.thumbnailUrl,
      mediumUrl: upload.mediumUrl,
      largeUrl: upload.largeUrl,
      alt: `Restaurant premium hero ${index + 1}`,
    });
  }
  return uploads;
}

async function uploadHero(headers, websiteId, name, color) {
  const buffer = await sharp({
    create: { width: 1600, height: 1000, channels: 3, background: color },
  }).jpeg({ quality: 92 }).toBuffer();

  const response = await api.post('/api/v1/uploads/hero', {
    headers,
    multipart: {
      websiteId,
      file: { name, mimeType: 'image/jpeg', buffer },
    },
  });
  if (!response.ok()) throw new Error(`Hero upload failed: ${response.status()} ${await response.text()}`);
  return response.json();
}

async function saveHeroMedia(session, heroMedia) {
  await mustOk(api.patch(`/api/v1/websites/${session.websiteId}/theme-assets`, {
    headers: session.headers,
    data: { heroMedia },
  }), 'Save hero media');
}

function heroDisplayPanel(targetPage) {
  return targetPage.getByText('Hero Display').locator('..').locator('..');
}

async function seedSession(targetPage, session) {
  await targetPage.addInitScript((authSession) => {
    window.localStorage.setItem('umkm.accessToken', authSession.accessToken);
    window.localStorage.setItem('umkm.refreshToken', authSession.refreshToken);
    window.localStorage.setItem('umkm.user', JSON.stringify(authSession.user));
  }, session);
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

async function assertNoBrokenImages(targetPage) {
  const brokenImages = await targetPage.evaluate(() => Array.from(document.images)
    .filter((image) => image.offsetParent !== null && image.complete && image.naturalWidth === 0)
    .map((image) => image.getAttribute('src')));
  if (brokenImages.length) throw new Error(`Visible broken images: ${brokenImages.join(', ')}`);
}

async function assertHeroReadable(targetPage) {
  await targetPage.getByRole('heading', { name: /r10 bistro/i }).waitFor({ state: 'visible' });
  await targetPage.getByRole('link', { name: /explore signature dishes/i }).waitFor({ state: 'visible' });
}
