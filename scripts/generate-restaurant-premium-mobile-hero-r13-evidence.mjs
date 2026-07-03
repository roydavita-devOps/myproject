import { chromium, request } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const backendRequire = createRequire(resolve('backend/package.json'));
const sharp = backendRequire('sharp');

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/restaurant-premium-mobile-hero-r13');
const password = 'Password12345';

const screenshotPaths = {
  mobileHeroStaticCompact: `${outputRoot}/mobile-hero-static-compact.png`,
  mobileHeroSlideshowCompact: `${outputRoot}/mobile-hero-slideshow-compact.png`,
  mobileHeroImageParityDesktop: `${outputRoot}/mobile-hero-image-parity-desktop.png`,
  mobileHeroImageParityMobile: `${outputRoot}/mobile-hero-image-parity-mobile.png`,
  mobileHeroReducedMotionFallback: `${outputRoot}/mobile-hero-reduced-motion-fallback.png`,
  desktopHeroRegressionCheck: `${outputRoot}/desktop-hero-regression-check.png`,
  mobileNoHorizontalOverflow: `${outputRoot}/mobile-no-horizontal-overflow.png`,
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
  await waitForRestaurantPremium(page);
  await assertHeroReadable(page);
  await assertNoBrokenImages(page);
  const staticDesktopSrc = await activeHeroSource(page);
  await page.locator('#home').screenshot({ path: screenshotPaths.mobileHeroImageParityDesktop });
  await page.locator('#home').screenshot({ path: screenshotPaths.desktopHeroRegressionCheck });
  results.push({ target: 'desktop_static_hero_regression', viewport: 'desktop', status: 'passed' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await waitForRestaurantPremium(page);
  await assertHeroReadable(page);
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await assertCompactMobileHero(page);
  const staticMobileSrc = await activeHeroSource(page);
  if (staticDesktopSrc !== staticMobileSrc) throw new Error(`Static hero source mismatch: desktop=${staticDesktopSrc} mobile=${staticMobileSrc}`);
  await page.locator('#home').screenshot({ path: screenshotPaths.mobileHeroStaticCompact });
  await page.locator('#home').screenshot({ path: screenshotPaths.mobileHeroImageParityMobile });
  await page.screenshot({ path: screenshotPaths.mobileNoHorizontalOverflow, fullPage: false });
  results.push({ target: 'mobile_static_compact_same_source', viewport: 'mobile', status: 'passed' });
  results.push({ target: 'mobile_no_horizontal_overflow', viewport: 'mobile', status: 'passed' });

  const heroImages = await uploadSlideshowImages(session);
  await saveHeroMedia(session, { heroMediaType: 'slideshow', heroImages });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await waitForRestaurantPremium(page);
  await page.waitForTimeout(400);
  const slideshowDesktopSrc = await activeHeroSource(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await waitForRestaurantPremium(page);
  await page.waitForTimeout(400);
  await assertHeroReadable(page);
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await assertCompactMobileHero(page);
  const slideshowMobileSrc = await activeHeroSource(page);
  if (slideshowDesktopSrc !== slideshowMobileSrc) throw new Error(`Slideshow first image mismatch: desktop=${slideshowDesktopSrc} mobile=${slideshowMobileSrc}`);
  await page.locator('#home').screenshot({ path: screenshotPaths.mobileHeroSlideshowCompact });
  results.push({ target: 'mobile_slideshow_compact_same_order', viewport: 'mobile', status: 'passed' });

  const reducedContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await waitForRestaurantPremium(reducedPage);
  await assertHeroReadable(reducedPage);
  await assertNoBrokenImages(reducedPage);
  await validateNoHorizontalScroll(reducedPage);
  const reducedSrc = await activeHeroSource(reducedPage);
  if (reducedSrc !== slideshowDesktopSrc) throw new Error(`Reduced-motion fallback source mismatch: reduced=${reducedSrc} expected=${slideshowDesktopSrc}`);
  await reducedPage.locator('#home').screenshot({ path: screenshotPaths.mobileHeroReducedMotionFallback });
  await reducedContext.close();
  results.push({ target: 'mobile_reduced_motion_first_image_fallback', viewport: 'mobile', status: 'passed' });
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

console.log(`Restaurant Premium mobile hero R13 evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createRestaurantPremiumTenant() {
  const stamp = Date.now();
  const slug = `stage-98d-r13-${stamp}`;
  const email = `stage-98d-r13-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'R13 Izakaya',
      slug,
      adminName: 'Stage R13 Admin',
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
  const staticHero = await uploadHero(headers, website.id, 'r13-static-hero.jpg', '#4a1f13', '#d9a45d');

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: 'R13 Izakaya',
      tagline: 'Compact mobile hero with matching premium imagery.',
      description: 'Restaurant Premium evidence tenant for mobile hero image parity, compact layout, readable CTA, and slideshow safety.',
      address: 'Jl. Premium Mobile Hero No. 13, Jakarta',
      phone: '02190001313',
      whatsapp: '081290013130',
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
  const palette = [
    ['#5b2414', '#e0aa5b'],
    ['#2d1a12', '#b77946'],
    ['#172014', '#d4a256'],
  ];
  const uploads = [];
  for (let index = 0; index < palette.length; index += 1) {
    const upload = await uploadHero(session.headers, session.websiteId, `r13-slideshow-${index + 1}.jpg`, palette[index][0], palette[index][1]);
    uploads.push({
      url: upload.url,
      thumbnailUrl: upload.thumbnailUrl,
      mediumUrl: upload.mediumUrl,
      largeUrl: upload.largeUrl,
      alt: `R13 restaurant premium hero ${index + 1}`,
    });
  }
  return uploads;
}

async function uploadHero(headers, websiteId, name, background, accent) {
  const svg = Buffer.from(`
    <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${background}"/>
          <stop offset="1" stop-color="#120c08"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#g)"/>
      <circle cx="980" cy="420" r="220" fill="${accent}" opacity="0.55"/>
      <rect x="240" y="640" width="880" height="90" rx="45" fill="#f6e7c8" opacity="0.28"/>
      <rect x="300" y="500" width="620" height="64" rx="32" fill="#ffffff" opacity="0.18"/>
      <text x="250" y="300" fill="#f6e7c8" font-size="92" font-family="Georgia">Premium Dining</text>
    </svg>
  `);
  const buffer = await sharp(svg).jpeg({ quality: 92 }).toBuffer();

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

async function waitForRestaurantPremium(targetPage) {
  await targetPage.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
}

async function activeHeroSource(targetPage) {
  return targetPage.locator('#home img').first().evaluate((image) => image.currentSrc || image.getAttribute('src') || '');
}

async function assertHeroReadable(targetPage) {
  const hero = targetPage.locator('#home');
  await hero.getByRole('heading', { name: /r13 izakaya/i }).waitFor({ state: 'visible' });
  await hero.getByRole('link', { name: /explore signature dishes/i }).waitFor({ state: 'visible' });
  await hero.getByRole('link', { name: /get directions/i }).waitFor({ state: 'visible' });
}

async function assertCompactMobileHero(targetPage) {
  const box = await targetPage.locator('#home').boundingBox();
  if (!box) throw new Error('Hero bounding box not available');
  if (box.height > 760) throw new Error(`Mobile hero is still too tall: ${box.height}px`);
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

async function mustOk(responsePromise, label) {
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`${label} failed: ${response.status()} ${await response.text()}`);
  return response;
}

async function mustJson(responsePromise, label) {
  const response = await mustOk(responsePromise, label);
  return response.json();
}
