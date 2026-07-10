# PHASE 9.11A - Template Catalog Simplification And Free/Premium Focus Report

Date: 2026-07-10

Status: Implemented and locally validated.

## 1. Executive Summary

Stage 9.11A simplifies the template selection experience from a crowded multi-section catalog into:

- one primary recommended template on the main page: Restaurant Premium,
- a `View More Templates` modal for the rest of the catalog,
- only two user-facing tiers: Free and Premium.

No payment, subscription, marketplace, entitlement, backend, Prisma, database, or public template redesign work was introduced.

## 2. Scope

Implemented:

- Main template page now shows a current selected template summary.
- Main template page now shows only Restaurant Premium as the primary recommended template.
- `View More Templates` opens a modal.
- Modal contains Free Templates and Premium Templates sections.
- Cafe Premium remains Premium, approved, selectable, and previewable from the modal.
- Free templates remain selectable and previewable from the modal.
- Luxury and planned/unfinished templates are hidden from the user-facing catalog.
- Existing preview route, template change confirmation, assign-template API usage, public renderer, and publish readiness panel remain compatible.

Out of scope:

- Payment.
- Checkout.
- Subscription.
- Billing.
- Entitlement enforcement.
- Marketplace.
- Hosting renewal.
- Backend changes.
- Prisma migrations.
- Public template visual redesign.
- Luxury template work.

## 3. Current Catalog Audit

Current template keys:

| Template key | Status | Previous tier | Stage 9.11A user-facing tier | Visibility |
| --- | --- | --- | --- | --- |
| `restaurant_classic` | active | standard | Free | Modal |
| `restaurant_premium` | active | premium / locked | Premium | Primary |
| `restaurant_luxury` | planned | luxury | Hidden | Hidden/deferred |
| `laundry_clean` | active | standard | Free | Modal |
| `cafe_minimal` | planned | standard | Hidden | Hidden/deferred |
| `cafe_modern` | active | premium metadata, previously non-locked | Free | Modal |
| `cafe_premium` | active | premium / locked | Premium | Modal |
| `clinic_professional` | active | standard | Free | Modal |
| `corporate_executive` | active | premium metadata, previously non-locked | Free | Modal |
| `minimal_business` | active | standard | Free | Modal |

Recommendation logic previously appeared in:

- `frontend/src/features/templates/templateCatalog.ts`
- `frontend/src/features/templates/TemplateSelectionPage.tsx`

Catalog sections previously rendered as:

- Recommended for your business.
- Premium Templates.
- Classic Templates.
- All Templates.

Preview and selection flow lives in:

- `frontend/src/features/templates/TemplateSelectionPage.tsx`
- `frontend/src/features/websites/WebsitePreviewPage.tsx`
- `frontend/src/features/websites/websites.api.ts`

## 4. Free/Premium Tier Simplification

User-facing tiers now resolve through `displayTierForTemplate`:

- `catalogStatus === locked` -> Premium.
- all other active visible templates -> Free.

This intentionally hides implementation-era labels such as Classic, Modern, Luxury, Experimental, and Internal from the user-facing catalog.

## 5. Luxury Removal / Hidden Decision

Luxury is hidden/deferred, not deleted.

Rationale:

- `restaurant_luxury` exists as planned metadata.
- Removing code physically is unnecessary and riskier than hiding it.
- Direct renderer compatibility remains safe because preview resolution still ignores inactive templates.
- The user-facing catalog no longer shows Luxury.

## 6. Main Page Restaurant Premium Recommendation

The main page always shows Restaurant Premium as the single primary recommendation.

This does not change tenant choice. It only simplifies the first view.

Business type no longer changes the primary recommended card.

## 7. View More Templates Modal

The modal includes:

- Free Templates.
- Premium Templates.
- Preview buttons.
- Free/Premium badges.
- Recommended-for-business badges where applicable.
- Selected badge.
- Use Template button.
- Existing confirmation before change.

No payment or upgrade UI exists in the modal.

## 8. Cafe Premium Availability

Cafe Premium remains:

- approved,
- premium,
- selectable,
- previewable,
- public-renderable,
- Hero Display capable.

It is no longer shown as a main-page primary card, including for Cafe businesses.

## 9. Free Template Availability

Free templates remain selectable inside the modal.

Free templates do not receive premium Hero Display controls unless explicitly enabled by capability metadata.

## 10. Recommendation Behavior

Main page:

- Always Restaurant Premium.

Modal:

- Business type can show recommendation badges.
- Business type does not force selection.
- Business type does not auto-change selected template.

## 11. Selection / Preview Behavior

Validated:

- Preview opens without saving.
- Template selection still opens confirmation.
- Confirmation preserves business information, menu, gallery, and contact data.
- Selection persists through existing `assignTemplate` API.
- Public renderer uses the selected template.

## 12. Publish Readiness Compatibility

Publish readiness remains visible after template catalog changes.

Validated:

- Publish readiness panel appears in editor.
- Restaurant Premium selection still renders publicly.
- Cafe Premium selection still renders publicly.
- Premium templates are not blocked by payment.

## 13. Files Modified

- `frontend/src/features/templates/TemplateSelectionPage.tsx`
- `frontend/src/features/templates/templateCatalog.ts`
- `frontend/src/features/templates/registry/templateMetadata.ts`
- `frontend/src/features/templates/registry/templateTypes.ts`
- `frontend/src/features/templates/registry/__tests__/templateCatalogReadiness.test.ts`
- `smoke/saas.smoke.spec.ts`
- `scripts/generate-template-catalog-simplification-911a-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/README.md`

## 14. Testing Results

| Check | Result |
| --- | --- |
| `npm --prefix frontend run test` | PASS: 12 files, 92 tests |
| `npm --prefix frontend run lint` | PASS |
| `npm --prefix frontend run build` | PASS |
| `docker compose up -d --build` | PASS |
| `Invoke-WebRequest http://127.0.0.1/health/ready -UseBasicParsing` | PASS |
| `node scripts/generate-template-catalog-simplification-911a-evidence.mjs` | PASS |
| `npm run smoke-test` | PASS: 10/10 |

Build note:

- Vite still reports the existing non-blocking chunk-size warning for the main JS bundle.

## 15. Evidence Locations

Evidence folder:

- `docs/evidence/template-catalog-simplification-9.11a/`

Screenshots:

- `template-main-page-restaurant-premium-only.png`
- `template-main-page-current-selected.png`
- `template-view-more-button.png`
- `template-modal-free-section.png`
- `template-modal-premium-section.png`
- `template-modal-cafe-premium.png`
- `template-modal-free-template.png`
- `template-change-confirmation-from-modal.png`
- `template-selected-after-modal-change.png`
- `template-luxury-hidden-check.png`
- `restaurant-premium-render-after-selection.png`
- `cafe-premium-render-after-modal-selection.png`
- `publish-readiness-still-visible.png`
- `classic-free-no-premium-hero-display.png`

Result manifest:

- `docs/evidence/template-catalog-simplification-9.11a/visual-validation-results.json`

## 16. Local-Only / Railway Status

Validation is local-only.

Railway deployment remains deferred while Railway trial/billing is inactive or expired.

## 17. Remaining Risks

- Some internal metadata still uses historical tier values such as `premium` for templates that are user-facing Free. This is intentionally normalized at catalog-display level to avoid backend/schema churn.
- Future marketplace work should revisit template tier taxonomy before payment or entitlement enforcement.
- Direct preview of hidden/planned templates remains guarded by active-template checks.

## 18. Go / No-Go Decision

Go for Stage 9.11A approval from local validation.

Do not proceed to payment, subscription, marketplace, hosting renewal, entitlement enforcement, Luxury work, or new premium template redesign until separately approved.
