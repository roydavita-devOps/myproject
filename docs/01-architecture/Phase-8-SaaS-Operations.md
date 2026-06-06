# UMKM Website Builder SaaS - Phase 8 SaaS Operations

## 1. SaaS Monetization

The product should use simple monthly pricing that matches UMKM buying behavior: low entry price, clear upgrade triggers, and no confusing usage math for small businesses.

### Subscription Plans

| Plan | Monthly Price | Target Customer | Positioning |
| --- | ---: | --- | --- |
| Free | Rp 0 | Testing, early leads | Try the builder with platform subdomain |
| Starter | Rp 49.000 | Solo UMKM | Publish a professional site with core content |
| Business | Rp 149.000 | Growing local business | Custom domain, analytics, richer content |
| Enterprise | Custom | Franchise, clinic group, multi-branch | Dedicated onboarding and support |

### Feature Matrix

| Feature | Free | Starter | Business | Enterprise |
| --- | --- | --- | --- | --- |
| Platform subdomain | Yes | Yes | Yes | Yes |
| Custom domain | No | No | Yes | Yes |
| Published websites | 1 | 1 | 3 | Custom |
| Website templates | Basic | All standard | All standard | Custom templates |
| Menu/service items | 10 | 50 | 250 | Custom |
| Gallery images | 5 | 30 | 200 | Custom |
| Reviews | Manual only | Manual only | Manual + integration placeholder | Custom integration |
| Analytics | Basic status | Visitors + clicks | Full tenant analytics | Advanced reporting |
| Users | 1 Tenant Admin | 1 Tenant Admin + 1 Editor | 1 Tenant Admin + 5 Editors | Custom |
| Branding | Platform footer | Platform footer | Remove platform footer | White label option |
| Support | Community/email | Email | Priority email/WhatsApp | SLA support |
| Backup restore request | No | Paid add-on | 1/month | SLA-based |

### Upgrade Triggers

Upgrade prompts should appear when a tenant:

- Tries to connect a custom domain.
- Reaches menu/service item limit.
- Reaches gallery limit.
- Needs more editors.
- Needs analytics beyond basic status.
- Wants to remove platform branding.

### Upgrade Flow

```text
Tenant Admin opens Subscription page
  |
  +-- chooses plan
  |
  +-- confirms billing profile
  |
  +-- payment provider checkout
  |
  +-- webhook confirms payment
  |
  +-- subscription row updated
  |
  +-- feature limits refreshed
```

Initial implementation can use manual activation by Super Admin while payment integration is pending. The database already supports `subscriptions.plan`, `subscriptions.status`, and period fields.

### Payment Provider Recommendation

For Indonesian UMKM, prioritize payment providers that support bank transfer, QRIS, e-wallets, and cards. The implementation should isolate payment logic behind a `BillingProvider` interface so the platform can switch providers without rewriting subscription rules.

Tradeoff: manual billing is faster for MVP validation, but automated billing becomes necessary once active tenants exceed operational capacity for manual invoice handling.

---

## 2. Tenant Onboarding Flow

### Self-Service Onboarding

```text
Landing/Register
  |
  +-- business name
  +-- tenant slug
  +-- business type
  +-- admin account
  |
  +-- tenant provisioned
  +-- default template selected
  +-- default theme created
  +-- draft website created
  +-- platform subdomain created
  |
  +-- tenant dashboard
```

The current backend register flow already creates:

- Tenant
- Subscription
- Tenant Admin user
- Default theme
- Draft website
- Verified platform subdomain

### Onboarding Checklist

Tenant dashboard should guide Tenant Admin through:

1. Complete business profile.
2. Add WhatsApp and phone number.
3. Add address and Google Maps link.
4. Add menu/service items.
5. Add logo and hero image.
6. Preview website.
7. Publish website.
8. Upgrade/connect custom domain when ready.

### Super Admin Assisted Onboarding

For paid onboarding or Enterprise:

1. Super Admin creates tenant.
2. Tenant Admin receives invite.
3. Support team imports business content.
4. Support team configures custom domain.
5. Tenant reviews preview.
6. Tenant approves publish.

---

## 3. Tenant Provisioning Flow

### Provisioning Transaction

Provisioning should run as one database transaction:

```text
create tenant
create subscription
create tenant admin
create default theme
create draft website
create verified platform subdomain
issue tokens
```

If any step fails, the whole transaction must roll back to avoid partial tenants.

### Default Provisioning Rules

- Tenant status: `TRIAL`
- Subscription plan: `FREE`
- Subscription status: `TRIALING`
- Website status: `DRAFT`
- Domain type: `SUBDOMAIN`
- Domain status: `VERIFIED`

### Tenant Suspension

Suspension should:

- Set tenant status to `SUSPENDED`.
- Revoke active refresh tokens for tenant users.
- Prevent tenant admin/editor API access.
- Keep public website behavior configurable:
  - Recommended default: hide published site for unpaid/suspended tenants.
  - Alternative: keep site visible for short grace period.

### Tenant Deletion

Deletion should be soft-first:

- Set tenant status to `DELETED`.
- Set `deleted_at`.
- Revoke refresh tokens.
- Stop serving public website data.
- Keep data for retention window before hard purge.

Recommended retention:

- Free tenants: 30 days.
- Paid tenants: 90 days.
- Enterprise: contract-based.

---

## 4. Monitoring Strategy

### Minimum Production Monitoring

Monitor these signals first:

- Nginx availability: `/health`
- Backend process uptime
- PostgreSQL container health
- Disk usage
- Memory usage
- CPU usage
- Docker container restart count
- HTTP 5xx rate
- Auth failure spikes
- Database migration failures

### Application Metrics

Add structured metrics for:

- Tenant count by status.
- Active subscriptions by plan.
- Published websites count.
- Daily registrations.
- Daily logins.
- Contact submissions.
- WhatsApp clicks.
- Page views.
- Conversion events.

### Logging

Log format should become structured JSON in production:

```json
{
  "timestamp": "2026-06-03T02:00:00Z",
  "level": "info",
  "tenantId": "uuid",
  "userId": "uuid",
  "requestId": "uuid",
  "method": "POST",
  "path": "/api/v1/websites",
  "statusCode": 201,
  "durationMs": 42
}
```

Do not log:

- Passwords
- JWTs
- Refresh tokens
- Reset tokens
- Full payment payloads

### Alerting Rules

Immediate alert:

- Nginx health fails for 2 minutes.
- Backend container restarts more than 3 times in 10 minutes.
- PostgreSQL healthcheck fails.
- Disk usage above 85%.
- Database backup fails.

Business alert:

- Payment webhook failure.
- Tenant provisioning failure.
- Sudden spike in 401/403.
- Contact form spam spike.

### Tooling Recommendation

MVP VPS stack:

- Uptime Kuma for uptime checks.
- Docker logs retained with rotation.
- Cron-based backup reporting.
- Optional: Netdata for VPS resource monitoring.

Growth stage:

- Prometheus + Grafana.
- Loki or OpenSearch for logs.
- Sentry for frontend/backend errors.
- OpenTelemetry tracing for slow API debugging.

---

## 5. Backup Strategy

### Backup Scope

Backup:

- PostgreSQL database.
- `.env` production file, stored securely outside the repo.
- Nginx certificate files if not managed externally.
- Uploaded assets once upload storage is implemented.

Do not rely only on Docker named volumes as backup. Volumes are persistence, not disaster recovery.

### PostgreSQL Backup Schedule

Recommended schedule:

| Backup Type | Frequency | Retention |
| --- | --- | --- |
| Daily logical backup | Every day | 7 days |
| Weekly logical backup | Every week | 4 weeks |
| Monthly logical backup | Every month | 6 months |

Backup command:

```text
docker compose exec -T postgres pg_dump -U postgres -d umkm_builder --format=custom > backups/umkm_builder_YYYYMMDD.dump
```

Restore command:

```text
docker compose exec -T postgres pg_restore -U postgres -d umkm_builder --clean --if-exists < backups/umkm_builder_YYYYMMDD.dump
```

### Backup Storage

Store backups outside the VPS:

- S3-compatible object storage
- Backblaze B2
- Cloudflare R2
- Another secure backup server

Use encryption at rest and restrict access to owner/admin only.

### Restore Testing

Test restore monthly:

1. Create temporary database.
2. Restore latest backup.
3. Run basic queries:
   - tenant count
   - website count
   - user count
4. Start backend against restored database in staging.
5. Confirm login and website rendering.

---

## 6. Disaster Recovery Strategy

### Recovery Objectives

Recommended MVP targets:

- RPO: 24 hours
- RTO: 4 hours

Growth-stage targets:

- RPO: 1 hour
- RTO: 1 hour

Enterprise targets:

- Contract-based, usually lower RPO/RTO.

### Disaster Scenarios

| Scenario | Recovery Action |
| --- | --- |
| Backend container crash | Docker restart policy restarts service |
| Bad deployment | Roll back to previous Git tag and rebuild |
| Database migration issue | Restore backup or apply forward fix |
| VPS failure | Provision new VPS, restore repo/env/db/assets |
| Domain/DNS issue | Switch DNS or Cloudflare routing |
| Secret leak | Rotate JWT secrets and force logout |
| Data corruption | Restore latest known-good backup |

### Full VPS Recovery Runbook

1. Provision new VPS.
2. Install Docker and Docker Compose.
3. Clone repository:
   ```text
   git clone https://github.com/roydavita-devOps/myproject.git /opt/umkm-website-builder
   ```
4. Restore production `.env`.
5. Restore PostgreSQL backup.
6. Restore uploaded assets.
7. Start stack:
   ```text
   docker compose up -d
   ```
8. Verify:
   ```text
   docker compose ps
   curl http://localhost/health
   ```
9. Point DNS to new VPS IP.
10. Verify tenant website domains.

### Secret Rotation Runbook

If JWT or server secrets are compromised:

1. Generate new `JWT_ACCESS_SECRET`.
2. Generate new `JWT_REFRESH_SECRET`.
3. Update `.env`.
4. Recreate backend:
   ```text
   docker compose up -d backend
   ```
5. Revoke all refresh tokens in database.
6. Force users to login again.

---

## 7. Scaling Strategy

### Stage 1: Single VPS

Current stack:

- One VPS
- Docker Compose
- Nginx
- Backend container
- Frontend container
- PostgreSQL container

Good for:

- MVP
- Early customers
- Low operational cost

Watch limits:

- CPU
- RAM
- Disk
- PostgreSQL connections
- Upload storage growth
- Backup duration

### Stage 2: Dedicated Database and Object Storage

Move to:

- Managed PostgreSQL or separate database VPS.
- Object storage for uploaded images.
- CDN for static/public assets.
- Redis for rate limiting, cache, and queues.

Benefits:

- Lower risk of database loss during app deployment.
- Better media delivery.
- Easier backup strategy.

### Stage 3: Horizontal Backend Scaling

Move to:

```text
load balancer
  |
  +-- backend replica 1
  +-- backend replica 2
  +-- backend replica N
```

Requirements:

- Stateless backend.
- Refresh tokens stored in database.
- Rate limiting state moved to Redis.
- File uploads moved out of local filesystem.
- Nginx or external load balancer distributes traffic.

### Stage 4: Multi-Region or High Availability

Only when needed:

- Managed database with replicas.
- Separate read replicas for analytics.
- CDN-backed public websites.
- Queue workers for heavy jobs.
- Separate admin app and public renderer deployment.

Tradeoff: HA architecture increases cost and operational complexity. Do not introduce it before real customer traffic justifies it.

---

## 8. Operational Roles and Responsibilities

### Super Admin

- Manage tenants.
- Manage subscriptions.
- Suspend/reactivate tenants.
- Manage templates.
- Review platform analytics.

### Support Operator

Future role recommendation:

- Help tenants complete onboarding.
- Assist custom domain setup.
- Handle content migration.
- Escalate billing and technical incidents.

### Technical Operator

- Monitor uptime.
- Verify backups.
- Run deployments.
- Rotate secrets.
- Restore incidents.
- Review logs and alerts.

---

## 9. Launch Checklist

Before commercial launch:

- Production `.env` has strong secrets.
- VPS firewall allows only needed ports.
- TLS is configured.
- DNS points to VPS.
- Backups run automatically.
- Backup restore has been tested.
- GitHub Actions secrets are configured.
- Deploy workflow has run successfully.
- Terms, privacy policy, and refund policy are published.
- Basic support channel is ready.
- Tenant suspension and data retention policy are documented.

---

## 10. Immediate Next Operational Improvements

Recommended implementation after Phase 8:

1. Add subscription limit enforcement in backend guards/services.
2. Add payment provider abstraction.
3. Add domain verification module.
4. Add upload storage adapter for object storage.
5. Add analytics event ingestion endpoints.
6. Add backup script and scheduled backup workflow.
7. Add structured request logging.
8. Add health endpoint in backend, not only Nginx.
9. Add Super Admin seed command.
10. Add staging environment.

## Phase 8 Approval Gate

Phase 8 SaaS Operations is complete. Additional features should be planned as new scoped phases or tickets.
