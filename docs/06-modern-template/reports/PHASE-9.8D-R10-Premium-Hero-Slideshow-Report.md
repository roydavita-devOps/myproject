# PHASE 9.8D-R10 - Premium Hero Slideshow Report

Date: 2026-07-02

## 1. Executive Summary

Stage 9.8D-R10 adds a lightweight image-only Premium Hero Slideshow for `restaurant_premium`.

Restaurant Premium now supports:

- Static image mode through existing `Theme.heroImageUrl`.
- Rotating images mode using 2-5 uploaded hero images.
- Smooth 5-second crossfade with 1100ms transition.
- Reduced-motion fallback to a static first image.
- Image-safe overlays preserved for headline, CTA, and hero card readability.

No video upload, video processing, ffmpeg, subscription, billing, marketplace, entitlement, or new template work was introduced.

## 2. Scope

Included:

- Additive nullable `Theme.heroMedia` JSON persistence.
- Dashboard Hero Display controls for Restaurant Premium only.
- Multiple hero image upload for slideshow.
- Individual slideshow image removal.
- Restaurant Premium public slideshow rendering.
- Reduced-motion fallback.
- Storage cleanup for removed owned hero slideshow URLs.
- Tests, Docker rebuild, smoke validation, and screenshot evidence.

Excluded:

- Video hero.
- Advanced media library.
- Reorder/crop/editor tools.
- Cafe Premium redesign.
- Classic template changes.
- Payment, subscription, marketplace, entitlement, and hosting renewal.

## 3. Hero Media Data Audit

Current hero image storage before R10:

- Static hero URL: `Theme.heroImageUrl`.
- Upload asset type: `hero`.
- Backend upload response: primary `url` plus `thumbnailUrl`, `mediumUrl`, `largeUrl`.
- Public renderer: `RestaurantPremiumTemplate` reads `website.theme?.heroImageUrl`.
- Dashboard editor: `WebsiteEditorPage` uses `ImageUpload assetType="hero"`.

There was no existing safe JSON field dedicated to multiple hero images.

## 4. Persistence Decision

Implemented additive nullable field:

```text
Theme.heroMedia Json? @map("hero_media")
```

Stored shape:

```json
{
  "heroMediaType": "slideshow",
  "heroImages": [
    {
      "url": ".../large.webp",
      "thumbnailUrl": ".../thumb.webp",
      "mediumUrl": ".../medium.webp",
      "largeUrl": ".../large.webp",
      "alt": "Restaurant hero image"
    }
  ]
}
```

Backward compatibility:

- `Theme.heroImageUrl` remains unchanged.
- Static hero continues to work for all existing tenants.
- Slideshow renders only when mode is `slideshow` and at least two valid images exist.
- Invalid or incomplete slideshow data falls back to static hero.

## 5. Dashboard UI Changes

Restaurant Premium website editor now includes:

- `Hero Display`
- `Static image`
- `Rotating images`
- `Save hero display`
- `Choose hero images`
- Thumbnail previews for slideshow images.
- Individual `Remove` button per slideshow image.

The control is shown only for websites resolved as `restaurant_premium`.

## 6. Upload Validation

R10 reuses the existing upload policy:

- Allowed: JPG, JPEG, PNG, WEBP.
- Rejected: HEIC, HEIF, GIF, SVG, BMP, TIFF, AVIF, PDF.
- Max size: 4MB per slideshow image.
- Max images: 5.
- Minimum active slideshow images: 2.

Frontend validation uses extension, MIME, size, and signature checks. Backend upload validation and Sharp processing remain the final authority.

## 7. Restaurant Premium Slideshow Rendering

Rendering behavior:

```text
If heroMediaType = slideshow and 2+ valid images:
  render crossfade slideshow
Else:
  render static hero image
```

Timing:

- Interval: 5000ms.
- Transition: 1100ms opacity crossfade.
- No carousel arrows or heavy dependency.
- Existing premium hero overlay and scrim remain in place.

## 8. Accessibility / Reduced Motion

Reduced motion is respected through:

```text
window.matchMedia('(prefers-reduced-motion: reduce)')
```

When reduced motion is enabled:

- No autoplay interval runs.
- First slideshow image is rendered statically.
- CSS transition and Ken Burns animation are disabled through the existing reduced-motion media rule.

## 9. Performance Notes

- Uses the existing optimized WebP `largeUrl`/primary hero URL.
- Later slideshow images are `loading="lazy"`.
- No new carousel or animation dependency added.
- Existing Sharp WebP variants and storage adapter remain unchanged.

## 10. Delete / Remove Behavior

Removing a slideshow image:

1. Removes the image from `Theme.heroMedia.heroImages`.
2. Persists the updated JSON.
3. Backend compares previous and next hero media URLs.
4. Removed owned `hero` URLs are passed to existing upload cleanup.
5. Static `Theme.heroImageUrl` is protected from accidental deletion if referenced.

Legacy/missing local files are tolerated through the existing delete cleanup behavior.

## 11. Fallback Behavior

Fallback order:

1. Valid slideshow images when mode is `slideshow` and 2+ images exist.
2. Existing static `Theme.heroImageUrl`.
3. Restaurant Premium placeholder Unsplash image.
4. Dark premium surface/overlay.

No broken image icons were observed in local evidence.

## 12. Files Modified

Backend:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260702090000_add_theme_hero_media/migration.sql`
- `backend/src/modules/websites/dto/update-theme-assets.dto.ts`
- `backend/src/modules/websites/websites.service.ts`
- `backend/src/modules/websites/websites.service.spec.ts`

Frontend:

- `frontend/src/types/api.ts`
- `frontend/src/features/uploads/heroMedia.ts`
- `frontend/src/features/uploads/__tests__/heroMedia.test.ts`
- `frontend/src/features/uploads/__tests__/heroSlideshowSource.test.ts`
- `frontend/src/features/websites/websites.api.ts`
- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/styles.css`

Docs and evidence:

- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/01-architecture/ASSET_STORAGE_ARCHITECTURE.md`
- `scripts/generate-premium-hero-slideshow-r10-evidence.mjs`
- `docs/evidence/premium-hero-slideshow-r10/`

## 13. Testing Results

Passed:

- `npm --prefix frontend run test` - 9 files, 70 tests.
- `npm --prefix frontend run lint`.
- `npm --prefix frontend run build`.
- `npm --prefix backend run test` - 10 suites, 52 tests.
- `npm --prefix backend run build`.
- `npm exec prisma validate` from `backend`.
- `docker compose up -d --build`.
- `Invoke-WebRequest http://127.0.0.1/health/ready` - HTTP 200.
- `npm run smoke-test` - 10 Playwright smoke tests passed.
- `node scripts/generate-premium-hero-slideshow-r10-evidence.mjs`.

Notes:

- Frontend build keeps the existing Vite chunk-size warning. This is not introduced by R10 and does not fail build.
- Backend unit tests emit expected warning logs for storage cleanup/email failure scenarios covered by tests; all test suites passed.

## 14. Evidence Locations

Evidence folder:

```text
docs/evidence/premium-hero-slideshow-r10/
```

Screenshots:

- `hero-display-settings-static.png`
- `hero-display-settings-slideshow.png`
- `hero-slideshow-thumbnails.png`
- `restaurant-premium-hero-slideshow-desktop.png`
- `restaurant-premium-hero-slideshow-mobile.png`
- `restaurant-premium-hero-static-fallback.png`
- `restaurant-premium-hero-reduced-motion-fallback.png`
- `hero-slideshow-delete-image.png`
- `visual-validation-results.json`

Evidence generation used the local Docker stack with a temporary local Restaurant Premium tenant and real API/upload flows.

## 15. Remaining Risks

- Hero image reorder is not implemented.
- Mobile devices still load multiple optimized hero images when slideshow is enabled, though images use processed WebP large variants and lazy loading after the first image.
- Production rollout requires Railway migration deployment and Supabase Storage env configuration to already be correct.
- Existing Vite bundle size warning remains a future optimization item.

## 16. Go / No-Go Decision

Go.

Stage 9.8D-R10 is implemented, locally validated, evidence-backed, and ready for product approval.
