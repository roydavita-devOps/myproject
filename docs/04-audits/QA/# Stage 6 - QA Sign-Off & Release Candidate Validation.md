# Stage 6 - QA Sign-Off & Release Candidate Validation

Act as:

* Senior QA Engineer
* Senior Test Engineer
* SaaS Product QA Lead
* Release Manager

Current Status:

* Supabase deployed and operational
* Railway backend deployed and operational
* Vercel frontend deployed and operational
* Authentication working
* Pilot environment live

IMPORTANT

Do NOT add new features.

Do NOT redesign architecture.

Do NOT refactor unrelated code.

Your goal is to validate production readiness of the current implementation.

---

## TASK 1 - Functional Test Matrix

Verify all critical user journeys:

Authentication

* Login
* Logout
* Invalid credentials
* Session persistence
* Token refresh

Tenant Management

* Create tenant
* Edit tenant
* View tenant
* Switch tenant

Website Builder

* Edit website
* Save website
* Publish website
* Unpublish website

Media

* Upload logo
* Upload gallery image
* Delete image
* Invalid file upload

Public Website

* Open published website
* Open unpublished website
* Mobile responsiveness
* Broken links

Generate:

QA Functional Test Matrix

PASS / FAIL / NOT TESTED

---

## TASK 2 - Edge Case Testing

Verify:

* Empty forms
* Duplicate email
* Duplicate tenant slug
* Invalid image upload
* Invalid login
* Missing required fields
* Long text fields
* Special characters
* Browser refresh during edit

Generate:

Edge Case Report

---

## TASK 3 - Data Integrity Validation

Verify:

* Tenant isolation
* Data ownership
* Cross-tenant access prevention
* Publish state consistency
* Image ownership consistency

Generate:

Data Integrity Report

---

## TASK 4 - UX Review

Review:

* Error messages
* Loading states
* Empty states
* Validation messages
* Mobile usability

Generate:

UX Findings Report

Classify:

* Critical
* High
* Medium
* Low

---

## TASK 5 - Release Candidate Decision

Provide:

* Critical Issues Count
* High Issues Count
* Medium Issues Count
* Low Issues Count

Decision:

GO
or
NO-GO

Provide justification.

---

OUTPUT

1. Functional Test Matrix
2. Edge Case Report
3. Data Integrity Report
4. UX Findings
5. Release Candidate Decision

STOP.

Do not implement fixes.

Do not create features.

Only perform QA validation and reporting.
