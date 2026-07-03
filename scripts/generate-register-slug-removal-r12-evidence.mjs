import { chromium, request } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const baseURL = process.env.EVIDENCE_BASE_URL ?? 'http://127.0.0.1';
const outputRoot = resolve('docs/evidence/register-slug-removal-r12');
const screenshotPaths = {
  registerFormWithoutSlug: `${outputRoot}/register-form-without-slug.png`,
  businessInformationSlugEditor: `${outputRoot}/business-information-slug-editor.png`,
  slugUpdateSuccess: `${outputRoot}/slug-update-success.png`,
  publicSiteAfterSlugUpdate: `${outputRoot}/public-site-after-slug-update.png`,
};

mkdirSync(outputRoot, { recursive: true });
for (const file of Object.values(screenshotPaths)) mkdirSync(dirname(file), { recursive: true });

const stamp = Date.now();
const email = `stage-98d-r12-${stamp}@example.com`;
const password = 'Password12345';
const nextSlug = `stage-98d-r12-${stamp}`;
const results = [];
let registerPayload = null;

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.route('**/api/v1/auth/register', async (route) => {
    registerPayload = route.request().postDataJSON();
    await route.continue();
  });

  await page.goto(`${baseURL}/auth/register`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Register' }).waitFor({ state: 'visible' });
  if (await page.getByLabel('Slug').count()) throw new Error('Register page still renders Slug field');
  if (await page.getByPlaceholder('warteg-moncer').count()) throw new Error('Register page still renders slug placeholder');
  await page.locator('form').screenshot({ path: screenshotPaths.registerFormWithoutSlug });
  results.push({ target: 'register_form_without_slug', status: 'passed' });

  await page.getByLabel('Business name').fill('R12 Ramen House');
  await page.getByLabel('Business type').selectOption('RESTAURANT');
  await page.getByLabel('Admin name').fill('Stage R12 Admin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /create tenant/i }).click();
  await page.waitForURL('**/app/dashboard', { timeout: 30_000 });
  if (!registerPayload) throw new Error('Register payload was not captured');
  if (Object.prototype.hasOwnProperty.call(registerPayload, 'slug')) throw new Error(`Register payload still includes slug: ${JSON.stringify(registerPayload)}`);
  results.push({ target: 'register_payload_without_slug', status: 'passed' });

  const accessToken = await page.evaluate(() => localStorage.getItem('umkm.accessToken'));
  if (!accessToken) throw new Error('Access token was not saved after registration');
  const api = await request.newContext({ baseURL, extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` } });
  const websites = await mustJson(api.get('/api/v1/websites'), 'Website list');
  const [website] = websites;
  if (!website?.id) throw new Error('Registered tenant did not create a website');

  await page.goto(`${baseURL}/app/websites/${website.id}`, { waitUntil: 'networkidle' });
  const slugPanel = page.locator('form').filter({ hasText: 'Business slug' });
  await slugPanel.waitFor({ state: 'visible' });
  await slugPanel.screenshot({ path: screenshotPaths.businessInformationSlugEditor });
  results.push({ target: 'business_information_slug_editor', status: 'passed' });

  const slugInput = page.getByLabel('Public URL slug');
  await slugInput.fill(nextSlug);
  await page.getByRole('button', { name: /save slug/i }).click();
  await page.getByText('Business slug saved.').waitFor({ state: 'visible' });
  await slugPanel.screenshot({ path: screenshotPaths.slugUpdateSuccess });
  results.push({ target: 'slug_update_success', status: 'passed' });

  const duplicateResponse = await api.put('/api/v1/tenants/me', {
    data: { name: 'R12 Ramen House', slug: nextSlug },
  });
  if (!duplicateResponse.ok()) throw new Error(`Saving the same current tenant slug should remain valid: ${duplicateResponse.status()} ${await duplicateResponse.text()}`);
  results.push({ target: 'current_tenant_slug_update_still_valid', status: 'passed' });

  const duplicateRegister = await api.post('/api/v1/auth/register', {
    data: {
      businessName: 'Duplicate R12 Tenant',
      slug: nextSlug,
      adminName: 'Duplicate Admin',
      email: `stage-98d-r12-duplicate-${stamp}@example.com`,
      password,
      businessType: 'RESTAURANT',
    },
  });
  if (duplicateRegister.status() !== 400) {
    throw new Error(`Duplicate explicit slug should be rejected, got ${duplicateRegister.status()} ${await duplicateRegister.text()}`);
  }
  results.push({ target: 'duplicate_slug_validation_still_active', status: 'passed' });

  await mustOk(api.patch(`/api/v1/websites/${website.id}/publish`), 'Publish website');
  await page.goto(`${baseURL}/site/${nextSlug}`, { waitUntil: 'networkidle' });
  await page.getByText('R12 Ramen House').first().waitFor({ state: 'visible' });
  await page.screenshot({ path: screenshotPaths.publicSiteAfterSlugUpdate, fullPage: true });
  results.push({ target: 'public_site_after_slug_update', status: 'passed' });

  await api.dispose();
} finally {
  await context.close();
  await browser.close();
}

const resultPath = `${outputRoot}/visual-validation-results.json`;
writeFileSync(resultPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseURL,
  registerPayload: sanitizePayload(registerPayload),
  screenshots: screenshotPaths,
  results,
}, null, 2));

console.log(`Register slug removal R12 evidence generated at ${outputRoot}`);
console.log(`Validation result: ${resultPath}`);

async function mustOk(responsePromise, label) {
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`${label} failed: ${response.status()} ${await response.text()}`);
  return response;
}

async function mustJson(responsePromise, label) {
  const response = await mustOk(responsePromise, label);
  return response.json();
}

function sanitizePayload(payload) {
  if (!payload) return payload;
  return {
    ...payload,
    password: payload.password ? '[redacted]' : payload.password,
  };
}
