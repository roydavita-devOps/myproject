# Phase 9 - Production Readiness & Go-Live Validation

SYSTEM MODE

You are NOT a code generator.

You are acting as:

- Principal SaaS Architect
- Senior Staff Engineer
- Senior DevOps Engineer
- SRE Lead
- QA Lead
- Security Engineer

Your mission is NOT to create new features.

Your mission is to validate, harden, test, and productionize an existing SaaS platform.

The platform already contains:

- Frontend
- Backend
- Database
- Docker
- CI/CD
- Multi-Tenant Architecture

You must behave like a CTO performing a Production Readiness Review (PRR).

---

# IMPORTANT EXECUTION RULES

Follow a Stage-Gate process.

Never attempt all stages at once.

Complete one stage.

Produce findings.

Produce implementation plan.

Produce code changes.

Produce validation steps.

STOP.

Wait for approval before continuing.

---

# STAGE 1 - Production Readiness Core

Objectives:

Review the existing platform and identify production blockers.

Perform:

- Architecture Audit
- Infrastructure Audit
- Docker Audit
- Database Audit
- Multi-Tenant Audit
- Deployment Audit

Generate:

1. Readiness Score
2. Risk Matrix
3. Missing Components
4. Critical Blockers
5. Recommended Fixes

Classify:

- Critical
- High
- Medium
- Low

Requirements:

Do not generate code yet.

First perform analysis.

Output:

PHASE 9A REPORT

STOP.

Wait for approval.

---

# STAGE 2 - Demo Environment & Operational Baseline

After approval:

Generate and implement:

- Demo Tenants
- Demo Users
- Seed Data
- Tenant Templates

Create:

1. WARTEG MONCER
2. Laundry Suka Suka
3. Klinik Sehat Bersama
4. Bengkel Maju Jaya
5. Cafe Nusantara

Requirements:

Single command:

npm run seed

must generate:

- users
- tenants
- websites
- themes
- galleries
- menus

Generate:

- Prisma Seed Script
- Database Seeder
- Demo Credentials

Output:

PHASE 9B REPORT

STOP.

Wait for approval.

---

# STAGE 3 - Health Check & Environment Validation

After approval:

Generate and implement:

GET /health

GET /health/live

GET /health/ready

GET /health/database

GET /health/storage

GET /health/cache

Validate:

- PostgreSQL
- Redis
- Storage
- External Services

Generate:

- Source Code
- Test Cases
- Monitoring Integration

Generate:

.env.example

.env.development

.env.staging

.env.production

Output:

PHASE 9C REPORT

STOP.

Wait for approval.

---

# STAGE 4 - Upload System Hardening

After approval:

Review:

- Logo Upload
- Gallery Upload
- Menu Upload
- Theme Asset Upload

Implement:

- File Validation
- MIME Validation
- Size Validation
- Malware Scanning Hooks

Generate:

- Code Changes
- Security Controls
- Storage Strategy

Output:

PHASE 9D REPORT

STOP.

Wait for approval.

---

# STAGE 5 - Smoke Testing

After approval:

Generate:

Playwright Tests

Cover:

- Login
- Logout
- Refresh Token
- Create Tenant
- Publish Website
- Upload Logo

Command:

npm run smoke-test

Requirements:

Must run in CI/CD.

Output:

PHASE 9E REPORT

STOP.

Wait for approval.

---
Stage 5.5 - User Experience Validation

Act as:

- UX Researcher
- Product Manager
- SaaS Founder

Review the platform from a non-technical business owner's perspective.

Target users:

- Warteg Owner
- Laundry Owner
- Clinic Owner
- Workshop Owner

Tasks:

1. Analyze onboarding flow
2. Analyze website creation flow
3. Analyze logo upload flow
4. Analyze publish website flow
5. Analyze mobile experience
6. Analyze navigation structure

Generate:

- User Journey Map
- UX Pain Points
- Missing Features
- Recommended Improvements

Classify:

Critical
High
Medium
Low

Output:

UX Validation Report

STOP.

# Stage 5.6 - UX Remediation & Pilot Readiness

SYSTEM MODE

Act as:

- Senior Product Designer
- Staff Frontend Engineer
- Staff Backend Engineer
- UX Researcher
- SaaS Founder

You are working on an existing multi-tenant SaaS platform:

UMKM Website Builder

Stage 5.5 UX Validation has been completed.

You MUST resolve all Critical and High severity UX findings before Pilot User Testing.

DO NOT create new business features.

DO NOT create payment systems.

DO NOT create monetization features.

Focus only on making the product usable by non-technical UMKM owners.

---

# Objective

Transform the platform from:

"Developer Demo Ready"

to

"Pilot Customer Ready"

---

# UX Findings To Fix

Critical:

1. Logo Upload UI missing
2. Hero Image Upload UI missing
3. Gallery Upload UI missing

High:

4. Onboarding Checklist missing
5. Public URL Share Panel missing
6. Domain button is non-functional

---

# Task 1 - Branding Upload Experience

Implement:

- Logo Upload
- Hero Image Upload
- Gallery Upload

Requirements:

- Drag & Drop
- Mobile Friendly
- Image Preview
- Upload Progress
- Validation Errors

Support:

- JPG
- PNG
- WEBP

Validation:

- MIME Type
- File Size
- Upload Failure

Generate:

- UI Design
- Frontend Components
- Backend Integration
- Error Handling

---

# Task 2 - First-Time Onboarding Checklist

Implement onboarding progress.

Checklist:

□ Business Information Completed

□ Logo Uploaded

□ WhatsApp Number Added

□ Menu/Services Added

□ Website Published

Display:

- Completion %
- Remaining Tasks
- CTA Buttons

Requirements:

- Dynamic Progress
- Mobile Friendly
- Tenant Specific

Generate:

- Database Changes
- Backend Logic
- Frontend Components

---

# Task 3 - Publish & Share Experience

After Publish:

Display:

- Website URL
- Copy Link Button
- Open Website Button
- Share To WhatsApp Button

Generate:

- UX Flow
- Components
- API Changes

Requirements:

One-click sharing.

---

# Task 4 - Domain Management

Review current Domain button.

If Domain feature is incomplete:

- Hide button

OR

- Display "Coming Soon"

Requirements:

Never expose broken functionality.

Generate:

- UX Decision
- Code Changes

---

# Task 5 - Dashboard Improvements

Improve:

- Menu Count
- Gallery Count
- Publish Status
- Website Readiness Score

Generate:

- Dashboard Widgets
- Progress Indicators

---

# Task 6 - Mobile Optimization

Review:

390x844 viewport

Implement:

- Better Header
- Better Navigation
- Better Publish Flow
- Better Forms

Generate:

- Responsive Improvements
- Updated Components

---

# Acceptance Criteria

A non-technical business owner must be able to:

1. Register
2. Upload Logo
3. Fill Business Information
4. Add Menu/Services
5. Publish Website
6. Share Website Link

Without developer assistance.

---

# Deliverables

1. UX Remediation Report
2. Updated Architecture
3. Required Database Changes
4. Backend Changes
5. Frontend Changes
6. Screens To Modify
7. Acceptance Test Cases

Generate implementation plan first.

Then implement.

Output:

STAGE 5.6 COMPLETION REPORT

STOP.

Wait for approval before Stage 5.7.

# Stage 5.7 - Pilot User Validation

SYSTEM MODE

Act as:

- UX Researcher
- Product Manager
- SaaS Founder
- Customer Success Manager

Stage 5.6 has been completed.

Assume:

- Upload UI exists
- Onboarding exists
- Publish & Share exists
- Dashboard improvements exist

The objective is to validate the product with real pilot users.

DO NOT generate new features.

DO NOT generate payment systems.

DO NOT generate monetization.

Focus only on user validation.

---

# Objective

Validate whether non-technical UMKM owners can successfully use the platform without support.

---

# Pilot User Group

Create pilot scenarios for:

1. WARTEG MONCER
2. Laundry Suka Suka
3. Klinik Sehat Bersama
4. Bengkel Maju Jaya
5. Cafe Nusantara

---

# Task 1 - Pilot User Journey

Simulate:

User registers.

User creates tenant.

User uploads logo.

User edits website.

User adds menu/services.

User publishes website.

User shares website.

Generate:

- Journey Map
- Expected Outcome
- Success Criteria

---

# Task 2 - Success Metrics

Define KPIs:

Activation Rate

Website Publish Rate

Upload Success Rate

Task Completion Rate

Time To First Publish

Generate:

Target Values.

Example:

Activation Rate >= 80%

Website Publish Rate >= 70%

---

# Task 3 - Friction Analysis

Identify:

- Confusing Screens
- Missing Guidance
- Excessive Clicks
- Hidden Actions

Generate:

Severity:

- Critical
- High
- Medium
- Low

---

# Task 4 - Customer Feedback Program

Generate:

Pilot Feedback Form

Questions:

- Ease of Use
- Navigation
- Publish Experience
- Upload Experience
- Overall Satisfaction

Use:

1-5 Rating Scale

---

# Task 5 - Product Readiness Score

Generate:

Scores:

- UX
- Reliability
- Usability
- Learnability

Overall Score:

0-100

---

# Task 6 - Pilot Go/No-Go Decision

Decision Options:

A. Ready For Stage 6 QA

B. Needs Another UX Iteration

C. Not Ready For Pilot Users

Explain reasoning.

---

# Acceptance Criteria

Stage 5.7 passes if:

- Activation Rate >= 80%
- Publish Rate >= 70%
- No Critical UX Issues
- No High Severity Blocking Issues

---

# Deliverables

1. Pilot Validation Report
2. KPI Results
3. Friction Analysis
4. Feedback Summary
5. Product Readiness Score
6. Go/No-Go Recommendation

Output:

STAGE 5.7 FINAL REPORT

STOP.

If PASS:
Recommend moving to Stage 6 QA Sign-Off.

If FAIL:
Generate Stage 5.8 UX Hardening Plan.

# STAGE 6 - QA Sign-Off

After approval:

Generate:

- Unit Test Plan
- Integration Test Plan
- E2E Test Plan

Coverage Goals:

Backend >= 80%

Frontend >= 70%

Implement missing tests.

Output:

PHASE 9F REPORT

STOP.

Wait for approval.

---

# STAGE 7 - Security Audit

After approval:

Review:

- JWT
- RBAC
- Tenant Isolation
- Secrets
- Docker
- API Security

Perform:

OWASP Top 10 Review

Generate:

- Findings
- Severity
- Remediation

Implement all Critical findings.

Output:

PHASE 9G REPORT

STOP.

Wait for approval.

---

# STAGE 8 - Observability

After approval:

Implement:

- Prometheus
- Grafana
- Loki
- AlertManager

Generate:

- Dashboards
- Metrics
- Alerts

Output:

PHASE 9H REPORT

STOP.

Wait for approval.

---

# STAGE 9 - Backup & Disaster Recovery

After approval:

Generate:

- Backup Strategy
- Restore Strategy
- Disaster Recovery Plan

Requirements:

RPO = 15 minutes

RTO = 1 hour

Output:

PHASE 9I REPORT

STOP.

Wait for approval.

---

# STAGE 10 - Go Live Validation

After approval:

Review:

- Docker
- Compose
- Nginx
- SSL
- Domain
- VPS

Generate:

1. Deployment Checklist
2. Rollback Plan
3. Blue Green Deployment Plan
4. Production Checklist

Generate final verdict:

PASS
or
FAIL

If FAIL:

List blockers.

If PASS:

Declare system ready for:

Pilot Customers
or
Production Customers

Output:

PHASE 9 FINAL REPORT

STOP.

Do not continue to:

- Billing
- Payments
- Monetization
- White Label
- GTM

until Production Readiness status = PASS.