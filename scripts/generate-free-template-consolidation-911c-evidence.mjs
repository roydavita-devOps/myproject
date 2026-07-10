import { chromium, request } from '@playwright/test';

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/free-template-consolidation-9.11c');
const password = 'Password12345';

const screenshotPaths = {
  templateModal3FreeCards: `${outputRoot}/template-modal-3-free-cards.png`,
  foodBeverageFreeCard: `${outputRoot}/food-beverage-free-card.png`,
  businessFreeCard: `${outputRoot}/business-free-card.png`,
  servicesFreeCard: `${outputRoot}/services-free-card.png`,
  templateModalPremiumSection: `${outputRoot}/template-modal-premium-section.png`,
  restaurantPremiumPrimaryRegression: `${outputRoot}/restaurant-premium-primary-regression.png`,
  cafePremiumModalRegression: `${outputRoot}/cafe-premium-modal-regression.png`,
  foodBeverageFreePreview: `${outputRoot}/food-beverage-free-preview.png`,
  businessFreePreview: `${outputRoot}/business-free-preview.png`,
  servicesFreePreview: `${outputRoot}/services-free-preview.png`,
  foodBeverageFreeSelectedFromLegacyCafe: `${outputRoot}/food-beverage-free-selected-from-legacy-cafe.png`,
  businessFreeSelectedFromLegacyCorporate: `${outputRoot}/business-free-selected-from-legacy-corporate.png`,
  servicesFreeSelectedFromLegacyClinic: `${outputRoot}/services-free-selected-from-legacy-clinic.png`,
  templateChangeConfirmationGroupedFree: `${outputRoot}/template-change-confirmation-grouped-free.png`,
  selectedTemplateAfterFoodBeverageFree: `${outputRoot}/selected-template-after-food-beverage-free.png`,
  selectedTemplateAfterBusinessFree: `${outputRoot}/selected-template-after-business-free.png`,
  selectedTemplateAfterServicesFree: `${outputRoot}/selected-template-after-services-free.png`,
  publishReadinessRegression: `${outputRoot}/publish-readiness-regression.png`,
  luxuryHiddenRegression: `${outputRoot}/luxury-hidden-regression.png`,
  freeTemplateNoPremiumHeroDisplay: `${outputRoot}/free-template-no-premium-hero-display.png`,
};

for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const api = await request.newContext({ baseURL });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const results = [];

try {
  const tenant = await createReadyTenant('stage-911c-free', 'RESTAURANT', 'Stage 911C Free Consolidation');
  await assignTemplate(tenant, 'restaurant_classic');
  await loginAndOpenTemplates(tenant);

  await page.getByTestId('template-primary-recommendation').screenshot({ path: screenshotPaths.restaurantPremiumPrimaryRegression });
  await openTemplateModal();
  const dialog = page.getByRole('dialog', { name: /view more templates/i });
  const freeSection = page.getByTestId('template-section-free-templates');
  const premiumSection = page.getByTestId('template-section-premium-templates');
  await expectCount(freeSection.locator('article'), 3, 'Free modal cards');
  await expectCount(premiumSection.locator('article'), 2, 'Premium modal cards');
  await freeSection.screenshot({ path: screenshotPaths.templateModal3FreeCards });
  await modalTemplateCard('Food & Beverage Free').screenshot({ path: screenshotPaths.foodBeverageFreeCard });
  await modalTemplateCard('Business Free').screenshot({ path: screenshotPaths.businessFreeCard });
  await modalTemplateCard('Services Free').screenshot({ path: screenshotPaths.servicesFreeCard });
  await premiumSection.screenshot({ path: screenshotPaths.templateModalPremiumSection });
  await modalTemplateCard('Cafe Premium').screenshot({ path: screenshotPaths.cafePremiumModalRegression });
  await dialog.screenshot({ path: screenshotPaths.luxuryHiddenRegression });

  const dialogText = await dialog.innerText();
  for (const hiddenName of ['Restaurant Free', 'Cafe Free', 'Laundry Free', 'Clinic Free', 'Corporate Free', 'Restaurant Classic', 'Cafe Modern', 'Laundry Clean', 'Clinic Professional', 'Corporate Executive', 'Minimal Business', 'Restaurant Luxury']) {
    if (dialogText.includes(hiddenName)) throw new Error(`Hidden or duplicate template name is visible in modal: ${hiddenName}`);
  }
  results.push({ target: 'modal_reduced_to_three_free_and_two_premium_cards', status: 'passed' });

  await closeTemplateModal();
  await capturePreview(tenant, 'restaurant_classic', 'Food & Beverage Free', screenshotPaths.foodBeverageFreePreview);
  await capturePreview(tenant, 'corporate_executive', 'Business Free', screenshotPaths.businessFreePreview);
  await capturePreview(tenant, 'laundry_clean', 'Services Free', screenshotPaths.servicesFreePreview);
  results.push({ target: 'grouped_free_previews_use_primary_template_keys', status: 'passed' });

  await assignTemplate(tenant, 'cafe_modern');
  await loginAndOpenTemplates(tenant);
  await page.getByTestId('template-current-selected').getByText('Food & Beverage Free').waitFor({ state: 'visible' });
  await openTemplateModal();
  await modalTemplateCard('Food & Beverage Free').screenshot({ path: screenshotPaths.foodBeverageFreeSelectedFromLegacyCafe });
  await closeTemplateModal();

  await assignTemplate(tenant, 'corporate_executive');
  await loginAndOpenTemplates(tenant);
  await page.getByTestId('template-current-selected').getByText('Business Free').waitFor({ state: 'visible' });
  await openTemplateModal();
  await modalTemplateCard('Business Free').screenshot({ path: screenshotPaths.businessFreeSelectedFromLegacyCorporate });
  await closeTemplateModal();

  await assignTemplate(tenant, 'clinic_professional');
  await loginAndOpenTemplates(tenant);
  await page.getByTestId('template-current-selected').getByText('Services Free').waitFor({ state: 'visible' });
  await openTemplateModal();
  await modalTemplateCard('Services Free').screenshot({ path: screenshotPaths.servicesFreeSelectedFromLegacyClinic });
  await modalTemplateCard('Food & Beverage Free').getByRole('button', { name: /use template/i }).click();
  await page.getByRole('dialog', { name: /change template to food & beverage free/i }).screenshot({ path: screenshotPaths.templateChangeConfirmationGroupedFree });
  await page.getByRole('button', { name: /confirm change/i }).click();
  await page.getByTestId('template-current-selected').getByText('Food & Beverage Free').waitFor({ state: 'visible' });
  await closeTemplateModal();
  await page.getByTestId('template-current-selected').screenshot({ path: screenshotPaths.selectedTemplateAfterFoodBeverageFree });
  await assertSelectedTemplateKey(tenant, 'restaurant_classic');

  await openTemplateModal();
  await modalTemplateCard('Business Free').getByRole('button', { name: /use template/i }).click();
  await page.getByRole('button', { name: /confirm change/i }).click();
  await page.getByTestId('template-current-selected').getByText('Business Free').waitFor({ state: 'visible' });
  await closeTemplateModal();
  await page.getByTestId('template-current-selected').screenshot({ path: screenshotPaths.selectedTemplateAfterBusinessFree });
  await assertSelectedTemplateKey(tenant, 'corporate_executive');

  await openTemplateModal();
  await modalTemplateCard('Services Free').getByRole('button', { name: /use template/i }).click();
  await page.getByRole('button', { name: /confirm change/i }).click();
  await page.getByTestId('template-current-selected').getByText('Services Free').waitFor({ state: 'visible' });
  await closeTemplateModal();
  await page.getByTestId('template-current-selected').screenshot({ path: screenshotPaths.selectedTemplateAfterServicesFree });
  await assertSelectedTemplateKey(tenant, 'laundry_clean');
  results.push({ target: 'legacy_selected_state_and_group_selection_persistence', status: 'passed' });

  await loginAndOpenEditor(tenant);
  if (await page.getByTestId('hero-display-controls').count()) throw new Error('Free template unexpectedly renders premium Hero Display controls.');
  await page.getByText('Branding assets').locator('xpath=ancestor::section[1]').screenshot({ path: screenshotPaths.freeTemplateNoPremiumHeroDisplay });
  await page.getByTestId('publish-readiness-panel').screenshot({ path: screenshotPaths.publishReadinessRegression });
  results.push({ target: 'publish_readiness_and_premium_control_guard', status: 'passed' });
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

console.log(`Free template consolidation Stage 9.11C evidence generated at ${outputRoot}`);
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
      tagline: 'Free template consolidation validation.',
      description: 'Validation tenant for consolidated Free template catalog and selection behavior.',
      address: 'Jl. Free Template 911C, Jakarta',
      phone: '0219113000',
      whatsapp: '08129113000',
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
    { name: 'Consolidated Menu One', description: 'Visible menu item.', price: 18000, isFeatured: true },
    { name: 'Consolidated Menu Two', description: 'Second visible menu item.', price: 22000, isFeatured: false },
    { name: 'Consolidated Menu Three', description: 'Third visible menu item.', price: 25000, isFeatured: false },
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

async function assertSelectedTemplateKey(tenant, expectedTemplateKey) {
  const website = await mustJson(api.get(`/api/v1/websites/${tenant.websiteId}`, { headers: tenant.headers }), 'Get website');
  const selectedKey = website.template?.schema?.templateKey ?? website.template?.name;
  if (selectedKey !== expectedTemplateKey) throw new Error(`Expected selected key ${expectedTemplateKey}, got ${selectedKey}`);
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

async function capturePreview(tenant, templateKey, displayName, path) {
  await page.goto(`${baseURL}/app/websites/${tenant.websiteId}/preview?templateKey=${templateKey}`, { waitUntil: 'networkidle' });
  await page.getByText(`Viewing ${displayName}. This preview does not change your selected template.`).waitFor({ state: 'visible' });
  await page.locator(`main[data-template-key="${templateKey}"]`).waitFor({ state: 'visible' });
  await page.screenshot({ path, fullPage: true });
}

async function openTemplateModal() {
  await page.getByRole('button', { name: /view more templates/i }).click();
  await page.getByRole('dialog', { name: /view more templates/i }).waitFor({ state: 'visible' });
}

async function closeTemplateModal() {
  await page.getByRole('button', { name: /^close$/i }).click();
  await page.getByRole('dialog', { name: /view more templates/i }).waitFor({ state: 'hidden' });
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

async function expectCount(locator, expected, label) {
  const count = await locator.count();
  if (count !== expected) throw new Error(`${label} expected ${expected}, got ${count}`);
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
