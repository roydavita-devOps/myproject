# PHASE 9.9B - Cafe Premium Hero Display Control Report

Last updated: 2026-07-08

## 1. Executive Summary

Stage 9.9B exposes the existing Premium Hero Display dashboard controls to Cafe Premium. Cafe Premium can now use the same Static image and Rotating images modes as Restaurant Premium through the existing `Theme.heroMedia` data contract.

No backend, database, Prisma, upload pipeline, video hero, media library, marketplace, payment, billing, subscription, entitlement, hosting renewal, publish gate, or new template feature was introduced.

## 2. Scope

Included:

- Audit of the current Restaurant Premium-only dashboard gate.
- Conversion to a template capability metadata gate.
- Cafe Premium dashboard access to Hero Display controls.
- Cafe Premium public slideshow validation using existing renderer logic.
- Restaurant Premium dashboard regression validation.
- Classic Cafe guard validation.
- Source tests, local Docker validation, health check, smoke tests, and screenshot evidence.

Excluded:

- Cafe Premium redesign.
- Restaurant Premium visual changes.
- Backend/API changes.
- Prisma migration.
- Upload processing or storage changes.
- Video hero or media library.
- Payment, subscription, marketplace, hosting renewal, and publish gate.

## 3. Current Issue

Cafe Premium already rendered public hero slideshow data through `website.theme.heroMedia`, but the dashboard editor still gated the Hero Display controls behind Restaurant Premium only.

Current gate found:

```tsx
{isRestaurantPremiumTemplate(website) && (
  <HeroSlideshowManager ... />
)}
```

This meant Cafe Premium tenants saw only the single Hero image upload field and could not manage rotating hero images from the dashboard.

## 4. Hero Display Gate Audit

Files audited:

- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `frontend/src/features/uploads/heroMedia.ts`
- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/templates/CafePremiumTemplate.tsx`
- `frontend/src/features/templates/registry/templateMetadata.ts`
- `frontend/src/features/templates/registry/templateTypes.ts`
- `frontend/src/types/api.ts`

Findings:

- `WebsiteEditorPage.tsx` used a Restaurant Premium-specific helper.
- `RestaurantPremiumTemplate.tsx` and `CafePremiumTemplate.tsx` both already consume `normalizeHeroMedia()`.
- `CafePremiumTemplate.tsx` already supports slideshow fallback logic when at least two valid images exist.
- `Theme.heroMedia` already exists in the frontend type contract.
- No backend or schema change was needed.

## 5. Premium Capability Implementation

Implemented a metadata-based capability:

```ts
supportsHeroSlideshow?: boolean;
```

Enabled for:

- `restaurant_premium`
- `cafe_premium`

Not enabled for:

- `restaurant_classic`
- `cafe_modern`
- other classic/basic templates

The dashboard now checks:

```ts
supportsHeroSlideshow(website)
```

instead of a Restaurant Premium-only condition.

## 6. Cafe Premium Dashboard UI

Cafe Premium now shows:

- Hero Display
- Static image
- Rotating images
- Choose hero images
- 2-5 image guidance
- Slideshow thumbnail previews
- Remove image controls
- Save hero display

Evidence:

- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-hero-display-static.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-hero-display-rotating-images.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-hero-slideshow-thumbnails.png`

## 7. Public Cafe Premium Slideshow Validation

Cafe Premium public hero was validated with `heroMediaType = slideshow` and three valid hero images.

Result:

- Public Cafe Premium hero rendered the slideshow image source.
- CTA remained visible.
- No broken images were detected.
- No horizontal scroll was detected.
- Existing fallback behavior remains intact for invalid or insufficient slideshow data.

Evidence:

- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-public-hero-slideshow.png`

## 8. Restaurant Premium Regression Review

Restaurant Premium still shows Hero Display controls and rotating image mode after the gate was converted to metadata capability.

Evidence:

- `docs/evidence/cafe-premium-hero-display-9.9b/restaurant-premium-hero-display-regression.png`

## 9. Classic Template Guard

Classic Cafe (`cafe_modern`) was validated and did not render the Hero Display controls.

Evidence:

- `docs/evidence/cafe-premium-hero-display-9.9b/classic-cafe-no-hero-display.png`

## 10. Files Modified

- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `frontend/src/features/templates/registry/templateMetadata.ts`
- `frontend/src/features/templates/registry/templateTypes.ts`
- `frontend/src/features/uploads/__tests__/heroSlideshowSource.test.ts`
- `scripts/generate-cafe-premium-hero-display-99b-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/06-modern-template/README.md`
- `docs/06-modern-template/reports/PHASE-9.9B-Cafe-Premium-Hero-Display-Control-Report.md`
- `docs/evidence/cafe-premium-hero-display-9.9b/`

## 11. Testing Results

Commands run:

```powershell
node --check scripts\generate-cafe-premium-hero-display-99b-evidence.mjs
docker compose up -d --build
Invoke-WebRequest http://127.0.0.1/health/ready -UseBasicParsing
node scripts\generate-cafe-premium-hero-display-99b-evidence.mjs
npm --prefix frontend run test
npm --prefix frontend run lint
npm --prefix frontend run build
npm run smoke-test
```

Results:

- Evidence script syntax check: passed.
- Local Docker rebuild: passed.
- Local health check: `200`.
- Evidence generation: passed.
- Frontend tests: 10 files passed, 83 tests passed.
- Frontend lint: passed.
- Frontend production build: passed.
- Smoke tests: 10 passed.

Known build note:

- Vite still reports the existing warning that the main production JS chunk is larger than 500 kB. This is a warning, not a build failure.

## 12. Evidence Locations

- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-hero-display-static.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-hero-display-rotating-images.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-hero-slideshow-thumbnails.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/cafe-premium-public-hero-slideshow.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/restaurant-premium-hero-display-regression.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/classic-cafe-no-hero-display.png`
- `docs/evidence/cafe-premium-hero-display-9.9b/visual-validation-results.json`

## 13. Remaining Risks

- Railway production validation remains deferred while Railway trial is inactive/expired.
- The existing Vite chunk-size warning remains outside this stage.
- Actual production deployment depends on GitHub-connected Vercel/Railway pipelines after push.

## 14. Go / No-Go Decision

Recommendation: Go for Stage 9.9B approval.

Reason:

- Cafe Premium dashboard now exposes Hero Display controls.
- Cafe Premium supports Static image and Rotating images through existing `Theme.heroMedia`.
- Restaurant Premium still works.
- Classic Cafe remains guarded.
- Tests, lint, build, Docker health, smoke tests, and evidence generation passed locally.
