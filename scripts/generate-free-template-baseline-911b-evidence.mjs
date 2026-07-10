import { chromium, request } from '@playwright/test';

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/free-template-baseline-9.11b');
const password = 'Password12345';

const screenshotPaths = {
  templateModalFreeRenamedSection: `${outputRoot}/template-modal-free-renamed-section.png`,
  restaurantFreeCard: `${outputRoot}/restaurant-free-card.png`,
  laundryFreeCard: `${outputRoot}/laundry-free-card.png`,
  cafeFreeCard: `${outputRoot}/cafe-free-card.png`,
  clinicFreeCard: `${outputRoot}/clinic-free-card.png`,
  corporateFreeCard: `${outputRoot}/corporate-free-card.png`,
  businessFreeCard: `${outputRoot}/business-free-card.png`,
  freeTemplatePreviewRestaurant: `${outputRoot}/free-template-preview-restaurant.png`,
  freeTemplatePreviewLaundry: `${outputRoot}/free-template-preview-laundry.png`,
  freeTemplatePreviewCafe: `${outputRoot}/free-template-preview-cafe.png`,
  freeTemplatePreviewClinic: `${outputRoot}/free-template-preview-clinic.png`,
  freeTemplatePreviewCorporate: `${outputRoot}/free-template-preview-corporate.png`,
  freeTemplatePreviewBusiness: `${outputRoot}/free-template-preview-business.png`,
  freeTemplateMobileCheck: `${outputRoot}/free-template-mobile-check.png`,
  freeTemplateNoPremiumHeroDisplay: `${outputRoot}/free-template-no-premium-hero-display.png`,
  restaurantPremiumPrimaryRegression: `${outputRoot}/restaurant-premium-primary-regression.png`,
  cafePremiumModalRegression: `${outputRoot}/cafe-premium-modal-regression.png`,
  publishReadinessRegression: `${outputRoot}/publish-readiness-regression.png`,
  luxuryHiddenRegression: `${outputRoot}/luxury-hidden-regression.png`,
};

for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const results = [];

const freeTemplates = [
  ['restaurant_classic', 'Restaurant Free', screenshotPaths.restaurantFreeCard, screenshotPaths.freeTemplatePreviewRestaurant],
  ['laundry_clean', 'Laundry Free', screenshotPaths.laundryFreeCard, screenshotPaths.freeTemplatePreviewLaundry],
  ['cafe_modern', 'Cafe Free', screenshotPaths.cafeFreeCard, screenshotPaths.freeTemplatePreviewCafe],
  ['clinic_professional', 'Clinic Free', screenshotPaths.clinicFreeCard, screenshotPaths.freeTemplatePreviewClinic],
  ['corporate_executive', 'Corporate Free', screenshotPaths.corporateFreeCard, screenshotPaths.freeTemplatePreviewCorporate],
  ['minimal_business', 'Business Free', screenshotPaths.businessFreeCard, screenshotPaths.freeTemplatePreviewBusiness],
];

try {
  const tenant = await createReadyTenant('stage-911b-free', 'RESTAURANT', 'Stage 911B Free Baseline');
  await assignTemplate(tenant, 'restaurant_classic');
  await loginAndOpenTemplates(tenant);
  await page.getByTestId('template-primary-recommendation').screenshot({ path: screenshotPaths.restaurantPremiumPrimaryRegression });
  await page.getByRole('button', { name: /view more templates/i }).click();
  await page.getByTestId('template-section-free-templates').screenshot({ path: screenshotPaths.templateModalFreeRenamedSection });

  for (const [, displayName, cardPath] of freeTemplates) {
    await modalTemplateCard(displayName).screenshot({ path: cardPath });
  }
  await modalTemplateCard('Cafe Premium').screenshot({ path: screenshotPaths.cafePremiumModalRegression });
  await page.getByRole('dialog', { name: /view more templates/i }).screenshot({ path: screenshotPaths.luxuryHiddenRegression });
  if (await page.getByText('Restaurant Luxury').count()) throw new Error('Luxury template is visible in the user-facing modal.');
  for (const internalName of ['restaurant_classic', 'laundry_clean', 'cafe_modern', 'clinic_professional', 'corporate_executive', 'minimal_business']) {
    if (await page.getByText(internalName).count()) throw new Error(`Internal template key is visible in catalog: ${internalName}`);
  }
  results.push({ target: 'free_names_and_hidden_internal_keys', status: 'passed' });

  await page.getByRole('button', { name: /close/i }).click();
  for (const [templateKey, displayName, , previewPath] of freeTemplates) {
    await page.goto(`${baseURL}/app/websites/${tenant.websiteId}/preview?templateKey=${templateKey}`, { waitUntil: 'networkidle' });
    await page.getByText(`Viewing ${displayName}. This preview does not change your selected template.`).waitFor({ state: 'visible' });
    await page.locator(`main[data-template-key="${templateKey}"]`).waitFor({ state: 'visible' });
    await page.screenshot({ path: previewPath, fullPage: true });
  }
  results.push({ target: 'all_free_template_previews_render', status: 'passed' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/app/websites/${tenant.websiteId}/preview?templateKey=restaurant_classic`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_classic"]').waitFor({ state: 'visible' });
  await page.screenshot({ path: screenshotPaths.freeTemplateMobileCheck, fullPage: true });
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (horizontalOverflow) throw new Error('Free template mobile preview has horizontal overflow.');
  await page.setViewportSize({ width: 1440, height: 1000 });

  await loginAndOpenEditor(tenant);
  if (await page.getByTestId('hero-display-controls').count()) throw new Error('Free template unexpectedly renders premium Hero Display controls.');
  await page.getByText('Branding assets').locator('xpath=ancestor::section[1]').screenshot({ path: screenshotPaths.freeTemplateNoPremiumHeroDisplay });
  await page.getByTestId('publish-readiness-panel').screenshot({ path: screenshotPaths.publishReadinessRegression });
  results.push({ target: 'free_template_no_premium_controls_and_publish_readiness', status: 'passed' });
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

console.log(`Free template baseline Stage 9.11B evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function createReadyTenant(slugPrefix, businessType, businessName) {
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
      tagline: 'Free template baseline validation.',
      description: 'Validation tenant for Free template naming and baseline quality.',
      address: 'Jl. Free Template 911B, Jakarta',
      phone: '0219112000',
      whatsapp: '08129112000',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], openTime: '09:00', closeTime: '21:00' },
    },
  }), 'Update website');

  await addMenuItems({ headers, websiteId: website.id });
  return { email, password, slug, websiteId: website.id, headers, businessName };
}

async function addMenuItems(tenant) {
  const items = [
    { name: 'Free Menu One', description: 'Simple visible menu item.', price: 18000, isFeatured: true },
    { name: 'Free Menu Two', description: 'Second visible menu item.', price: 22000, isFeatured: false },
    { name: 'Free Menu Three', description: 'Third visible menu item.', price: 25000, isFeatured: false },
  ];
  for (let index = 0; index < items.length; index += 1) {
    await mustOk(api.post('/api/v1/menus', {
      headers: tenant.headers,
      data: {
        websiteId: tenant.websiteId,
        name: items[index].name,
        description: items[index].description,
        price: items[index].price,
        priceCurrency: 'IDR',
        isFeatured: items[index].isFeatured,
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

async function loginAndOpenTemplates(tenant) {
  await resetBrowserSession();
  await page.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(tenant.email);
  await page.getByLabel('Password').fill(tenant.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/\/app\/dashboard/, { timeout: 15000 });
  await page.goto(`${baseURL}/app/websites/${tenant.websiteId}/templates`, { waitUntil: 'networkidle' });
  await page.getByTestId('template-primary-recommendation').waitFor({ state: 'visible' });
}

async function loginAndOpenEditor(tenant) {
  await resetBrowserSession();
  await page.goto(`${baseURL}/auth/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(tenant.email);
  await page.getByLabel('Password').fill(tenant.password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL(/\/app\/dashboard/, { timeout: 15000 });
  await page.goto(`${baseURL}/app/websites/${tenant.websiteId}`, { waitUntil: 'networkidle' });
  await page.getByText('Branding assets').waitFor({ state: 'visible' });
}

async function resetBrowserSession() {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await context.clearCookies();
}

function modalTemplateCard(templateName) {
  return page.getByRole('dialog', { name: /view more templates/i }).locator('article').filter({ hasText: templateName }).first();
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
