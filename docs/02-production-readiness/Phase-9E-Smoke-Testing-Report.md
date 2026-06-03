# PHASE 9E REPORT - Smoke Testing

## Status

Stage 5 is complete.

The project now has a Playwright smoke test suite that validates the core SaaS journey against the Dockerized application.

## Command

Run smoke tests from the repository root:

```bash
npm run smoke-test
```

The command uses:

```text
playwright.config.ts
smoke/saas.smoke.spec.ts
```

## Coverage

The smoke test covers:

- Create tenant through registration API.
- Login through the web UI.
- Refresh token through API.
- Fetch tenant website through API.
- Publish website through API.
- Verify public website by slug.
- Upload logo through hardened upload API.
- Read uploaded logo through public asset URL.
- Logout through the web UI.

## CI/CD Integration

Added GitHub Actions workflow:

```text
.github/workflows/smoke-test.yml
```

The workflow:

- Installs root dependencies.
- Installs Playwright Chromium.
- Creates `.env` from `.env.example`.
- Starts the full Docker Compose stack.
- Waits for `/health/ready`.
- Runs `npm run smoke-test`.
- Dumps Docker logs on failure.
- Tears down the stack with `docker compose down -v`.

## Local Validation

Validated locally against the running Docker stack:

| Check | Result |
| --- | --- |
| `npm run smoke-test` | PASS |
| Backend build | PASS |
| Backend tests | PASS |
| Frontend build | PASS |
| Docker Compose config | PASS |
| Runtime containers | UP |

Playwright result:

```text
1 passed
```

## Notes

- The smoke test intentionally uses API calls for state setup and critical backend workflows, then uses the browser for user-facing login/logout. This keeps the test stable while still verifying the UI shell and authentication flow.
- Upload logo is covered through the same authenticated backend endpoint used by the product.
- Playwright local artifacts are ignored through `.gitignore`.

## Remaining Risks

- Upload logo is not yet wired into a dedicated frontend upload control. The upload endpoint is validated by smoke test, but UI upload controls should be covered when the product exposes them.
- Smoke test currently runs Chromium only. Additional browsers can be added later if cross-browser support becomes a launch requirement.

## Verdict

Phase 9E is complete and ready for approval.

STOP. Wait for approval before Stage 6 - QA Sign-Off.
