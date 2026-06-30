# Asset Storage Architecture

Date: 2026-06-30

## Purpose

User-uploaded images must be durable in production. Local filesystem storage is retained for local development and tests, but production uploads must use object storage.

## Driver Selection

Backend storage is selected with:

```text
STORAGE_DRIVER=local
STORAGE_DRIVER=supabase
```

Behavior:

| Driver | Use |
| --- | --- |
| `local` | Local Docker, local development, automated smoke tests. |
| `supabase` | Production and staging user uploads. |

If `STORAGE_DRIVER=supabase`, backend requires:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=tenant-assets
SUPABASE_STORAGE_PUBLIC_BASE_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` is backend-only. It must not be exposed to Vercel or frontend runtime variables.

## Bucket Strategy

Production bucket:

```text
tenant-assets
```

Public read:

```text
enabled
```

Write access:

```text
backend service role only
```

## Object Path Strategy

Supabase object paths use tenant, website, asset type, and generated asset id:

```text
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/original.{ext}
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/thumb.webp
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/medium.webp
tenants/{tenantId}/websites/{websiteId}/{assetType}/{assetId}/large.webp
```

If an upload request does not include `websiteId`, the adapter uses:

```text
websites/unassigned
```

The dashboard now sends `websiteId` for website assets and menu item assets where the active website is known.

## Public URL Strategy

Current website images are public assets. The adapter therefore uses public bucket URLs.

If `SUPABASE_STORAGE_PUBLIC_BASE_URL` is set, the backend builds URLs from that base. Otherwise, it uses Supabase SDK `getPublicUrl()`.

Frontend stores and renders only the URL returned by the backend. It never receives Supabase service role credentials.

## Upload Pipeline Integration

The image processing pipeline remains independent from the storage adapter:

```text
Upload
Validate
Sharp process
Generate original/thumb/medium/large
Selected storage adapter persists objects
Backend returns URL contract
Frontend persists primary processed WebP URL
```

Primary URL behavior remains:

| Asset Type | Primary URL |
| --- | --- |
| logo | medium WebP |
| menu | medium WebP |
| hero | large WebP |
| gallery | large WebP |

## Delete Behavior

Delete receives the stored image URL, parses it through storage adapters, and removes known variants:

```text
thumb.webp
medium.webp
large.webp
original.jpg
original.png
original.webp
```

For local URLs, the backend deletes files from the local upload directory.

For Supabase URLs, the backend deletes object keys from the bucket.

Database cleanup rule:

```text
Clear the database reference even if storage cleanup cannot find or remove the physical file.
```

Parent record rule:

```text
Deleting an image must not delete the parent menu item, website, tenant, or business data.
```

Current image removal behavior:

| Asset | Database behavior |
| --- | --- |
| logo | Clears `Theme.logoUrl`. |
| hero | Clears `Theme.heroImageUrl`. |
| menu image | Clears `Menu.imageUrl`; keeps the menu item active. |
| gallery image | Archives the gallery record; keeps website and other gallery data intact. |

Legacy local URLs such as `/uploads/...` are treated as removable references even when the original file no longer exists.

Supabase cleanup failures are logged as warnings and should not block the user flow when the database reference can be cleared safely.

## Backward Compatibility

Existing local URLs remain supported:

```text
/api/v1/uploads/{tenantId}/{assetType}/{fileName}
```

The backend public upload route continues to read those local files when available.

If production already contains local upload records, a backfill plan is required:

1. Export image URL records from `Theme`, `Menu`, and `Gallery`.
2. Locate local files.
3. Upload originals/variants to Supabase Storage.
4. Update stored URLs to Supabase public URLs.
5. Verify public pages before removing local files.

If no production user uploads exist yet, no backfill is required before launch.

## Production Deployment Notes

Railway backend must set:

```text
STORAGE_DRIVER=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=tenant-assets
```

Optional:

```text
SUPABASE_STORAGE_PUBLIC_BASE_URL=
```

Vercel frontend must not set `SUPABASE_SERVICE_ROLE_KEY`.

## Rollback Strategy

1. Set `STORAGE_DRIVER=local` for local-only rollback.
2. Keep Supabase URLs in database records; they remain public URLs.
3. If rolling back production from Supabase to local, first backfill Supabase objects to local storage or affected images may disappear.
4. No Prisma migration rollback is required because the stage does not change schema.
