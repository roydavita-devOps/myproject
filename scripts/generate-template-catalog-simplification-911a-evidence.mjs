import { chromium, request } from '@playwright/test';

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/template-catalog-simplification-9.11a');
const password = 'Password12345';

const screenshotPaths = {
  templateMainPageRestaurantPremiumOnly: `${outputRoot}/template-main-page-restaurant-premium-only.png`,
  templateMainPageCurrentSelected: `${outputRoot}/template-main-page-current-selected.png`,
  templateViewMoreButton: `${outputRoot}/template-view-more-button.png`,
  templateModalFreeSection: `${outputRoot}/template-modal-free-section.png`,
  templateModalPremiumSection: `${outputRoot}/template-modal-premium-section.png`,
  templateModalCafePremium: `${outputRoot}/template-modal-cafe-premium.png`,
  templateModalFreeTemplate: `${outputRoot}/template-modal-free-template.png`,
  templateChangeConfirmationFromModal: `${outputRoot}/template-change-confirmation-from-modal.png`,
  templateSelectedAfterModalChange: `${outputRoot}/template-selected-after-modal-change.png`,
  templateLuxuryHiddenCheck: `${outputRoot}/template-luxury-hidden-check.png`,
  restaurantPremiumRenderAfterSelection: `${outputRoot}/restaurant-premium-render-after-selection.png`,
  cafePremiumRenderAfterModalSelection: `${outputRoot}/cafe-premium-render-after-modal-selection.png`,
  publishReadinessStillVisible: `${outputRoot}/publish-readiness-still-visible.png`,
  classicFreeNoPremiumHeroDisplay: `${outputRoot}/classic-free-no-premium-hero-display.png`,
};

for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const results = [];

try {
  const restaurantTenant = await createReadyTenant('stage-911a-restaurant', 'RESTAURANT', 'Stage 911A Restaurant');
  await assignTemplate(restaurantTenant, 'restaurant_classic');
  await loginAndOpenTemplates(restaurantTenant);
  await page.getByTestId('template-primary-recommendation').screenshot({ path: screenshotPaths.templateMainPageRestaurantPremiumOnly });
  await page.getByTestId('template-current-selected').screenshot({ path: screenshotPaths.templateMainPageCurrentSelected });
  await page.getByRole('button', { name: /view more templates/i }).screenshot({ path: screenshotPaths.templateViewMoreButton });

  await page.getByRole('button', { name: /view more templates/i }).click();
  await page.getByTestId('template-section-free-templates').screenshot({ path: screenshotPaths.templateModalFreeSection });
  await page.getByTestId('template-section-premium-templates').screenshot({ path: screenshotPaths.templateModalPremiumSection });
  await modalTemplateCard('Cafe Premium').screenshot({ path: screenshotPaths.templateModalCafePremium });
  await modalTemplateCard('Restaurant Classic').screenshot({ path: screenshotPaths.templateModalFreeTemplate });
  await page.getByRole('dialog', { name: /view more templates/i }).screenshot({ path: screenshotPaths.templateLuxuryHiddenCheck });

  if (await page.getByText('Restaurant Luxury').count()) throw new Error('Luxury template is visible in the user-facing modal.');
  results.push({ target: 'main_page_and_modal_visibility', status: 'passed' });

  await page.getByRole('button', { name: /close/i }).click();
  await page.getByTestId('template-primary-recommendation').locator('article').filter({ hasText: 'Restaurant Premium' }).getByRole('button', { name: /use template/i }).click();
  await page.getByRole('dialog', { name: /change template to restaurant premium/i }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /confirm change/i }).click();
  await page.getByTestId('template-current-selected').getByText('Restaurant Premium').waitFor({ state: 'visible' });
  await mustOk(api.patch(`/api/v1/websites/${restaurantTenant.websiteId}/publish`, { headers: restaurantTenant.headers }), 'Publish restaurant tenant');
  await page.goto(`${baseURL}/site/${restaurantTenant.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="restaurant_premium"]').waitFor({ state: 'visible' });
  await page.locator('main[data-template-key="restaurant_premium"]').screenshot({ path: screenshotPaths.restaurantPremiumRenderAfterSelection });
  results.push({ target: 'restaurant_premium_primary_selection_and_public_render', status: 'passed' });

  const cafeTenant = await createReadyTenant('stage-911a-cafe', 'CAFE', 'Stage 911A Cafe');
  await assignTemplate(cafeTenant, 'cafe_modern');
  await loginAndOpenTemplates(cafeTenant);
  await page.getByRole('button', { name: /view more templates/i }).click();
  await modalTemplateCard('Cafe Premium').getByRole('button', { name: /use template/i }).click();
  await page.getByRole('dialog', { name: /change template to cafe premium/i }).screenshot({ path: screenshotPaths.templateChangeConfirmationFromModal });
  await page.getByRole('button', { name: /confirm change/i }).click();
  await page.getByTestId('template-current-selected').getByText('Cafe Premium').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /close/i }).click();
  await page.getByTestId('template-current-selected').screenshot({ path: screenshotPaths.templateSelectedAfterModalChange });
  await mustOk(api.patch(`/api/v1/websites/${cafeTenant.websiteId}/publish`, { headers: cafeTenant.headers }), 'Publish cafe tenant');
  await page.goto(`${baseURL}/site/${cafeTenant.slug}`, { waitUntil: 'networkidle' });
  await page.locator('main[data-template-key="cafe_premium"]').waitFor({ state: 'visible' });
  await page.locator('main[data-template-key="cafe_premium"]').screenshot({ path: screenshotPaths.cafePremiumRenderAfterModalSelection });
  results.push({ target: 'cafe_premium_modal_selection_and_public_render', status: 'passed' });

  await loginAndOpenEditor(cafeTenant);
  await page.getByTestId('publish-readiness-panel').screenshot({ path: screenshotPaths.publishReadinessStillVisible });
  results.push({ target: 'publish_readiness_still_visible', status: 'passed' });

  const freeTenant = await createReadyTenant('stage-911a-free-cafe', 'CAFE', 'Stage 911A Free Cafe');
  await assignTemplate(freeTenant, 'cafe_modern');
  await loginAndOpenEditor(freeTenant);
  if (await page.getByTestId('hero-display-controls').count()) throw new Error('Free Cafe Modern rendered premium Hero Display controls.');
  await page.getByText('Branding assets').locator('xpath=ancestor::section[1]').screenshot({ path: screenshotPaths.classicFreeNoPremiumHeroDisplay });
  results.push({ target: 'free_template_no_premium_hero_display', status: 'passed' });
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

console.log(`Template catalog simplification Stage 9.11A evidence generated at ${outputRoot}`);
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
      tagline: 'Template catalog simplification validation.',
      description: 'Validation tenant for simplified Free and Premium template catalog.',
      address: 'Jl. Template Catalog 911A, Jakarta',
      phone: '0219111000',
      whatsapp: '08129111000',
      email,
      mapsUrl: 'https://maps.google.com',
      openingHours: { mode: 'daily', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], openTime: '09:00', closeTime: '21:00' },
    },
  }), 'Update website');

  await addMenuItems({ headers, websiteId: website.id, businessType });
  return { email, password, slug, websiteId: website.id, headers, businessName };
}

async function addMenuItems(tenant) {
  const label = tenant.businessType === 'CAFE' ? 'Catalog Latte' : 'Catalog Dish';
  const items = [
    { name: `${label} One`, description: 'Featured catalog menu item.', price: 58000, isFeatured: true },
    { name: `${label} Two`, description: 'Second catalog menu item.', price: 68000, isFeatured: false },
    { name: `${label} Three`, description: 'Third catalog menu item.', price: 78000, isFeatured: false },
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
