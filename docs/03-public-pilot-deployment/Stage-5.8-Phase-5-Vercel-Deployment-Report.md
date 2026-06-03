# VERCEL DEPLOYMENT REPORT

## Status

PASS - Vercel frontend deployment preparation is complete.

This phase prepares frontend deployment configuration and checklist only. No live Vercel project was created or deployed from this workspace.

## Sources Verified

Vercel official documentation verified on 2026-06-03:

- Vite SPA deep links require a `vercel.json` rewrite to `index.html`.
- `vercel.json` rewrites are valid project configuration.
- Monorepo projects can define Vercel configuration at the root of the app being deployed.

## Build Configuration

Frontend stack:

- React
- Vite
- TypeScript
- Static SPA output

Vercel project configuration:

```text
Framework Preset: Vite
Root Directory: frontend
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

Added:

```text
frontend/vercel.json
```

Content:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Purpose:

- Enables deep linking for routes such as:
  - `/auth/login`
  - `/app/dashboard`
  - `/app/websites/:id`
  - `/site/:slug`
- Keeps frontend as a standard static SPA.
- Does not add Vercel Functions.
- Does not proxy backend traffic through Vercel.

## Environment Variables

Required Vercel frontend variable:

```text
VITE_API_URL=https://<railway-backend-domain>/api/v1
```

Example pilot value:

```text
VITE_API_URL=https://umkm-builder-pilot-backend.up.railway.app/api/v1
```

Environment mapping:

### Preview / Staging

```text
VITE_API_URL=https://<staging-railway-backend>/api/v1
```

### Pilot

```text
VITE_API_URL=https://<pilot-railway-backend>/api/v1
```

### Local Development

Local remains unchanged:

```text
VITE_API_URL=http://localhost:4000/api/v1
```

or through Docker/Nginx:

```text
VITE_API_URL=/api/v1
```

## Backend CORS Requirements

Railway backend must include the Vercel frontend origins in `CORS_ORIGINS`.

Required backend value:

```text
CORS_ORIGINS=https://<vercel-pilot-domain>,https://<vercel-preview-domain-if-needed>
```

If local validation is needed:

```text
CORS_ORIGINS=https://<vercel-pilot-domain>,http://localhost,http://localhost:5173
```

Rules:

- Do not use wildcard CORS for pilot.
- Do not route API calls through Vercel Functions.
- Do not add Vercel Edge Functions.
- Frontend calls the Railway backend directly via `VITE_API_URL`.

## API Connectivity Validation

Pre-deploy backend validation:

```text
GET https://<railway-backend-domain>/health
GET https://<railway-backend-domain>/health/live
GET https://<railway-backend-domain>/health/ready
GET https://<railway-backend-domain>/health/database
```

Expected:

- `health/live`: HTTP 200.
- `health/ready`: HTTP 200 when database is reachable.
- `health/database`: database status `ok`.

Post-deploy frontend validation:

1. Open Vercel frontend.
2. Register pilot tenant.
3. Login.
4. Open dashboard.
5. Upload logo.
6. Add menu/service.
7. Publish website.
8. Open `/site/:slug`.
9. Copy/share public link.
10. Refresh page on deep links:
    - `/auth/login`
    - `/app/dashboard`
    - `/site/:slug`

Expected:

- Deep links render the SPA instead of 404.
- Auth API calls reach Railway backend.
- Published public site routes render through frontend SPA and fetch backend public site data.

## Vendor Lock-In Review

PASS.

The implementation remains vendor agnostic:

- Vercel hosts static frontend only.
- No Vercel Functions were added.
- No Vercel Edge Functions were added.
- No Vercel Server Actions were added.
- No provider-specific SDK was added.
- Backend URL remains environment-driven through `VITE_API_URL`.
- Local Docker Compose remains unchanged.

Future VPS replacement:

- Build frontend with `npm run build`.
- Serve `frontend/dist` from Nginx or frontend container.
- Keep SPA fallback equivalent to `try_files $uri $uri/ /index.html`.
- Point `VITE_API_URL` to VPS/Nginx `/api/v1`.

## Deployment Checklist

### Vercel Project Setup

1. Create Vercel project from GitHub repository.
2. Select project root:

```text
frontend
```

3. Select framework preset:

```text
Vite
```

4. Confirm build settings:

```text
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
```

5. Add environment variable:

```text
VITE_API_URL=https://<railway-backend-domain>/api/v1
```

6. Deploy from branch:

```text
pilot
```

### Railway Backend Cross-Check

1. Add Vercel frontend URL to `CORS_ORIGINS`.
2. Redeploy Railway backend if CORS changed.
3. Validate `/health/ready`.
4. Validate browser login from Vercel frontend.

### DNS / Public URL

For pilot:

- Vercel generated domain is acceptable.
- Custom domain is optional.
- Domain automation remains forbidden for this phase.

## Rollback Plan

Vercel rollback options:

1. Redeploy previous successful Vercel deployment.
2. Revert frontend config commit and redeploy.
3. Reset `VITE_API_URL` to previous backend URL.
4. If Railway backend is failing, rollback Railway backend first.

Rollback triggers:

- SPA deep links return 404.
- Login/register fails due to API connectivity.
- CORS blocks frontend requests.
- Public site route cannot load.
- Pilot owner cannot complete publish/share flow.

## Validation

Commands passed:

```bash
npm run build
```

from:

```text
frontend
```

JSON validation passed:

```powershell
Get-Content -Raw frontend/vercel.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

Result:

- Frontend TypeScript and Vite production build passed.
- `frontend/vercel.json` is valid JSON.

## Phase 5 Verdict

PASS.

Frontend is ready to be connected to Vercel as a static Vite SPA after Railway backend URL is available.

Proceed to Phase 6 - Storage Validation after approval.

STOP.
