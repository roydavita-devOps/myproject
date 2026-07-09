import { chromium, request } from '@playwright/test';

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/publish-readiness-9.11');
const password = 'Password12345';
const publicImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&auto=format&fit=crop';

const screenshotPaths = {
  publishReadinessIncomplete: `${outputRoot}/publish-readiness-incomplete.png`,
  publishReadinessRequiredItems: `${outputRoot}/publish-readiness-required-items.png`,
  publishReadinessRecommendedItems: `${outputRoot}/publish-readiness-recommended-items.png`,
  publishReadinessActionLinks: `${outputRoot}/publish-readiness-action-links.png`,
  publishReadinessReadyToPublish: `${outputRoot}/publish-readiness-ready-to-publish.png`,
  publishConfirmationDialog: `${outputRoot}/publish-confirmation-dialog.png`,
  publishSuccessState: `${outputRoot}/publish-success-state.png`,
  publicUrlAfterPublish: `${outputRoot}/public-url-after-publish.png`,
  previewBeforePublish: `${outputRoot}/preview-before-publish.png`,
  unpublishedPublicState: `${outputRoot}/unpublished-public-state.png`,
  restaurantPremiumReadyCheck: `${outputRoot}/restaurant-premium-ready-check.png`,
  cafePremiumReadyCheck: `${outputRoot}/cafe-premium-ready-check.png`,
};

for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const results = [];

try {
  const incompleteTenant = await createTenant('stage-911-incomplete', 'RESTAURANT', 'Stage 911 Incomplete');
  await assignTemplate(incompleteTenant, 'restaurant_premium');
  await loginAndOpenEditor(incompleteTenant);
  await readinessPanel().screenshot({ path: screenshotPaths.publishReadinessIncomplete });
  await page.getByText('Required before publish').locator('xpath=ancestor::div[contains(@class,"rounded-md")][1]').screenshot({ path: screenshotPaths.publishReadinessRequiredItems });
  await page.getByText('Recommended polish').locator('xpath=ancestor::div[contains(@class,"rounded-md")][1]').screenshot({ path: screenshotPaths.publishReadinessRecommendedItems });
  await page.getByRole('link', { name: /add contact|add address|set hours|add menu item/i }).first().locator('xpath=ancestor::section[@id="launch-readiness"]').screenshot({
    path: screenshotPaths.publishReadinessActionLinks,
  });
  await expectDisabledPublish();
  results.push({ target: 'incomplete_publish_blocked', status: 'passed' });

  const restaurantTenant = await createReadyTenant('stage-911-restaurant', 'RESTAURANT', 'Stage 911 Restaurant Premium', 'restaurant_premium');
  await loginAndOpenEditor(restaurantTenant);
  await readinessPanel().screenshot({ path: screenshotPaths.restaurantPremiumReadyCheck });
  await readinessPanel().screenshot({ path: screenshotPaths.publishReadinessReadyToPublish });
  await page.getByRole('link', { name: /review website/i }).click();
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await page.screenshot({ path: screenshotPaths.previewBeforePublish, fullPage: true });
  await page.goto(`${baseURL}/app/websites/${restaurantTenant.websiteId}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Publish website' }).click();
  await page.getByRole('dialog', { name: /publish this website/i }).screenshot({ path: screenshotPaths.publishConfirmationDialog });
  await page.getByRole('button', { name: /confirm publish/i }).click();
  await page.getByText('PUBLISHED').waitFor({ state: 'visible' });
  await readinessPanel().screenshot({ path: screenshotPaths.publishSuccessState });
  await page.goto(`${baseURL}/site/${restaurantTenant.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await page.screenshot({ path: screenshotPaths.publicUrlAfterPublish, fullPage: true });
  await mustOk(api.patch(`/api/v1/websites/${restaurantTenant.websiteId}/unpublish`, { headers: restaurantTenant.headers }), 'Unpublish restaurant tenant');
  await page.goto(`${baseURL}/site/${restaurantTenant.slug}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: screenshotPaths.unpublishedPublicState, fullPage: true });
  results.push({ target: 'restaurant_ready_publish_preview_public_unpublish', status: 'passed' });

  const cafeTenant = await createReadyTenant('stage-911-cafe', 'CAFE', 'Stage 911 Cafe Premium', 'cafe_premium');
  await loginAndOpenEditor(cafeTenant);
  await readinessPanel().screenshot({ path: screenshotPaths.cafePremiumReadyCheck });
  results.push({ target: 'cafe_premium_ready_check', status: 'passed' });
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

console.log(`Publish readiness Stage 9.11 evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createTenant(slugPrefix, businessType, businessName) {
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
  return { email, password, slug, websiteId: website.id, headers, businessName };
}

async function createReadyTenant(slugPrefix, businessType, businessName, templateKey) {
  const tenant = await createTenant(slugPrefix, businessType, businessName);
  await assignTemplate(tenant, templateKey);
  await mustOk(api.put(`/api/v1/websites/${tenant.websiteId}`, {
    headers: tenant.headers,
    data: {
      businessName,
      tagline: 'Publish readiness validation.',
      description: 'Validation tenant for launch readiness, preview, public URL, and publish state checks.',
      address: 'Jl. Publish Readiness 911, Jakarta',
      phone: '0219110000',
      whatsapp: '08129110000',
      email: tenant.email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], openTime: '09:00', closeTime: '21:00' },
    },
  }), 'Update website');
  await mustOk(api.patch(`/api/v1/websites/${tenant.websiteId}/theme-assets`, {
    headers: tenant.headers,
    data: {
      logoUrl: publicImage,
      heroImageUrl: publicImage,
      heroMedia: {
        heroMediaType: 'slideshow',
        heroImages: [
          { url: publicImage, alt: `${businessName} hero image 1` },
          { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&auto=format&fit=crop', alt: `${businessName} hero image 2` },
        ],
      },
    },
  }), 'Update theme assets');
  await addGallery(tenant, 3);
  await addMenuItems(tenant, businessType);
  return tenant;
}

async function addGallery(tenant, count) {
  for (let index = 0; index < count; index += 1) {
    await mustOk(api.post(`/api/v1/websites/${tenant.websiteId}/gallery`, {
      headers: tenant.headers,
      data: {
        imageUrl: `${publicImage}&sig=${index}`,
        altText: `${tenant.businessName} gallery ${index + 1}`,
      },
    }), `Add gallery ${index + 1}`);
  }
}

async function addMenuItems(tenant, businessType) {
  const label = businessType === 'CAFE' ? 'Latte' : 'Signature Plate';
  const items = [
    { name: `${label} One`, description: 'Featured launch menu item.', price: 58000, isFeatured: true },
    { name: `${label} Two`, description: 'Second launch menu item.', price: 68000, isFeatured: false },
    { name: `${label} Three`, description: 'Third launch menu item.', price: 78000, isFeatured: false },
  ];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    await mustOk(api.post('/api/v1/menus', {
      headers: tenant.headers,
      data: {
        websiteId: tenant.websiteId,
        name: item.name,
        description: item.description,
        price: item.price,
        priceCurrency: 'IDR',
        imageUrl: `${publicImage}&menu=${index}`,
        isFeatured: item.isFeatured,
        sortOrder: index + 1,
      },
    }), `Add menu ${index + 1}`);
  }
}

async function assignTemplate(tenant, templateKey) {
  await mustOk(api.patch(`/api/v1/websites/${tenant.websiteId}/template`, {
    headers: tenant.headers,
    data: { templateKey },
  }), `Assign ${templateKey}`);
}

async function loginAndOpenEditor(tenant) {
  await resetBrowserSession();
  await page.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(tenant.email);
  await page.getByLabel('Password').fill(tenant.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/\/app\/dashboard/, { timeout: 15000 });
  await page.goto(`${baseURL}/app/websites/${tenant.websiteId}`, { waitUntil: 'networkidle' });
  await page.getByTestId('publish-readiness-panel').waitFor({ state: 'visible' });
}

async function resetBrowserSession() {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await context.clearCookies();
}

function readinessPanel() {
  return page.getByTestId('publish-readiness-panel');
}

async function expectDisabledPublish() {
  const publish = page.getByRole('button', { name: 'Publish website' });
  if (await publish.isEnabled()) throw new Error('Publish website button should be disabled for incomplete readiness.');
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
