# Stage 9.8D-R13 - Restaurant Premium Mobile Hero Compact Polish Report

Date: 2026-07-03

## 1. Executive Summary

Stage 9.8D-R13 is implemented and locally validated.

Restaurant Premium mobile hero now keeps hero image parity with desktop while using a compact mobile-only layout. Static hero, slideshow image order, and reduced-motion fallback continue to use the same hero media source. The mobile hero is now around 613px in validation evidence, within the requested compact 560-640px direction, while desktop keeps the approved `md:` layout.

No backend, database, Prisma, upload pipeline, video, media library, Full Menu modal, Gallery, Register, Business Information, payment, subscription, marketplace, hosting renewal, Template Registry, Cafe Premium, or new template work was introduced.

## 2. Scope

In scope:

- Restaurant Premium mobile hero image source parity.
- Restaurant Premium mobile hero crop/object-position.
- Restaurant Premium mobile hero spacing and min-height.
- Restaurant Premium mobile hero typography, CTA compactness, feature chip treatment, and hero card density.
- Slideshow and reduced-motion validation.
- Desktop regression screenshot.

Out of scope:

- Desktop redesign.
- Full Menu modal.
- Gallery.
- Menu Management.
- Register flow.
- Business Information.
- Backend/API changes.
- Prisma or database changes.
- Upload endpoint/media pipeline changes.
- Video hero or media library.
- Payment, subscription, marketplace, hosting renewal, Template Registry, Cafe Premium, or new templates.

## 3. Mobile Hero Issue Found

Visual review found that Restaurant Premium mobile hero felt too tall and delayed access to content. The underlying media source was already shared through `PremiumHeroMedia`, but the mobile layout inherited desktop-like vertical spacing:

- Hero min-height used `88vh`.
- Title minimum was too large for mobile.
- Supporting text and chips consumed too much vertical space.
- Hero card showed all desktop rows on mobile.

## 4. Hero Media Source Audit

Current hero media flow:

```text
Theme.heroMedia
-> normalizeHeroMedia()
-> heroMedia.heroImages
-> activeHeroImageUrl(image)
-> resolveAssetUrl()
-> PremiumHeroMedia
```

Static fallback flow:

```text
Theme.heroImageUrl
-> resolveAssetUrl()
-> PremiumHeroMedia fallbackImage
```

Audit conclusion:

- Desktop and mobile already render through the same `PremiumHeroMedia` component.
- Slideshow and static fallback use the same image list/source.
- R13 keeps that shared media resolver and adds source checks in tests/evidence.

## 5. Image Parity Fix

R13 preserves one shared hero media path for desktop and mobile:

- Static image uses the same resolved `heroImageUrl`.
- Slideshow uses the same normalized `heroImages` array and order.
- Reduced-motion uses the first slideshow image.
- Evidence script asserts desktop and mobile active hero image sources match.

## 6. Mobile Crop / Object Position Fix

Hero media images now explicitly use:

```text
object-cover object-center
```

This keeps the same visual subject/mood between desktop and mobile while allowing natural responsive crop differences.

## 7. Mobile Compact Layout Changes

Mobile-only changes:

- Hero section min-height changed to `min-h-[560px] md:min-h-[88vh]`.
- Inner hero grid changed to `min-h-[560px]` with desktop preserved at `md:min-h-[88vh]`.
- Mobile top/bottom padding reduced.
- Mobile content gaps reduced.
- Mobile feature chips hidden under `sm` to reduce non-critical vertical weight.
- Desktop feature chips remain visible.

## 8. Mobile Typography / CTA / Card Review

Mobile typography:

- Headline uses `text-[clamp(2.45rem,13vw,3.75rem)]`.
- Desktop headline still uses `md:text-[length:var(--restaurant-hero-title-size)]`.
- Supporting paragraph is line-clamped to two lines on mobile and restored on desktop.

Mobile CTA:

- Hero CTA padding is compacted on mobile with desktop padding restored via `md:`.
- Touch target remains `min-h-11`.
- CTA destinations and behavior are unchanged.

Mobile hero card:

- Card padding is reduced on mobile.
- Card title size is reduced on mobile.
- `Best for` row is hidden on mobile and remains visible on desktop.
- Opening hours and next step remain visible.

## 9. Slideshow Mobile Validation

Validated:

- Slideshow mobile uses the same first image as desktop.
- Slideshow order remains unchanged.
- Slideshow transition remains the existing lightweight 5-second crossfade.
- Reduced-motion mobile fallback uses the first slideshow image.
- No flicker or horizontal overflow was detected in automated validation.

## 10. Desktop Regression Review

Desktop remains visually valid:

- Desktop hero screenshot captured.
- Desktop keeps `md:grid-cols-[1fr_0.46fr]`.
- Desktop min-height remains `md:min-h-[88vh]`.
- Desktop hero typography still uses the original hero title token.
- Desktop feature chips and full hero card remain visible.

## 11. Files Modified

- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/uploads/__tests__/heroSlideshowSource.test.ts`
- `scripts/generate-restaurant-premium-mobile-hero-r13-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/06-modern-template/reports/PHASE-9.8D-R13-Restaurant-Premium-Mobile-Hero-Compact-Polish-Report.md`
- `docs/evidence/restaurant-premium-mobile-hero-r13/*`

## 12. Testing Results

Passed:

- `npm --prefix frontend run test`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run build`
- `docker compose up -d --build frontend nginx`
- `Invoke-WebRequest http://127.0.0.1/health/ready -UseBasicParsing`
- `node scripts/generate-restaurant-premium-mobile-hero-r13-evidence.mjs`
- `npm run smoke-test`

Notes:

- Backend was not modified.
- Production build still reports the existing Vite chunk-size warning. This is unchanged by Stage 9.8D-R13.
- Nginx was restarted once after container recreation because local nginx briefly returned `502` while the backend upstream was being recreated.

## 13. Evidence Locations

Evidence folder:

- `docs/evidence/restaurant-premium-mobile-hero-r13/`

Screenshots:

- `docs/evidence/restaurant-premium-mobile-hero-r13/mobile-hero-static-compact.png`
- `docs/evidence/restaurant-premium-mobile-hero-r13/mobile-hero-slideshow-compact.png`
- `docs/evidence/restaurant-premium-mobile-hero-r13/mobile-hero-image-parity-desktop.png`
- `docs/evidence/restaurant-premium-mobile-hero-r13/mobile-hero-image-parity-mobile.png`
- `docs/evidence/restaurant-premium-mobile-hero-r13/mobile-hero-reduced-motion-fallback.png`
- `docs/evidence/restaurant-premium-mobile-hero-r13/desktop-hero-regression-check.png`
- `docs/evidence/restaurant-premium-mobile-hero-r13/mobile-no-horizontal-overflow.png`

Validation JSON:

- `docs/evidence/restaurant-premium-mobile-hero-r13/visual-validation-results.json`

Evidence confirms:

- Desktop and mobile static hero use the same source.
- Desktop and mobile slideshow first image source match.
- Reduced-motion fallback uses first slideshow image.
- Mobile hero screenshot height is compact at 613px.
- No mobile horizontal overflow was detected.
- Desktop hero remains visually valid.

## 14. Remaining Risks

- Real tenant-uploaded photos may have different subject placement. `object-center` is the safest default, but future image focal point support could improve composition.
- Current slideshow still loads multiple processed hero images on mobile when slideshow is enabled, inherited from Stage 9.8D-R10. No performance pipeline changes were made in R13.

## 15. Go / No-Go Decision

Go.

Stage 9.8D-R13 is ready for approval.
