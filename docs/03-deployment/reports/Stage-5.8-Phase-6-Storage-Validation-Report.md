# STORAGE VALIDATION REPORT

## Status

PASS - storage validation and abstraction hardening are complete for Phase 6.

This phase refactors storage behind a backend adapter boundary and validates that logo, hero, and gallery upload flows can continue without frontend changes.

## Storage Architecture

Current public upload API remains unchanged:

```text
POST /api/v1/uploads/logo
POST /api/v1/uploads/hero
POST /api/v1/uploads/gallery
GET  /api/v1/uploads/:tenantId/:assetType/:fileName
```

Frontend remains unchanged:

- `ImageUpload` uploads files to backend.
- Frontend receives an asset URL.
- Frontend attaches returned URL to website/theme/gallery records.
- No Supabase SDK.
- No MinIO SDK.
- No provider-specific storage code in frontend.

Backend storage boundary added:

```text
UploadsController
  -> UploadsService
    -> UploadStorageService
      -> UploadStorageAdapter
        -> LocalUploadStorageAdapter
```

New backend files:

- `backend/src/modules/uploads/storage/upload-storage-adapter.ts`
- `backend/src/modules/uploads/storage/upload-storage.service.ts`
- `backend/src/modules/uploads/storage/local-upload-storage.adapter.ts`

Current adapter:

- `LocalUploadStorageAdapter`

Future adapters:

- `SupabaseUploadStorageAdapter`
- `S3CompatibleUploadStorageAdapter` for MinIO

## Upload Validation

Validation remains in `UploadsService` before storage adapter write:

- Asset type validation:
  - `logo`
  - `hero`
  - `menu`
  - `gallery`
- MIME type validation:
  - JPG
  - PNG
  - WEBP
- File extension validation.
- Magic-byte content validation.
- File size policy:
  - Logo: 1 MB
  - Hero: 5 MB
  - Menu: 4 MB
  - Gallery: 4 MB
- Malware scanning hook remains in place.
- Tenant-scoped object path is preserved.

Storage adapter is responsible for:

- Physical write/read.
- Public URL construction.
- Storage health check.

This split keeps security validation provider-independent.

## Health Check Integration

Storage health now uses the storage adapter boundary when `STORAGE_DRIVER` is configured.

Health behavior:

- `STORAGE_DRIVER=none` returns `not_configured`.
- `STORAGE_DRIVER=local` checks local upload path read/write access through `LocalUploadStorageAdapter`.
- Unsupported drivers return storage health `error` until their adapter is implemented.

Endpoints affected:

```text
GET /health
GET /health/storage
```

Readiness remains database-focused:

```text
GET /health/ready
```

Reason:

- Database readiness is required to accept traffic.
- Storage errors are surfaced as health degradation without blocking every backend startup during provider configuration phases.

## Supabase Storage To MinIO Migration Strategy

Target requirement:

Future migration from Supabase Storage to MinIO must require no frontend rewrite.

Required adapter model:

```text
STORAGE_DRIVER=local
STORAGE_DRIVER=supabase
STORAGE_DRIVER=s3
```

Recommended env vars for Supabase adapter:

```text
STORAGE_DRIVER=supabase
SUPABASE_STORAGE_URL=<storage endpoint>
SUPABASE_STORAGE_BUCKET=<bucket>
SUPABASE_STORAGE_SERVICE_KEY=<server-side only secret>
UPLOAD_PUBLIC_BASE_URL=<public asset base URL if needed>
```

Recommended env vars for MinIO adapter:

```text
STORAGE_DRIVER=s3
S3_ENDPOINT=https://<minio-domain>
S3_REGION=us-east-1
S3_BUCKET=<bucket>
S3_ACCESS_KEY_ID=<key>
S3_SECRET_ACCESS_KEY=<secret>
S3_FORCE_PATH_STYLE=true
UPLOAD_PUBLIC_BASE_URL=<cdn or backend asset base URL>
```

Migration flow:

1. Keep frontend upload endpoints unchanged.
2. Add Supabase adapter behind `UploadStorageAdapter`.
3. Store object using tenant-scoped keys.
4. Validate pilot uploads.
5. For future VPS migration, copy bucket objects from Supabase Storage to MinIO.
6. Change backend env:

```text
STORAGE_DRIVER=s3
S3_ENDPOINT=...
S3_BUCKET=...
UPLOAD_PUBLIC_BASE_URL=...
```

7. Restart backend.
8. Validate existing asset URLs and new uploads.

Expected frontend change:

None.

Expected database redesign:

None.

Expected backend application rewrite:

None after Supabase/S3 adapters are implemented.

## Object Key Strategy

Current local path shape:

```text
<tenantId>/<asset-directory>/<fileName>
```

Examples:

```text
tenant-1/logos/1710000000000-uuid.png
tenant-1/heroes/1710000000000-uuid.webp
tenant-1/galleries/1710000000000-uuid.jpg
```

Recommended provider object key:

```text
<tenantId>/<asset-directory>/<fileName>
```

This preserves tenant isolation and allows provider migration by copying object keys directly.

## Vendor Lock-In Review

PASS.

Storage remains vendor agnostic:

- Frontend does not use provider SDK.
- Backend upload endpoint remains stable.
- Upload validation is provider-independent.
- Storage adapter interface separates business logic from storage provider.
- Local Docker Compose remains valid.
- Supabase Storage and MinIO can be introduced as adapter implementations.

Forbidden patterns avoided:

- No Supabase Auth.
- No Supabase Realtime.
- No Supabase Edge Functions.
- No Railway proprietary storage.
- No provider SDK in frontend.
- No provider-specific storage call in website/theme/gallery business logic.

## Implementation Completed

Added:

- `UploadStorageAdapter` interface.
- `UploadStorageService` driver resolver.
- `LocalUploadStorageAdapter`.

Changed:

- `UploadsService` now delegates physical storage to adapter.
- `HealthService` now checks storage through adapter.
- `UploadsModule` now exports `UploadStorageService`.
- Upload unit tests now instantiate storage adapter.
- Health unit tests cover adapter-based storage health.

Not implemented in this phase:

- Live Supabase Storage adapter.
- Live MinIO/S3 adapter.
- Object migration job.
- Public CDN integration.

Reason:

Phase 6 validates and hardens the storage architecture. Live provider adapter implementation should occur only when Supabase Storage credentials/bucket strategy are available and approved.

## Validation

Commands passed:

```bash
npm run build
```

from:

```text
backend
```

```bash
npm test -- --runInBand
```

from:

```text
backend
```

Test result:

- 5 test suites passed.
- 17 tests passed.

Docker/runtime validation passed:

```bash
docker compose config
docker compose up -d --build
curl http://localhost/health
curl http://localhost/health/storage
curl http://localhost/health/ready
npm run smoke-test
```

Runtime result:

- Backend container running.
- Frontend container running.
- Nginx container running.
- PostgreSQL container healthy.
- `/health` reports database `ok`, storage `ok`, cache `not_configured`.
- `/health/storage` reports local adapter `ok`.
- Smoke test passed in Chromium.

## Phase 6 Verdict

PASS.

Storage is now abstracted at the backend boundary and ready for future Supabase Storage and MinIO adapters without frontend rewrite.

Proceed to Phase 7 - Pilot Go Live after approval.

STOP.
