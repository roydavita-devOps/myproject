# Stage 5.9 - Database & Deployment Readiness Audit

SYSTEM MODE

Act as:

- Senior Platform Engineer
- Senior DevOps Engineer
- Senior Backend Engineer
- Prisma Expert
- Railway Deployment Engineer

You are NOT allowed to guess.

You MUST inspect the repository first.

You MUST verify actual files before making recommendations.

Do not modify any code yet.

Do not create new features.

Your goal is to prepare the existing SaaS platform for deployment to:

- Supabase PostgreSQL
- Railway
- Vercel

Current Situation:

- Supabase project already exists
- Railway project not deployed yet
- Vercel project not deployed yet
- Application currently works locally
- Multi-tenant architecture already implemented

---

# TASK 1 - Prisma Audit

Inspect:

- backend/prisma/schema.prisma
- backend/package.json
- prisma migrations directory
- seed scripts

Verify:

1. Prisma datasource configuration
2. DATABASE_URL usage
3. DIRECT_URL usage
4. Prisma client generation
5. Migration strategy
6. Seed strategy

Generate:

- Prisma Audit Report
- Risks
- Required Changes

Do not change code.

---

# TASK 2 - Environment Audit

Inspect:

- .env
- .env.development
- .env.staging
- .env.production
- docker-compose.yml
- backend configuration

Find:

- DATABASE_URL source
- DIRECT_URL source
- Missing environment variables
- Railway requirements
- Vercel requirements

Generate:

Environment Variable Matrix

Columns:

- Variable
- Local
- Railway
- Vercel
- Supabase
- Required
- Optional

---

# TASK 3 - Migration Readiness

Determine:

- Exact command to connect to Supabase
- Exact command to validate connection
- Exact command to apply migrations
- Exact command to run seed data

Requirements:

Use repository scripts if available.

Do NOT invent commands.

Verify package.json first.

Generate:

Migration Execution Plan

Include:

Step 1
Step 2
Step 3
...

Expected output for each step.

---

# TASK 4 - Deployment Blockers

Identify:

- Missing configuration
- Missing secrets
- Migration risks
- Deployment risks

Classify:

- Critical
- High
- Medium
- Low

Generate:

Deployment Blocker Report

---

# TASK 5 - Go / No-Go Decision

Answer:

Can this repository safely run:

- Prisma migrate deploy
- Seed data
- Railway deployment

YES or NO

Explain why.

---

# OUTPUT FORMAT

Provide:

1. Prisma Audit Report
2. Environment Audit Report
3. Migration Execution Plan
4. Deployment Blockers
5. Go / No-Go Decision

STOP.

Do NOT modify any files.

Do NOT generate code.

Do NOT deploy.

Do NOT continue to Railway or Vercel deployment until the audit is complete.