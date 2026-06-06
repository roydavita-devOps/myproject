# PHASE 9B REPORT - Demo Environment & Operational Baseline

## Status

Stage 2 is complete.

The project now has an idempotent demo seed workflow that can be run from the repository root:

```bash
npm run seed
```

The command creates operational demo data for the required tenants:

1. WARTEG MONCER
2. Laundry Suka Suka
3. Klinik Sehat Bersama
4. Bengkel Maju Jaya
5. Cafe Nusantara

## Demo Credentials

All demo users use the same password:

```text
Password12345
```

| Tenant | Slug | Email | Role |
| --- | --- | --- | --- |
| WARTEG MONCER | `warteg-moncer` | `admin@warteg-moncer.demo` | Tenant Admin |
| Laundry Suka Suka | `laundry-suka-suka` | `admin@laundry-suka-suka.demo` | Tenant Admin |
| Klinik Sehat Bersama | `klinik-sehat-bersama` | `admin@klinik-sehat-bersama.demo` | Tenant Admin |
| Bengkel Maju Jaya | `bengkel-maju-jaya` | `admin@bengkel-maju-jaya.demo` | Tenant Admin |
| Cafe Nusantara | `cafe-nusantara` | `admin@cafe-nusantara.demo` | Tenant Admin |

## Generated Data

The seed creates:

- Roles: Super Admin, Tenant Admin, Editor
- Tenants
- Tenant admin users
- Business subscriptions
- Verified platform subdomains
- Demo templates
- Published websites
- Themes with colors, logo URL, and hero image URL
- Menu categories
- Menu items
- Gallery entries
- Published reviews

## Database Validation

The local database was validated after running the seed repeatedly.

| Table | Demo Count |
| --- | ---: |
| tenants | 5 |
| users | 5 |
| websites | 5 |
| menus | 15 |
| galleries | 10 |
| reviews | 10 |

## Runtime Validation

The following was validated through the running API:

- Login succeeds for all 5 demo users.
- Each demo tenant has exactly 1 website.
- Each demo website is published.
- Public site lookup works by slug for all 5 tenants.
- Re-running `npm run seed` does not duplicate demo tenants, users, websites, menus, galleries, or reviews.

## Operational Notes

PostgreSQL is now exposed only on localhost for local operational commands:

```text
127.0.0.1:${POSTGRES_PORT:-15432}->5432
```

This keeps the database unavailable from public interfaces while allowing local commands such as `npm run seed` to connect to the Dockerized database.

## Remaining Risks

- Demo image URLs are external URLs and not uploaded assets. Upload hardening is intentionally deferred to Phase 9D.
- Health endpoints are still not backend-owned. This is intentionally deferred to Phase 9C.
- No smoke test automation is included yet. This is intentionally deferred to Phase 9E.

## Verdict

Phase 9B is complete and ready for approval.

STOP. Wait for approval before Stage 3 - Health Check & Environment Validation.
