import { chromium, request } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const backendRequire = createRequire(resolve('backend/package.json'));
const sharp = backendRequire('sharp');

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/image-processing-pipeline');
const password = 'Password12345';

const screenshotPaths = {
  uploadUiCopy: `${outputRoot}/upload-ui-copy.png`,
  menuImageUploadWebpResult: `${outputRoot}/menu-image-upload-webp-result.png`,
  galleryImageUploadWebpResult: `${outputRoot}/gallery-image-upload-webp-result.png`,
  dashboardThumbnailPreview: `${outputRoot}/dashboard-thumbnail-preview.png`,
  restaurantPremiumPublicOptimizedImage: `${outputRoot}/restaurant-premium-public-optimized-image.png`,
  brokenImageFallback: `${outputRoot}/broken-image-fallback.png`,
};

mkdirSync(outputRoot, { recursive: true });
for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];

try {
  const session = await createEvidenceTenant();
  await seedSession(page, session);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${baseURL}/app/websites/${session.websiteId}`, { waitUntil: 'networkidle' });
  const uploadCopy = page.getByText(/Gambar akan otomatis dioptimalkan/i).first();
  await uploadCopy.waitFor({ state: 'visible' });
  await uploadCopy.locator('..').locator('..').locator('..').screenshot({ path: screenshotPaths.uploadUiCopy });
  results.push({ target: 'upload_ui_copy', status: 'passed' });

  await page.locator('img').first().screenshot({ path: screenshotPaths.dashboardThumbnailPreview });
  results.push({ target: 'dashboard_processed_webp_preview', status: 'passed' });

  await page.goto(`${baseURL}/site/${session.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await assertNoBrokenImages(page);
  await validateNoHorizontalScroll(page);
  await page.locator('#services').screenshot({ path: screenshotPaths.restaurantPremiumPublicOptimizedImage });
  await page.locator('#services').screenshot({ path: screenshotPaths.menuImageUploadWebpResult });
  await page.locator('#gallery').screenshot({ path: screenshotPaths.galleryImageUploadWebpResult });
  results.push({ target: 'restaurant_premium_public_processed_webp', status: 'passed' });
  results.push({ target: 'menu_public_processed_webp', status: 'passed' });
  results.push({ target: 'gallery_public_processed_webp', status: 'passed' });

  await page.getByText('R3 Broken Image Fallback').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.getByText('R3 Broken Image Fallback').locator('..').locator('..').screenshot({
    path: screenshotPaths.brokenImageFallback,
  });
  results.push({ target: 'broken_image_fallback', status: 'passed' });
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

console.log(`Image processing pipeline evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createEvidenceTenant() {
  const stamp = Date.now();
  const slug = `stage-98d-r3-${stamp}`;
  const email = `stage-98d-r3-${stamp}@example.com`;
  const register = await api.post('/api/v1/auth/register', {
    data: {
      businessName: `Stage 98D R3 Restaurant ${stamp}`,
      slug,
      adminName: 'Stage R3 Admin',
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

  const pngBuffer = await sharp({
    create: { width: 1200, height: 800, channels: 4, background: '#7f1d1d' },
  }).png().toBuffer();
  const jpegBuffer = await sharp({
    create: { width: 1400, height: 900, channels: 3, background: '#0f766e' },
  }).jpeg({ quality: 92 }).toBuffer();
  const webpBuffer = await sharp({
    create: { width: 900, height: 900, channels: 4, background: '#f59e0b' },
  }).webp({ quality: 90 }).toBuffer();

  const logoUpload = await uploadImage(headers, 'logo', 'r3-logo.webp', 'image/webp', webpBuffer);
  const heroUpload = await uploadImage(headers, 'hero', 'r3-hero.jpg', 'image/jpeg', jpegBuffer);
  const menuUpload = await uploadImage(headers, 'menu', 'r3-menu.png', 'image/png', pngBuffer);
  const galleryUpload = await uploadImage(headers, 'gallery', 'r3-gallery.jpg', 'image/jpeg', jpegBuffer);

  await validateUploadResult(logoUpload, 'medium');
  await validateUploadResult(heroUpload, 'large');
  await validateUploadResult(menuUpload, 'medium');
  await validateUploadResult(galleryUpload, 'large');
  await validateRejectedUpload(headers, 'gallery');

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName: `Stage 98D R3 Restaurant ${stamp}`,
      tagline: 'Optimized image upload validation.',
      description: 'Restaurant Premium evidence tenant for WebP processing, dashboard previews, and public fallback behavior.',
      address: 'Jl. WebP Pipeline No. 9, Jakarta',
      phone: '02190001009',
      whatsapp: '081290010090',
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
    data: { logoUrl: logoUpload.url, heroImageUrl: heroUpload.url, premiumColorPreset: 'elegant_maroon' },
  }), 'Update theme assets');

  const category = await mustJson(api.post('/api/v1/menu-categories', {
    headers,
    data: { websiteId: website.id, name: 'R3 Optimized Menu' },
  }), 'Create category');

  await mustOk(api.post('/api/v1/menus', {
    headers,
    data: {
      websiteId: website.id,
      categoryId: category.id,
      name: 'R3 Optimized Ramen',
      description: 'PNG upload processed into WebP medium and large variants.',
      price: 58000,
      imageUrl: menuUpload.url,
      isFeatured: true,
    },
  }), 'Create optimized menu');

  await mustOk(api.post('/api/v1/menus', {
    headers,
    data: {
      websiteId: website.id,
      categoryId: category.id,
      name: 'R3 Broken Image Fallback',
      description: 'Intentional missing upload URL to validate public fallback rendering.',
      price: 42000,
      imageUrl: `/api/v1/uploads/${website.tenantId}/menu/missing-medium.webp`,
      isFeatured: true,
    },
  }), 'Create broken fallback menu');

  const galleryAlt = 'R3 Optimized Gallery Image';
  await mustOk(api.post(`/api/v1/websites/${website.id}/gallery`, {
    headers,
    data: { imageUrl: galleryUpload.url, altText: galleryAlt },
  }), 'Create gallery');

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish website');

  return { ...session, websiteId: website.id, slug, galleryAlt, uploads: { logoUpload, heroUpload, menuUpload, galleryUpload } };
}

async function uploadImage(headers, assetType, name, mimeType, buffer) {
  const response = await api.post(`/api/v1/uploads/${assetType}`, {
    headers,
    multipart: {
      file: { name, mimeType, buffer },
    },
  });
  if (!response.ok()) throw new Error(`Upload ${assetType} failed: ${response.status()} ${await response.text()}`);
  return response.json();
}

async function validateUploadResult(upload, expectedPrimary) {
  if (upload.mimeType !== 'image/webp') throw new Error(`Expected WebP mimeType, got ${upload.mimeType}`);
  for (const key of ['originalUrl', 'thumbnailUrl', 'mediumUrl', 'largeUrl']) {
    if (!upload[key]) throw new Error(`Missing ${key} in upload response`);
  }
  if (!upload.url.endsWith(`-${expectedPrimary}.webp`)) {
    throw new Error(`Expected ${expectedPrimary} primary URL, got ${upload.url}`);
  }
  const fileResponse = await api.get(upload.url);
  if (!fileResponse.ok()) throw new Error(`Processed file unreadable: ${fileResponse.status()} ${await fileResponse.text()}`);
  const contentType = fileResponse.headers()['content-type'];
  if (!contentType?.includes('image/webp')) throw new Error(`Expected image/webp content type, got ${contentType}`);
}

async function validateRejectedUpload(headers, assetType) {
  const response = await api.post(`/api/v1/uploads/${assetType}`, {
    headers,
    multipart: {
      file: { name: 'unsupported.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a-unsupported') },
    },
  });
  if (response.ok()) throw new Error('Unsupported GIF upload was accepted');
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

async function assertNoBrokenImages(targetPage) {
  const brokenImages = await targetPage.evaluate(() => Array.from(document.images)
    .filter((image) => image.offsetParent !== null && !image.complete)
    .map((image) => image.getAttribute('src')));
  if (brokenImages.length) throw new Error(`Visible broken images: ${brokenImages.join(', ')}`);
}
