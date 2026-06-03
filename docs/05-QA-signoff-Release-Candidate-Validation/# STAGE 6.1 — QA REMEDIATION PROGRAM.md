# STAGE 6.1 — QA REMEDIATION PROGRAM

## ROLE

Act as:

* Principal Software Engineer
* Principal SaaS Architect
* Senior NestJS Engineer
* Senior React Engineer
* Principal QA Remediation Lead

Current Status:

Stage 6 QA Sign-Off has been completed.

Result:

* Critical Issues: 1
* High Issues: 2
* Medium Issues: 3
* Decision: NO-GO

Your mission is NOT to redesign the platform.

Your mission is ONLY to fix validated findings from Stage 6 QA.

Do not create new features.

Do not refactor unrelated modules.

Do not redesign architecture.

Only implement targeted fixes.

---

# SPRINT 1 — WEBSITE PERSISTENCE FIX

Priority: P1 Critical

Problem:

Website edit/save requests return HTTP 200 but submitted changes are not persisted.

Observed symptoms:

* Edit website returns success
* Save website returns success
* Data remains unchanged
* Pilot users may believe changes were saved

Objective:

Identify root cause and implement fix.

Validate:

* Business Name update
* Tagline update
* Description update
* Theme update
* Website settings update

Requirements:

1. Trace complete flow

Frontend
↓
API
↓
DTO
↓
Controller
↓
Service
↓
Prisma
↓
Database

2. Identify exact failure point.

3. Implement minimal fix.

4. Add regression test.

5. Verify persistence.

Deliverables:

PHASE 9F.1 REMEDIATION REPORT

Include:

* Root Cause
* Files Modified
* Fix Applied
* Test Evidence
* PASS / FAIL

STOP

Do not continue to Sprint 2 until Sprint 1 is completed and validated.

---

# SPRINT 2 — MEDIA DELETION REMEDIATION

Priority: P2 High

Start only after Sprint 1 PASS.

Problem:

Image deletion workflow could not be validated.

Objective:

Determine whether:

A. Delete functionality exists but is broken.

or

B. Delete functionality does not exist.

Tasks:

1. Audit backend endpoints.

2. Audit frontend media UI.

3. Verify:

* Delete logo
* Delete gallery image

If missing:

Implement minimal delete functionality.

If existing:

Fix functionality.

Requirements:

* Tenant ownership validation
* Storage cleanup validation
* Database cleanup validation

Deliverables:

PHASE 9F.2 REMEDIATION REPORT

Include:

* Root Cause
* Files Modified
* Test Evidence
* PASS / FAIL

STOP

Do not continue to Sprint 3 until Sprint 2 is completed and validated.

---

# SPRINT 3 — LINT & CODE QUALITY REMEDIATION

Priority: P3 Medium

Start only after Sprint 2 PASS.

Problem:

Backend lint fails.

Frontend lint fails.

Tasks:

Backend:

* Fix ESLint configuration
* Fix lint execution

Frontend:

* Fix TypeScript lint issues
* Fix parser configuration
* Fix lint execution

Requirements:

Do not suppress errors blindly.

Do not disable lint rules globally.

Use production-quality fixes.

Deliverables:

PHASE 9F.3 REMEDIATION REPORT

Include:

* Root Cause
* Files Modified
* Test Evidence

Commands:

npm --prefix backend run lint

npm --prefix frontend run lint

Both must PASS.

PASS / FAIL

STOP

---

# FINAL VALIDATION

After all three sprints complete:

Execute:

1. Backend tests
2. Frontend build
3. Backend build
4. Smoke test
5. Regression validation

Generate:

STAGE 6.1 FINAL REMEDIATION REPORT

Include:

* Sprint 1 Result
* Sprint 2 Result
* Sprint 3 Result

Summary:

Critical Issues Remaining
High Issues Remaining
Medium Issues Remaining

Recommendation:

READY FOR STAGE 6 RE-RUN
or
ADDITIONAL REMEDIATION REQUIRED

STOP

Do not proceed to Stage 7 Security Audit.

Do not implement observability.

Do not implement backup.

Do not implement payment gateway.

Focus exclusively on validated QA findings.
