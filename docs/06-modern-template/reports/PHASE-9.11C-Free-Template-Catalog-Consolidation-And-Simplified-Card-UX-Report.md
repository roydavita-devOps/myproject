# Phase 9.11C - Free Template Catalog Consolidation And Simplified Card UX Report

Date: 2026-07-10

## 1. Executive Summary

Stage 9.11C is implemented and locally validated.

The normal user-facing Free template catalog is consolidated from six near-duplicate Free cards into three broad choices:

- Food & Beverage Free
- Business Free
- Services Free

Restaurant Premium remains the only primary recommended template on the main template page. The View More Templates modal now shows three Free cards and two Premium cards: Restaurant Premium and Cafe Premium.

No backend, Prisma, database, payment, subscription, entitlement, marketplace, hosting renewal, luxury, or public template redesign work was introduced.

## 2. Scope

Implemented:

- Consolidated Free modal catalog to three broad cards.
- Preserved all internal template keys and renderers.
- Added group selected-state support for related legacy keys.
- Kept grouped Free selection using existing primary template keys.
- Kept preview behavior using existing template keys.
- Added neutral Free group thumbnail assets.
- Kept Restaurant Premium primary on the main page.
- Kept Restaurant Premium and Cafe Premium in the modal Premium section.
- Captured local screenshot evidence.
- Updated tests and documentation.

Out of scope:

- Backend code changes.
- Prisma migration or database migration.
- Tenant template key migration.
- Payment, subscription, marketplace, or entitlement enforcement.
- Hosting renewal.
- Luxury work.
- New template implementation.
- Restaurant Premium or Cafe Premium redesign.

## 3. Current Free Catalog Problem

After Stage 9.11B, user-facing Free names were clearer, but the modal still exposed too many choices:

- Restaurant Free
- Cafe Free
- Laundry Free
- Clinic Free
- Corporate Free
- Business Free

The cards were too close in purpose for early users and made the Free catalog feel crowded.

## 4. Consolidation Decision

The Free catalog is now grouped into three broad starter choices:

| User-facing card | Purpose |
| --- | --- |
| Food & Beverage Free | Starter for restaurants, cafes, warteg, bakeries, and small eateries. |
| Business Free | Starter for company profiles, service businesses, and general UMKM websites. |
| Services Free | Starter for laundry, clinic, salon, repair, and appointment-based businesses. |

## 5. User-Facing Free Groups

| Group | Description | Highlights |
| --- | --- | --- |
| Food & Beverage Free | A simple starter layout for food and drink businesses such as restaurants, cafes, warteg, bakeries, and small eateries. | Menu-friendly structure; Contact and directions CTA; Simple food business sections |
| Business Free | A flexible starter layout for company profiles, service businesses, and general UMKM websites. | Business profile sections; Services and credibility blocks; Contact-focused layout |
| Services Free | A simple service-business layout for local services such as laundry, clinic, salon, repair, and appointment-based businesses. | Service information structure; Contact and location CTA; Simple trust-building sections |

## 6. Internal Key Preservation

No internal key was renamed or deleted.

Preserved keys:

- `restaurant_classic`
- `laundry_clean`
- `cafe_modern`
- `clinic_professional`
- `corporate_executive`
- `minimal_business`
- `restaurant_premium`
- `cafe_premium`
- `restaurant_luxury`

Consolidated group selection uses existing primary keys:

| Group | Primary selection key | Related legacy keys |
| --- | --- | --- |
| Food & Beverage Free | `restaurant_classic` | `restaurant_classic`, `cafe_modern` |
| Business Free | `corporate_executive` | `corporate_executive`, `minimal_business` |
| Services Free | `laundry_clean` | `laundry_clean`, `clinic_professional` |

Audit note:

The recommended Business Free primary key was reviewed during implementation. `minimal_business` is frontend-renderable, but the existing backend assign-template catalog does not currently accept it. Because backend changes are out of scope, Business Free uses `corporate_executive` as the safer existing assignable primary key. `minimal_business` remains related for selected-state and rendering compatibility.

## 7. Selected State Handling For Legacy Keys

Selected-state rules:

- `restaurant_classic` and `cafe_modern` show Food & Beverage Free as selected.
- `corporate_executive` and `minimal_business` show Business Free as selected.
- `laundry_clean` and `clinic_professional` show Services Free as selected.
- `restaurant_premium` shows Restaurant Premium as selected.
- `cafe_premium` shows Cafe Premium as selected.

No tenant key is auto-migrated. A key changes only when the user explicitly selects a grouped card and confirms the change.

## 8. Preview / Selection Behavior

Preview behavior:

- Food & Beverage Free previews `restaurant_classic`.
- Business Free previews `corporate_executive`.
- Services Free previews `laundry_clean`.

Selection behavior:

- Food & Beverage Free assigns `restaurant_classic`.
- Business Free assigns `corporate_executive`.
- Services Free assigns `laundry_clean`.

No `groupKey` is sent to the backend assign-template API.

## 9. Modal UX Simplification

The View More Templates modal now shows:

Free Templates:

- Food & Beverage Free
- Business Free
- Services Free

Premium Templates:

- Restaurant Premium
- Cafe Premium

Hidden from normal modal cards:

- Restaurant Free
- Cafe Free
- Laundry Free
- Clinic Free
- Corporate Free
- Restaurant Classic
- Cafe Modern
- Laundry Clean
- Clinic Professional
- Corporate Executive
- Minimal Business
- Restaurant Luxury

## 10. Free Card Visual Cleanup

Free catalog cards now use neutral consolidated SVG thumbnails:

- `food-beverage-free.svg`
- `business-free.svg`
- `services-free.svg`

The thumbnails avoid old implementation-era labels and avoid mismatches such as a Business Free card showing a Corporate Executive preview label.

## 11. Premium Regression Validation

Validated:

- Restaurant Premium remains the only primary recommended card on the main template page.
- Restaurant Premium remains visible in the modal Premium section.
- Cafe Premium remains visible and selectable in the modal Premium section.
- Premium names remain unchanged.
- Premium Hero Display remains guarded to Restaurant Premium and Cafe Premium capability metadata.
- Free groups do not render Premium Hero Display controls.
- Luxury remains hidden/deferred.

## 12. Publish Readiness Compatibility

Validated:

- Publish readiness panel still appears.
- Food & Beverage Free selection persists.
- Business Free selection persists.
- Services Free selection persists.
- Public renderers still use existing selected primary keys.
- Existing legacy keys remain resolvable and selected-state aware.

## 13. Files Modified

- `frontend/src/features/templates/templateCatalog.ts`
- `frontend/src/features/templates/TemplateSelectionPage.tsx`
- `frontend/src/features/websites/WebsitePreviewPage.tsx`
- `frontend/src/features/templates/registry/__tests__/templateCatalogReadiness.test.ts`
- `frontend/public/template-previews/food-beverage-free.svg`
- `frontend/public/template-previews/business-free.svg`
- `frontend/public/template-previews/services-free.svg`
- `smoke/saas.smoke.spec.ts`
- `scripts/generate-free-template-consolidation-911c-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/README.md`

## 14. Testing Results

| Check | Result |
| --- | --- |
| `npm --prefix frontend run test` | Passed: 12 files, 96 tests |
| `npm --prefix frontend run lint` | Passed |
| `npm --prefix frontend run build` | Passed |
| `docker compose up -d --build` | Passed |
| `Invoke-WebRequest http://127.0.0.1/health/ready -UseBasicParsing` | Passed: backend OK, database OK |
| `node scripts/generate-free-template-consolidation-911c-evidence.mjs` | Passed |
| `npm run smoke-test` | Passed: 10/10 |

Build warning:

- Vite still reports the existing non-blocking chunk-size warning for a bundle over 500 kB after minification.

## 15. Evidence Locations

Evidence folder:

- `docs/evidence/free-template-consolidation-9.11c/`

Evidence files:

- `template-modal-3-free-cards.png`
- `food-beverage-free-card.png`
- `business-free-card.png`
- `services-free-card.png`
- `template-modal-premium-section.png`
- `restaurant-premium-primary-regression.png`
- `cafe-premium-modal-regression.png`
- `food-beverage-free-preview.png`
- `business-free-preview.png`
- `services-free-preview.png`
- `food-beverage-free-selected-from-legacy-cafe.png`
- `business-free-selected-from-legacy-corporate.png`
- `services-free-selected-from-legacy-clinic.png`
- `template-change-confirmation-grouped-free.png`
- `selected-template-after-food-beverage-free.png`
- `selected-template-after-business-free.png`
- `selected-template-after-services-free.png`
- `publish-readiness-regression.png`
- `luxury-hidden-regression.png`
- `free-template-no-premium-hero-display.png`
- `visual-validation-results.json`

## 16. Local-Only / Railway Status

Stage 9.11C was validated locally with Docker.

Railway production redeploy remains deferred while Railway trial/billing is inactive. No Railway-specific change was required for this stage.

## 17. Remaining Risks

- Business Free uses the existing `corporate_executive` renderer as the assignable primary key because `minimal_business` is not currently accepted by the backend catalog. This is acceptable for Stage 9.11C because backend changes are out of scope, but a future backend catalog alignment stage should decide whether `minimal_business` should become assignable.
- Free group thumbnails are neutral catalog assets only. They do not redesign the public templates.

## 18. Go / No-Go Decision

Go for product owner review.

Stage 9.11C is complete from the local implementation and validation perspective. Wait for approval before starting production relaunch, Railway deployment, payment, subscription, marketplace, hosting renewal, entitlement enforcement, luxury work, backend refactor, database migration, or public template redesign.

