# PHASE 9D REPORT - Upload System Hardening

## Status

Stage 4 is complete.

The platform now has a hardened backend upload system for tenant assets.

## Implemented Upload Endpoints

Authenticated tenant users can upload assets through:

```text
POST /api/v1/uploads/logo
POST /api/v1/uploads/hero
POST /api/v1/uploads/menu
POST /api/v1/uploads/gallery
```

The request must be `multipart/form-data` with the file field named:

```text
file
```

Uploaded files are publicly readable through generated URLs:

```text
GET /api/v1/uploads/:tenantId/:assetType/:fileName
```

## Security Controls

Implemented controls:

- Authentication required for uploads.
- Tenant context required for uploads.
- RBAC limited to `TENANT_ADMIN` and `EDITOR`.
- Tenant-scoped storage paths.
- Randomized server-side file names.
- No user-controlled path writes.
- Path traversal validation for public reads.
- MIME allowlist:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- Magic-byte validation to reject spoofed MIME types.
- Extension-to-MIME consistency checks.
- Per-asset size limits:
  - Logo: 1 MB
  - Hero: 5 MB
  - Menu image: 4 MB
  - Gallery image: 4 MB
- Malware scanning hook:
  - Disabled by default locally.
  - Enabled by default in `.env.production`.
  - Includes an internal signature hook for the EICAR test signature.
- Uploaded asset cache headers:
  - `public, max-age=31536000, immutable`

## Storage Strategy

Uploads are stored in a local Docker volume:

```text
uploads_data:/app/uploads
```

Docker binds storage to the backend container only. Files are served by backend read endpoints rather than exposing a raw host directory.

Runtime storage health now checks local storage readiness:

```text
GET /health/storage
```

Expected local result:

```json
{
  "status": "ok",
  "checks": {
    "driver": "local",
    "path": "/app/uploads"
  }
}
```

## Environment Variables

Added:

```text
STORAGE_DRIVER=local
UPLOAD_STORAGE_PATH=/app/uploads
UPLOAD_PUBLIC_BASE_URL=
MALWARE_SCAN_ENABLED=false
```

Production default:

```text
MALWARE_SCAN_ENABLED=true
```

## Runtime Validation

Validated locally:

- Backend build: PASS
- Backend tests: PASS
- Frontend build: PASS
- Docker Compose config: PASS
- Backend container: UP
- Storage health: PASS
- Authenticated logo upload: PASS
- Public file read: PASS
- Spoofed PNG upload rejection: PASS

Successful upload response shape:

```json
{
  "tenantId": "tenant-id",
  "assetType": "logo",
  "originalName": "logo.png",
  "fileName": "generated-name.png",
  "mimeType": "image/png",
  "size": 10,
  "url": "/api/v1/uploads/tenant-id/logo/generated-name.png",
  "scan": {
    "status": "skipped",
    "provider": "disabled"
  }
}
```

## Remaining Risks

- Uploaded URLs are not yet automatically attached to website theme/menu/gallery records. The upload endpoint returns safe URLs that existing asset fields can use.
- Local Docker volume storage is acceptable for MVP and single-VPS deployment, but object storage should replace it before multi-node horizontal scaling.
- Malware scanning is a hook plus internal signature scanner. A production antivirus or object-storage scanning provider should be added before high-volume public uploads.

## Verdict

Phase 9D is complete and ready for approval.

STOP. Wait for approval before Stage 5 - Smoke Testing.
