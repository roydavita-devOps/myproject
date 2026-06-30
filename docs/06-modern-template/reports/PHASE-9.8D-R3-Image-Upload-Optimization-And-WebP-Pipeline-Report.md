# PHASE 9.8D-R3 - Image Upload Optimization And WebP Pipeline Report

Date: 2026-06-30

Status: Implemented and locally validated. Awaiting product approval.

## Objective

Stabilize owner image uploads so JPG, PNG, and WEBP files are validated, optimized, converted to WebP, and rendered safely across dashboard previews and public premium templates.

This stage keeps the current application contract:

- `logoUrl`
- `heroImageUrl`
- `gallery.imageUrl`
- `menu.imageUrl`

No Prisma schema migration was introduced.

## Architecture Changes

Backend upload processing now uses `sharp`.

Pipeline:

1. Validate asset type and size policy.
2. Validate MIME type and image signature.
3. Reject unsupported formats such as GIF, SVG, TIFF, HEIC, BMP, ICO, PDF, empty files, oversized files, and corrupted images.
4. Auto-rotate input image.
5. Re-encode to WebP, which strips source metadata.
6. Resize without upscale.
7. Generate variants:
   - Thumbnail: 320px
   - Medium: 800px
   - Large: 1400px
   - Quality: 82
8. Store original plus generated variants.
9. Return the processed WebP URL as the primary `url`.

Primary URL behavior:

| Asset Type | Primary URL |
| --- | --- |
| logo | medium WebP |
| menu | medium WebP |
| hero | large WebP |
| gallery | large WebP |

Upload response now also exposes:

- `originalUrl`
- `thumbnailUrl`
- `mediumUrl`
- `largeUrl`
- `width`
- `height`

## Files Modified

- `backend/package.json`
- `backend/package-lock.json`
- `backend/tsconfig.json`
- `backend/src/modules/uploads/upload-policy.ts`
- `backend/src/modules/uploads/uploads.service.ts`
- `backend/src/modules/uploads/uploads.service.spec.ts`
- `frontend/src/components/ui/ImageUpload.tsx`
- `frontend/src/features/uploads/uploads.api.ts`
- `frontend/src/features/templates/RestaurantPremiumTemplate.tsx`
- `frontend/src/features/templates/PremiumFullMenuModal.tsx`
- `smoke/saas.smoke.spec.ts`
- `scripts/generate-image-processing-pipeline-evidence.mjs`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`

## UI Changes

Dashboard upload copy now tells users that JPG, PNG, and WEBP uploads are automatically optimized.

Preview behavior was hardened:

- Broken dashboard preview images show a recoverable error message.
- Restaurant Premium dish media falls back to the premium visual placeholder when image loading fails.
- Premium full menu modal media falls back when image loading fails.
- Gallery images hide broken image elements instead of showing browser broken-image chrome.

## Storage Decision

Current implementation keeps the existing local upload storage adapter.

Important production note:

Local container filesystem storage is not durable in stateless production deployment. It is acceptable for local Docker validation, but production user uploads require durable object storage, such as Supabase Storage or another object storage adapter, before user-generated uploads can be treated as production-safe.

No Supabase Storage adapter was added in this stage because no bucket, public URL policy, or environment contract is currently defined in the repository.

## Evidence

Evidence folder:

`docs/evidence/image-processing-pipeline/`

Screenshot evidence:

- `docs/evidence/image-processing-pipeline/upload-ui-copy.png`
- `docs/evidence/image-processing-pipeline/menu-image-upload-webp-result.png`
- `docs/evidence/image-processing-pipeline/gallery-image-upload-webp-result.png`
- `docs/evidence/image-processing-pipeline/dashboard-thumbnail-preview.png`
- `docs/evidence/image-processing-pipeline/restaurant-premium-public-optimized-image.png`
- `docs/evidence/image-processing-pipeline/broken-image-fallback.png`

Validation JSON:

- `docs/evidence/image-processing-pipeline/visual-validation-results.json`

Evidence script:

- `scripts/generate-image-processing-pipeline-evidence.mjs`

## Test Results

Passed:

- `npm --prefix backend run test -- uploads.service.spec.ts`
- `npm --prefix backend run test`
- `npm --prefix backend run lint`
- `npm --prefix backend run build`
- `npm --prefix frontend run lint`
- `npm --prefix frontend run test`
- `npm --prefix frontend run build`
- `npm exec prisma validate -- --schema prisma/schema.prisma`
- `docker compose up -d --build`
- `Invoke-WebRequest http://127.0.0.1/health`
- `Invoke-WebRequest http://127.0.0.1/health/ready`
- `npm run smoke-test`
- `node scripts/generate-image-processing-pipeline-evidence.mjs`

Notes:

- Vite production build still reports the existing advisory chunk-size warning. Build succeeds.
- Docker install output still reports npm audit warnings. No dependency audit remediation was performed in this stage because that may require breaking upgrades.

## Validation Summary

Confirmed:

- PNG upload is processed to WebP variants.
- JPG upload is processed to WebP variants.
- WEBP upload is re-optimized into controlled WebP variants.
- Unsupported GIF upload is rejected.
- Mismatched MIME/signature upload is rejected.
- Truncated/corrupted image upload is rejected.
- Oversized upload is rejected.
- Primary returned `url` remains compatible with existing persisted image fields.
- Delete removes known variants and original candidates.
- Public file endpoint serves generated WebP with `image/webp` content type.
- Restaurant Premium public rendering remains responsive.
- Broken image fallback evidence was captured.

## Rollback Strategy

1. Revert `sharp` dependency and `backend/tsconfig.json` interop change.
2. Revert upload service processing to single-file storage.
3. Revert upload tests and smoke test WebP expectations.
4. Revert frontend upload copy and fallback changes.
5. Keep existing database records intact because no Prisma migration was added.

## Go / No-Go Decision

Go for local approval and continued validation.

Production caveat:

No-Go for treating uploads as durable production assets until object storage is implemented and configured for the production backend.
