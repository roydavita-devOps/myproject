# PHASE 9.8D-R4 - Supabase Storage Adapter For User Uploads Report

Date: 2026-06-30

Status: Implemented and locally validated. Awaiting product approval.

## 1. Executive Summary

Stage 9.8D-R4 adds durable object storage support for user-uploaded assets by introducing a Supabase Storage adapter behind the existing backend storage abstraction.

The Stage 9.8D-R3 image pipeline remains intact:

- validation
- Sharp processing
- WebP conversion
- thumbnail, medium, large variants
- original file retention
- broken image fallback behavior

No Prisma migration was required.

## 2. Scope

Implemented:

- Supabase Storage adapter.
- Storage driver selection with `STORAGE_DRIVER=local|supabase`.
- Backend-only Supabase service role usage.
- Supabase public URL generation.
- Tenant, website, asset type, and generated asset id path isolation.
- Delete behavior for known variants.
- Local adapter compatibility.
- Frontend `websiteId` passthrough for upload path isolation.
- Architecture documentation.
- Evidence generation.

Not implemented:

- Media library.
- Image editor.
- Payment.
- Subscription.
- Marketplace.
- New templates.

## 3. Existing Local Storage Risk

Local filesystem upload storage is not production-safe because Railway/container storage can be lost during:

- redeploy
- restart
- instance replacement
- ephemeral cleanup

Local storage remains useful for local Docker and automated tests, but it is no longer considered production-safe.

## Phase A Audit - Current Upload Storage

| Audit Item | Finding |
| --- | --- |
| Local adapter implementation | `backend/src/modules/uploads/storage/local-upload-storage.adapter.ts` |
| Upload path generation | Local adapter stores files under `UPLOAD_STORAGE_PATH/{tenantId}/{directory}/{fileName}`. |
| Public URL return | Local adapter returns `/api/v1/uploads/{tenantId}/{assetType}/{fileName}` unless `UPLOAD_PUBLIC_BASE_URL` is configured. |
| Delete behavior before R4 | `UploadsService.deleteKnownVariants()` deleted original and WebP variant candidates by file name. |
| Local file serving | `UploadsController.publicFile()` serves local files through `GET /api/v1/uploads/:tenantId/:assetType/:fileName`. |
| Frontend persistence | `ImageUpload` stores the backend returned primary `url` through existing theme, gallery, and menu APIs. |
| Supported asset types | `logo`, `hero`, `menu`, `gallery`. |
| Upload response metadata | R3 already includes `originalUrl`, `thumbnailUrl`, `mediumUrl`, `largeUrl`, `width`, and `height`. |

## 4. Storage Adapter Architecture

Storage selection:

```text
UploadStorageService
├── LocalUploadStorageAdapter
└── SupabaseUploadStorageAdapter
```

Driver behavior:

| Driver | Behavior |
| --- | --- |
| `local` | Stores files under local upload directory and serves through `/api/v1/uploads/...`. |
| `supabase` | Uploads objects to Supabase Storage and returns public bucket URLs. |

## 5. Supabase Storage Configuration

Required backend environment variables:

```text
STORAGE_DRIVER=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=tenant-assets
SUPABASE_STORAGE_PUBLIC_BASE_URL=
```

`SUPABASE_STORAGE_PUBLIC_BASE_URL` is optional. If omitted, the backend uses Supabase SDK `getPublicUrl()`.

The service role key is backend-only and must not be exposed to Vercel/frontend.

## 6. Bucket and Path Strategy

Bucket:

```text
tenant-assets
```

Path format:

```text
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/original.{ext}
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/thumb.webp
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/medium.webp
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/large.webp
```

If `websiteId` is unavailable, the adapter uses:

```text
websites/unassigned
```

Dashboard website and menu upload flows now pass `websiteId`.

## 7. Public URL Strategy

Current uploaded assets are public website images, so this stage uses public bucket URLs.

Decision:

- Public bucket strategy is used.
- Signed URLs are not used for current public website assets.
- Backend uploads using service role.
- Frontend receives only final public asset URLs.

## 8. Upload Pipeline Integration

The upload pipeline remains:

```text
Upload
Validate
Sharp process
Generate WebP variants
Storage adapter stores objects
Backend returns stable URLs
Frontend persists primary URL
```

Primary URL behavior remains unchanged:

| Asset Type | Primary URL |
| --- | --- |
| logo | medium WebP |
| menu | medium WebP |
| hero | large WebP |
| gallery | large WebP |

## 9. Delete Behavior

Delete parses stored URLs and removes known variants:

- `thumb.webp`
- `medium.webp`
- `large.webp`
- `original.jpg`
- `original.png`
- `original.webp`

Local URLs are deleted from local storage.

Supabase URLs are deleted from Supabase Storage object keys.

## 10. Backward Compatibility

Existing local URLs still render through:

```text
/api/v1/uploads/{tenantId}/{assetType}/{fileName}
```

New uploads use Supabase URLs when:

```text
STORAGE_DRIVER=supabase
```

If production already has local user uploads, a backfill plan is required. If no production user uploads exist yet, no backfill is required before launch.

## 11. Environment Variables

Docker and env templates now include:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=tenant-assets
SUPABASE_STORAGE_PUBLIC_BASE_URL=
```

Production and staging env templates now use:

```text
STORAGE_DRIVER=supabase
```

## 12. Files Modified

- `backend/package.json`
- `backend/package-lock.json`
- `backend/src/config/env.validation.ts`
- `backend/src/modules/uploads/storage/upload-storage-adapter.ts`
- `backend/src/modules/uploads/storage/upload-storage.service.ts`
- `backend/src/modules/uploads/storage/local-upload-storage.adapter.ts`
- `backend/src/modules/uploads/storage/supabase-upload-storage.adapter.ts`
- `backend/src/modules/uploads/storage/supabase-upload-storage.adapter.spec.ts`
- `backend/src/modules/uploads/uploads.controller.ts`
- `backend/src/modules/uploads/uploads.module.ts`
- `backend/src/modules/uploads/uploads.service.ts`
- `backend/src/modules/uploads/uploads.service.spec.ts`
- `frontend/src/components/ui/ImageUpload.tsx`
- `frontend/src/features/uploads/uploads.api.ts`
- `frontend/src/features/websites/WebsiteEditorPage.tsx`
- `frontend/src/features/menus/MenuManagementPage.tsx`
- `docker-compose.yml`
- `.env.example`
- `.env.production`
- `.env.staging`
- `backend/.env.example`
- `scripts/generate-supabase-storage-adapter-evidence.mjs`
- `docs/01-architecture/ASSET_STORAGE_ARCHITECTURE.md`
- `docs/00-project/PROJECT_STATUS.md`
- `docs/00-project/ROADMAP.md`
- `docs/00-project/DECISIONS.md`

## 13. Testing Results

Passed:

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
- `node scripts/generate-supabase-storage-adapter-evidence.mjs`

Results:

- Backend tests: 46 passed.
- Frontend tests: 41 passed.
- Smoke tests: 10 passed.

Notes:

- Supabase adapter tests use mocked Supabase SDK and do not require real Supabase network access.
- Vite still reports the existing chunk-size advisory warning. Build succeeds.
- npm audit warnings remain unchanged in scope and were not remediated in this stage.

## 14. Evidence Locations

Evidence folder:

```text
docs/evidence/supabase-storage-adapter/
```

Evidence files:

- `local-driver-upload-result.png`
- `supabase-driver-upload-contract.png`
- `dashboard-preview-optimized-url.png`
- `restaurant-premium-public-optimized-url.png`
- `delete-variant-validation.png`
- `storage-validation-results.json`

## 15. Production Deployment Notes

Railway backend must set:

```text
STORAGE_DRIVER=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=tenant-assets
```

Supabase setup:

```text
bucket name: tenant-assets
public read: enabled
write access: backend service role only
```

Vercel frontend must not set or receive `SUPABASE_SERVICE_ROLE_KEY`.

## 16. Risks

- Supabase bucket must be created and public read must be enabled before production upload validation.
- If production has existing local upload records, those assets require backfill to Supabase.
- Public bucket URLs are appropriate for public website assets, but private media would require a signed URL design in a future stage.

## 17. Rollback Strategy

Code rollback:

1. Revert R4 commit.
2. Set `STORAGE_DRIVER=local`.
3. Local uploads continue through `/api/v1/uploads/...`.

Operational rollback:

1. Keep existing Supabase URLs in records if already used; they remain public.
2. Do not switch production back to local unless assets have been backfilled from Supabase to local storage.
3. No database migration rollback is required.

## 18. Go / No-Go Decision

Go for implementation approval.

Production deployment condition:

Go for production durable uploads only after Railway env vars are set and Supabase bucket `tenant-assets` is created with public read enabled.
