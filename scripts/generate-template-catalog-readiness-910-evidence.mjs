import { chromium, request } from '@playwright/test';

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/template-catalog-readiness-9.10');
const password = 'Password12345';

const screenshotPaths = {
  templateCatalogPremiumSection: `${outputRoot}/template-catalog-premium-section.png`,
  templateCatalogClassicSection: `${outputRoot}/template-catalog-classic-section.png`,
  templateCatalogRecommendedCafe: `${outputRoot}/template-catalog-recommended-cafe.png`,
  templateCatalogRecommendedRestaurant: `${outputRoot}/template-catalog-recommended-restaurant.png`,
  templateCardRestaurantPremium: `${outputRoot}/template-card-restaurant-premium.png`,
  templateCardCafePremium: `${outputRoot}/template-card-cafe-premium.png`,
  templateSelectionCurrentTemplate: `${outputRoot}/template-selection-current-template.png`,
  templateSelectionChangeConfirmation: `${outputRoot}/template-selection-change-confirmation.png`,
  templateSelectionCafePremiumSelected: `${outputRoot}/template-selection-cafe-premium-selected.png`,
  restaurantPremiumRenderAfterSelection: `${outputRoot}/restaurant-premium-render-after-selection.png`,
  cafePremiumRenderAfterSelection: `${outputRoot}/cafe-premium-render-after-selection.png`,
  classicTemplateNoPremiumHeroDisplay: `${outputRoot}/classic-template-no-premium-hero-display.png`,
};

mkdirSync(outputRoot, { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const results = [];

try {
  const cafeTenant = await createTenant('stage-910-cafe', 'CAFE', 'Stage 910 Cafe Catalog');
  await assignTemplate(cafeTenant, 'restaurant_classic');
  await loginAndOpenTemplates(cafeTenant);
  await page.getByTestId('template-section-recommended-for-your-business').screenshot({ path: screenshotPaths.templateCatalogRecommendedCafe });
  await page.getByTestId('template-section-premium-templates').screenshot({ path: screenshotPaths.templateCatalogPremiumSection });
  await page.getByTestId('template-section-classic-templates').screenshot({ path: screenshotPaths.templateCatalogClassicSection });
  await templateCard('Restaurant Premium').screenshot({ path: screenshotPaths.templateCardRestaurantPremium });
  await templateCard('Cafe Premium').screenshot({ path: screenshotPaths.templateCardCafePremium });
  await templateCard('Restaurant Classic').screenshot({ path: screenshotPaths.templateSelectionCurrentTemplate });
  await assertNoPaymentActions();
  results.push({ target: 'catalog_sections_and_cards', status: 'passed' });

  await templateCard('Cafe Premium').getByRole('button', { name: /use template/i }).click();
  await page.getByRole('dialog', { name: /change template to cafe premium/i }).screenshot({ path: screenshotPaths.templateSelectionChangeConfirmation });
  await page.getByRole('button', { name: /confirm change/i }).click();
  await templateCard('Cafe Premium').getByText('Current template').waitFor({ state: 'visible' });
  await templateCard('Cafe Premium').screenshot({ path: screenshotPaths.templateSelectionCafePremiumSelected });
  const cafeWebsite = await mustJson(api.get(`/api/v1/websites/${cafeTenant.websiteId}`, { headers: cafeTenant.headers }), 'Cafe selected website');
  if (cafeWebsite.template?.schema?.templateKey !== 'cafe_premium') throw new Error('Cafe Premium selection did not persist.');
  await page.goto(`${baseURL}/site/${cafeTenant.slug}`, { waitUntil: 'networkidle' });
  await waitForTemplate('cafe_premium');
  await page.locator('main[data-template-key="cafe_premium"]').screenshot({ path: screenshotPaths.cafePremiumRenderAfterSelection });
  results.push({ target: 'cafe_premium_selection_persistence_and_rendering', status: 'passed' });

  const restaurantTenant = await createTenant('stage-910-restaurant', 'RESTAURANT', 'Stage 910 Restaurant Catalog');
  await assignTemplate(restaurantTenant, 'restaurant_premium');
  await loginAndOpenTemplates(restaurantTenant);
  await page.getByTestId('template-section-recommended-for-your-business').screenshot({ path: screenshotPaths.templateCatalogRecommendedRestaurant });
  await page.goto(`${baseURL}/site/${restaurantTenant.slug}`, { waitUntil: 'networkidle' });
  await waitForTemplate('restaurant_premium');
  await page.locator('main[data-template-key="restaurant_premium"]').screenshot({ path: screenshotPaths.restaurantPremiumRenderAfterSelection });
  results.push({ target: 'restaurant_premium_recommendation_and_rendering', status: 'passed' });

  const classicCafeTenant = await createTenant('stage-910-classic-cafe', 'CAFE', 'Stage 910 Classic Cafe Guard');
  await assignTemplate(classicCafeTenant, 'cafe_modern');
  await loginAndOpenEditor(classicCafeTenant);
  if (await page.getByTestId('hero-display-controls').count()) throw new Error('Classic Cafe unexpectedly rendered premium Hero Display controls.');
  await page.getByText('Branding assets').locator('xpath=ancestor::section[1]').screenshot({ path: screenshotPaths.classicTemplateNoPremiumHeroDisplay });
  results.push({ target: 'classic_template_no_premium_hero_display', status: 'passed' });
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

console.log(`Template catalog Stage 9.10 evidence generated at ${outputRoot}`);
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

  await mustOk(api.put(`/api/v1/websites/${website.id}`, {
    headers,
    data: {
      businessName,
      tagline: 'Template catalog readiness validation.',
      description: 'Validation tenant for premium catalog, recommendation, selection, and rendering readiness.',
      address: 'Jl. Template Catalog 910, Jakarta',
      phone: '0219910000',
      whatsapp: '08129910000',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', openTime: '09:00', closeTime: '21:00' },
    },
  }), 'Update website');
  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`, { headers }), 'Publish website');

  return { email, password, slug, websiteId: website.id, headers, businessName };
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
  await page.getByRole('heading', { name: 'Templates', exact: true }).waitFor({ state: 'visible' });
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

function templateCard(templateName) {
  return page.locator('article').filter({ has: page.getByRole('heading', { name: templateName }) }).first();
}

async function waitForTemplate(templateKey) {
  await page.locator(`main[data-template-key="${templateKey}"]`).waitFor({ state: 'visible' });
}

async function assertNoPaymentActions() {
  for (const pattern of [/pay now/i, /checkout/i, /subscribe/i, /purchase template/i]) {
    if (await page.getByText(pattern).count()) throw new Error(`Unexpected payment action found: ${pattern}`);
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
