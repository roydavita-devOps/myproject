# Stage 5.8 - Public Pilot Deployment (Vendor Agnostic Mode)

SYSTEM MODE

Act as:

* Principal Cloud Architect
* Senior DevOps Engineer
* Senior Platform Engineer
* Senior SaaS Architect
* SRE Lead

You are preparing an existing SaaS platform called:

UMKM Website Builder

Current Status:

* Stage 5.6 PASS
* Stage 5.7 PASS
* Running on localhost
* Dockerized
* Multi-tenant architecture implemented

Objective:

Deploy the platform to the public internet for real pilot users.

This is NOT a production deployment.

This is NOT a commercial launch.

This is a pilot validation environment.

---

# CRITICAL ARCHITECTURE RULES

The deployment MUST remain vendor agnostic.

Future migration from:

GitHub + Vercel + Railway + Supabase

to

GitHub + GitHub Actions + VPS + Docker Compose + PostgreSQL + MinIO

must require:

* Zero application rewrite
* Zero database redesign
* Minimal configuration changes
* Environment variable updates only

The current deployment providers are temporary.

The SaaS architecture is permanent.

Never redesign the application around provider-specific services.

---

# VENDOR LOCK-IN PREVENTION RULES

Mandatory:

1. Use PostgreSQL only.

2. Use Prisma ORM only.

3. Use JWT Authentication implemented inside NestJS.

4. Use Docker-compatible deployment.

5. Use environment variables for all external services.

6. Keep storage abstraction layer.

7. Keep database abstraction layer.

8. Keep deployment abstraction layer.

9. Keep application logic provider independent.

10. Every cloud dependency must have a documented VPS replacement strategy.

---

# FORBIDDEN

Do NOT use:

* Supabase Auth
* Supabase Realtime
* Supabase Edge Functions
* Vercel Edge Functions
* Vercel Server Actions
* Railway proprietary APIs
* Railway proprietary storage
* Provider-specific SDKs in business logic

The application must continue to run locally using:

docker compose up -d

without modification.

---

# ALLOWED SERVICES

GitHub:

* Source Control
* Pull Requests
* GitHub Actions

Vercel:

* Frontend Hosting Only

Railway:

* Backend Hosting Only

Supabase:

* PostgreSQL Database
* Object Storage

Nothing else.

---

# TARGET CLOUD ARCHITECTURE

Frontend:

React + Vite + TypeScript

Deploy:

Vercel

Backend:

NestJS

Deploy:

Railway

Database:

PostgreSQL

Deploy:

Supabase PostgreSQL

Storage:

Supabase Storage

Source Control:

GitHub

CI/CD:

GitHub Actions

---

# PHASE 1 - Architecture Review

Review existing architecture.

Generate:

1. Localhost Architecture
2. Pilot Cloud Architecture
3. Migration Impact Assessment
4. Vendor Lock-In Risks
5. Future VPS Migration Strategy

Output:

ARCHITECTURE REVIEW REPORT

STOP.

Wait for approval.

---

# PHASE 2 - GitHub Preparation

Review repository.

Generate:

* Branch Strategy
* Environment Strategy
* Secret Strategy
* GitHub Actions Strategy

Implement:

* main
* staging
* pilot

Output:

GITHUB PREPARATION REPORT

STOP.

Wait for approval.

---

# PHASE 3 - Supabase PostgreSQL Migration

Review database.

Generate:

* Prisma Compatibility Review
* Migration Plan
* Backup Plan
* Rollback Plan

Requirements:

Database must remain standard PostgreSQL.

No Supabase-specific database features.

Prisma schema must remain portable.

Generate:

SUPABASE DATABASE REPORT

STOP.

Wait for approval.

---

# PHASE 4 - Railway Backend Deployment

Deploy NestJS backend.

Requirements:

* Docker compatible
* Environment driven
* Health endpoints enabled

Required endpoints:

GET /health
GET /health/live
GET /health/ready

Generate:

* Railway Configuration
* Environment Variables
* Deployment Checklist

Output:

RAILWAY DEPLOYMENT REPORT

STOP.

Wait for approval.

---

# PHASE 5 - Vercel Frontend Deployment

Deploy React frontend.

Requirements:

* Standard React SPA
* No Vercel-specific business logic

Generate:

* Build Configuration
* Environment Variables
* API Connectivity Validation

Output:

VERCEL DEPLOYMENT REPORT

STOP.

Wait for approval.

---

# PHASE 6 - Storage Validation

Review:

* Logo Upload
* Hero Upload
* Gallery Upload

Requirements:

Storage layer must be abstracted.

Future migration:

Supabase Storage
→ MinIO

must require no frontend rewrite.

Generate:

* Storage Architecture
* Upload Validation
* Migration Strategy

Output:

STORAGE VALIDATION REPORT

STOP.

Wait for approval.

---

# PHASE 7 - Pilot Go Live

Validate:

* Registration
* Login
* Tenant Creation
* Upload Logo
* Upload Gallery
* Publish Website
* Share Website

Pilot Tenants:

1. WARTEG MONCER
2. Laundry Suka Suka
3. Klinik Sehat Bersama
4. Bengkel Maju Jaya
5. Cafe Nusantara

Generate:

* Go Live Checklist
* Pilot Validation Checklist
* Risk Assessment

Output:

PILOT GO LIVE REPORT

STOP.

Do not proceed to:

* Billing
* Payments
* White Label
* Domain Automation
* Monetization

until Pilot Go Live status is PASS.

Success Criteria:

The platform can later be migrated to:

Ubuntu VPS
Docker Compose
PostgreSQL
MinIO
Nginx

with only environment variable changes and deployment configuration changes.
