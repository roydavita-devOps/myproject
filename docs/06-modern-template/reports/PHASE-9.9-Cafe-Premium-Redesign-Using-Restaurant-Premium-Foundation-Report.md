# PHASE 9.9 - Cafe Premium Redesign Using Restaurant Premium Foundation Report

Date: 2026-07-07

## 1. Executive Summary

Stage 9.9 redesigns `cafe_premium` into a commercially sellable premium cafe template using the approved Restaurant Premium Foundation as the quality reference.

Restaurant Premium was not used as a hardcoded parent component. Cafe Premium now has its own cafe-specific experience, language, section rhythm, hero mood, product showcase, full menu modal labels, ambience gallery, visit/contact flow, and mobile treatment.

Railway trial is currently inactive/expired, so this stage was developed and validated locally only.

## 2. Scope

Included:

- Cafe Premium public template redesign.
- Cafe Premium hero, menu/product showcase, story, gallery, visit/contact, footer, mobile layout, and fallback handling.
- Premium Full Menu modal cafe variant polish and label separation.
- Cafe Premium color preset update.
- Smoke/source tests updated for the new Cafe Premium contract.
- Local Docker validation and screenshot evidence.

Excluded:

- Restaurant Premium redesign.
- Backend API changes.
- Prisma schema changes.
- Database migrations.
- Upload pipeline changes.
- Template registry architecture changes.
- Payment, subscription, marketplace, hosting renewal, publish gate, video hero, advanced media library, and new backend features.

## 3. Foundation Reference Used

Reference:

- `docs/06-modern-template/reports/PHASE-9.8E-Restaurant-Premium-Foundation-Lock-Report.md`

Reused principles:

- Premium semantic color tokens.
- Warm accent system.
- CTA depth treatment.
- Surface/footer depth treatment.
- Image-safe hero overlay/scrim.
- Premium hero slideshow compatibility.
- Reduced-motion fallback.
- Full Menu modal item detail pattern.
- Price/currency formatting.
- Opening hours formatted display.
- Visit/contact CTA hierarchy.
- Mobile compact hero rules.
- Safe image fallback behavior.

Not reused:

- Restaurant-specific copy.
- Reservation-first language.
- Restaurant-specific section names.
- Restaurant Premium layout as a hardcoded parent.

## 4. Current Cafe Premium Problems

Audit findings before implementation:

- Hero felt closer to a generic premium landing page than a specialty cafe experience.
- Hero CTA was WhatsApp-first and not menu-first.
- Cafe Premium section copy used generic labels such as `Brand Story`, `Signature Menu`, and `Lifestyle Gallery`.
- Cafe Premium modal used a white/slate default style while Restaurant Premium had warmer premium modal treatment.
- Cafe modal still rendered a Chat WhatsApp footer CTA, which conflicts with the approved menu browsing pattern.
- Cafe Premium did not use the existing premium hero slideshow data path.
- Gallery and fallback visuals were less intentional than the Restaurant Premium quality bar.
- Mobile hero needed a more compact and intentional premium treatment.

## 5. Cafe-Specific Experience Direction

Cafe Premium now targets:

- modern specialty cafe,
- warm neighborhood cafe,
- premium coffee shop,
- calm morning atmosphere,
- coffee, pastry, ambience, and visit-focused browsing.

Language direction:

- Signature Brews.
- Coffee & Bites.
- Fresh From the Bar.
- Morning Favorites.
- Crafted for Slow Mornings.
- Ambience & Corners.
- Visit the Cafe.
- Find Your Table.
- Today's Pour.
- Pastry Pairings.

Restaurant-only terms such as `Reserve a Table`, `Signature Dishes`, `Full Restaurant Menu`, `Restaurant Story`, `Dishes Worth the Visit`, and `Visit & Reservation` are not used in Cafe Premium.

## 6. Hero Redesign

Cafe Premium hero now includes:

- cafe-specific eyebrow: `Specialty coffee corner`,
- business name,
- cafe-focused tagline/description fallback,
- image-safe warm overlay,
- existing static hero image fallback,
- existing premium hero slideshow compatibility,
- reduced-motion fallback,
- compact mobile min-height,
- menu-first CTA hierarchy: `Explore Menu`, optional `Get Directions`.

WhatsApp is not used as the hero primary action.

## 7. Menu / Product Showcase

Cafe Premium now includes:

- `Signature Brews` / `Fresh From the Bar` feature section.
- `Coffee & Bites` / `Morning Favorites` preview section.
- category labels from existing menu categories where available.
- cafe-friendly category fallbacks such as Coffee, Non-Coffee, Pastry, Seasonal, Food, and Dessert.
- visible formatted prices.
- featured badge support.
- menu image rendering with warm premium placeholders when images are missing or broken.

IDR and USD formatting continue through the shared `formatMenuPrice` helper.

## 8. Full Menu Modal Integration

Cafe Premium uses the shared `PremiumFullMenuModal` with cafe-specific labels and premium warm treatment.

Changes:

- Cafe modal title: `Coffee & Bites`.
- Cafe modal eyebrow: `Cafe Menu`.
- Cafe modal description: `Browse coffee, bites, seasonal favorites, and featured selections.`
- Cafe modal cards use premium modal tokens instead of default white/slate styling.
- Item detail view continues to show image/placeholder, name, category, price, and description.
- Category tabs continue to work.
- No Chat WhatsApp CTA is rendered inside Cafe Premium modal.

Restaurant Premium modal copy and behavior remain restaurant-specific.

## 9. Cafe Story Section

Cafe Premium now has a `Cafe Story` section titled `Crafted for Slow Mornings`.

The section focuses on:

- coffee craft,
- pastry pairings,
- neighborhood rhythm,
- relaxed visits for meeting, work, reading, and slow conversation.

Fallback copy is customer-facing and avoids developer/internal language.

## 10. Gallery / Ambience Section

Cafe Premium gallery is now treated as `Ambience & Corners`.

Behavior:

- real gallery images render in a premium editorial grid,
- missing/broken gallery images fall back to warm premium placeholders,
- empty state shows Coffee bar, Pastry table, and Cozy corner cards,
- no broken image icons should appear,
- mobile layout remains clean.

## 11. Visit / Contact Section

Cafe Premium now uses `Visit the Cafe`.

CTA behavior:

- `Get Directions` uses map URL when available.
- `Call Cafe` uses `tel:` when phone exists.
- `Message Cafe` uses `wa.me` only when WhatsApp exists.
- unavailable CTAs are hidden.
- opening hours use formatted display through `formatOpeningHours`.
- raw structured keys such as `mode`, `openTime`, `closeTime`, and `days` are not displayed.

## 12. Color System / Typography / CTA Treatment

Cafe Premium now uses cafe-friendly premium presets:

- `roasted_cream`
- `espresso_linen`
- `matcha_cream`
- `caramel_noir`
- `terracotta_milk`

Typography and treatment:

- Cafe-specific local heading/body CSS variables.
- Warm editorial heading mood.
- Premium CTA depth with gradient, border, shadow, hover lift, and readable foregrounds.
- Premium modal surface treatment.
- Premium placeholders for missing images.
- No default blue link/button accents were introduced.

## 13. Mobile Review

Mobile validation covered:

- compact hero,
- readable headline and support copy,
- tappable CTA buttons,
- menu preview visible without excessive desktop spacing,
- gallery and visit sections responsive,
- no horizontal overflow.

Evidence:

- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-hero-mobile.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-mobile-full-page.png`

## 14. Fallback Handling

Handled missing or incomplete data:

- hero image falls back to a cafe image,
- hero slideshow falls back to static image when fewer than two valid images exist,
- menu images use premium placeholders,
- gallery images use premium placeholders on error,
- menu descriptions are optional,
- price rendering is conditional,
- CTA actions are validated before rendering,
- phone/WhatsApp CTAs are hidden when unavailable,
- opening hours fall back to `Daily, 08.00 - 22.00`.

## 15. Restaurant Premium Regression Review

Restaurant Premium was not redesigned.

Regression checks:

- Restaurant Premium public hero still renders.
- Restaurant Premium CTA copy remains `Explore Signature Dishes`.
- Restaurant Premium screenshot evidence was captured after Cafe Premium changes.
- Shared modal changes preserve restaurant-specific labels and treatment.

Evidence:

- `docs/evidence/cafe-premium-redesign-9.9/restaurant-premium-regression-check.png`

## 16. Local-Only / Railway Status

Railway trial is currently inactive/expired.

Stage 9.9 was validated locally through:

- frontend tests,
- frontend lint,
- frontend production build,
- local Docker rebuild,
- local health check,
- local screenshot evidence,
- local smoke tests.

Production redeploy should happen later after Railway billing/reactivation.

## 17. Files Modified

Frontend:

- `frontend/src/features/templates/CafePremiumTemplate.tsx`
- `frontend/src/features/templates/PremiumFullMenuModal.tsx`
- `frontend/src/features/templates/premiumTheme.ts`
- `frontend/src/features/templates/registry/__tests__/premiumTemplateSource.test.ts`
- `frontend/src/features/templates/registry/__tests__/premiumFullMenuModalSource.test.ts`
- `frontend/src/features/templates/registry/__tests__/premiumTheme.test.ts`

Smoke/evidence:

- `smoke/saas.smoke.spec.ts`
- `scripts/generate-cafe-premium-redesign-99-evidence.mjs`
- `docs/evidence/cafe-premium-redesign-9.9/`

Documentation:

- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/01-architecture/PREMIUM_THEME_TOKEN_SYSTEM.md`
- `docs/08-product/TEMPLATE_CATALOG.md`
- `docs/06-modern-template/README.md`
- `docs/06-modern-template/reports/PHASE-9.9-Cafe-Premium-Redesign-Using-Restaurant-Premium-Foundation-Report.md`

No backend, Prisma, migration, upload pipeline, payment, subscription, marketplace, hosting renewal, publish gate, video hero, advanced media library, or new backend feature file was modified.

## 18. Testing Results

Passed:

- `npm --prefix frontend run test` - 10 files, 79 tests passed.
- `npm --prefix frontend run lint` - passed.
- `npm --prefix frontend run build` - passed with existing Vite chunk-size warning.
- `docker compose up -d --build` - passed.
- `Invoke-WebRequest http://127.0.0.1/health/ready -UseBasicParsing` - 200 after nginx restart.
- `node scripts/generate-cafe-premium-redesign-99-evidence.mjs` - passed.
- `npm run smoke-test` - 10 passed.

Note:

- Nginx briefly returned `502 Bad Gateway` after backend container recreation. Restarting nginx restored health to `200`, consistent with prior local Docker behavior.
- Existing Vite chunk-size warning remains a future performance/code-splitting optimization.

## 19. Evidence Locations

Evidence folder:

- `docs/evidence/cafe-premium-redesign-9.9/`

Screenshots:

- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-hero-desktop.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-hero-mobile.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-signature-brews.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-menu-preview.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-full-menu-modal.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-menu-item-detail.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-story-section.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-gallery.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-visit-section.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-footer.png`
- `docs/evidence/cafe-premium-redesign-9.9/cafe-premium-mobile-full-page.png`
- `docs/evidence/cafe-premium-redesign-9.9/restaurant-premium-regression-check.png`

Validation JSON:

- `docs/evidence/cafe-premium-redesign-9.9/visual-validation-results.json`

## 20. Remaining Risks

- Railway is inactive/expired, so production backend redeploy is deferred until billing/reactivation.
- Existing Vite chunk-size warning remains.
- Cafe Premium validates current public template behavior only; no marketplace, subscription, or entitlement enforcement is included.
- Real tenant images may need future focal-point controls if uploaded photos have important subjects near edges.
- Heavy hero slideshow usage with many large images may require future performance optimization.

## 21. Go / No-Go Decision

Go.

Stage 9.9 is implemented and locally validated.

Hard stop remains active: do not start Payment, Subscription, Marketplace, Hosting renewal, Publish gate, Video hero, Advanced media library, Clinic Premium, Corporate Premium, Laundry Premium redesign, or new backend features without product approval.
