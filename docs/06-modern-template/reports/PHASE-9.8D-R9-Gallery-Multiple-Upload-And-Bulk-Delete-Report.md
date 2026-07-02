# PHASE 9.8D-R9 - Gallery Multiple Upload and Bulk Delete Report

Date: 2026-07-02

## 1. Executive Summary

Stage 9.8D-R9 improves Gallery management UX with multiple file picker upload, multiple drag-and-drop upload, per-file validation/status, safe single delete, and selected bulk delete. The implementation keeps the existing backend upload pipeline and gallery delete endpoint.

Status: GO for approval.

## 2. Scope

Implemented:

- Gallery multiple image selection.
- Gallery multiple drag-and-drop upload.
- Per-file frontend validation and status.
- Single gallery image delete confirmation.
- Bulk select and delete selected gallery images.
- Strict frontend image type guard shared with existing image upload component.

Unchanged:

- Backend upload endpoint.
- Prisma schema and database migrations.
- Supabase/local storage adapters.
- Sharp/WebP processing pipeline.
- Menu image upload logic.
- Hero/logo upload behavior except shared validation guard.
- Template rendering/layout.
- Payment, marketplace, hosting, subscription, or entitlement logic.

## 3. Current Gallery UX Problem

Before R9:

- Gallery upload accepted only one image at a time.
- Delete was available only per image.
- Gallery management was inefficient for naturally multi-image content.
- Frontend file validation checked MIME type and file size but did not also check extension and image signature.

## 4. Multiple Upload Implementation

Implementation uses the safer MVP option:

- Frontend loops through selected files.
- Each valid file uploads through the existing `/uploads/gallery` endpoint.
- Each uploaded URL is appended through the existing `/websites/:id/gallery` endpoint.
- One invalid file does not block valid files in the same batch.

Limits:

- Max 10 files per batch.
- Max 4MB per image.
- Max 20 gallery images per website in the frontend guard.

## 5. Allowed Image Format Policy

Allowed:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

Allowed MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`

Rejected:

- HEIC
- HEIF
- GIF
- SVG
- BMP
- TIFF
- AVIF
- PDF

User-facing rejection copy:

`Only JPG, PNG, or WEBP images are supported.`

## 6. Upload Validation

Added shared frontend validator:

`frontend/src/features/uploads/imageValidation.ts`

Validation checks:

- File extension.
- MIME type.
- Extension and MIME match.
- Max file size.
- Image signature bytes for JPEG, PNG, and WEBP where possible.

Backend validation remains the final authority and still validates buffer content before Sharp processing.

## 7. Single Delete Behavior

Single delete flow:

- User clicks Delete on a gallery card.
- Confirmation: `Hapus gambar galeri ini?`
- Existing delete endpoint archives the gallery record.
- Existing backend cleanup attempts storage variant deletion.
- UI refreshes through the returned website payload.

## 8. Bulk Delete Behavior

Bulk delete flow:

- User clicks `Select images`.
- User selects one or more gallery cards.
- `Delete selected` appears only when at least one card is selected.
- Confirmation: `Hapus gambar yang dipilih?`
- Each selected gallery record is deleted through the existing safe single delete endpoint.
- Selection mode is cleared after completion.

Rules preserved:

- Website is not deleted.
- Menu items are not deleted.
- Tenant/business records are not deleted.
- Only selected gallery images are removed.

## 9. Supabase Storage Cleanup

No storage adapter change was required.

Existing backend gallery deletion already calls:

`uploads.deleteTenantAssetByUrl(tenantId, gallery.imageUrl, 'gallery')`

That cleanup attempts known variants:

- `thumb.webp`
- `medium.webp`
- `large.webp`
- `original.jpg`
- `original.png`
- `original.webp`

## 10. Legacy Local Upload Handling

Existing backend delete behavior remains:

- Legacy local missing files do not block gallery database cleanup.
- Gallery record archive is prioritized so public sites stop rendering deleted images.
- Storage cleanup failure should not keep deleted gallery references visible.

## 11. Public Rendering Validation

Restaurant Premium public gallery remains unchanged and continues to render active gallery records. Evidence was captured after upload and delete flow against a local Docker tenant using the real dashboard and public site.

Public rendering expectations:

- Deleted gallery records disappear from public data.
- Gallery placeholder remains available if gallery becomes empty.
- No template redesign was introduced.

## 12. Files Modified

- `frontend/src/components/ui/ImageUpload.tsx`
- `frontend/src/features/uploads/imageValidation.ts`
- `frontend/src/features/uploads/__tests__/imageValidation.test.ts`
- `frontend/src/features/uploads/__tests__/galleryManagementSource.test.ts`
- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`
- `docs/01-architecture/ASSET_STORAGE_ARCHITECTURE.md`

## 13. Testing Results

Passed:

- `npm --prefix frontend run test -- imageValidation.test.ts galleryManagementSource.test.ts`
  - 7 tests passed
- `npm --prefix frontend run lint`
  - Passed
- `npm --prefix frontend run test`
  - 63 tests passed
- `npm --prefix frontend run build`
  - Passed
  - Vite reported only the existing large chunk warning
- Prisma validation with project Prisma version and local dummy env:
  - Passed
- `docker compose up -d --build`
  - Passed
- `Invoke-WebRequest http://127.0.0.1/health/ready`
  - HTTP 200
- `npm run smoke-test`
  - 10 tests passed

Backend tests were not run because no backend code was changed.

## 14. Evidence Locations

Evidence folder:

`docs/evidence/gallery-batch-upload-r9/`

Generated screenshots:

- `gallery-multiple-file-select.png`
- `gallery-drag-drop-multiple.png`
- `gallery-upload-progress.png`
- `gallery-upload-partial-failure.png`
- `gallery-single-delete.png`
- `gallery-bulk-select.png`
- `gallery-bulk-delete-confirmation.png`
- `gallery-after-bulk-delete.png`
- `restaurant-premium-gallery-after-update.png`

Evidence was generated against the local Docker stack using a temporary local tenant.

## 15. Remaining Risks

- Bulk delete currently loops over the existing single delete endpoint. This is intentionally simple and safe for MVP, but a future backend batch endpoint could reduce request count.
- Frontend max gallery count is an MVP guard. A future plan-based media quota should be handled server-side when subscriptions are approved.
- HEIC/AVIF conversion remains out of scope.

## 16. Go / No-Go Decision

Decision: GO.

Reason:

- Gallery supports multiple file picker upload and multiple drag-and-drop upload.
- Per-file validation/status is visible.
- Unsupported formats are rejected without blocking valid files.
- Single delete and selected bulk delete work through existing safe delete behavior.
- Public Restaurant Premium gallery still renders active gallery records.
- Existing upload processing/storage pipeline remains intact.
- Tests, local Docker build, health check, and smoke tests passed.
