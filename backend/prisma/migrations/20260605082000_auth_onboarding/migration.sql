ALTER TABLE "users" ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;

UPDATE "users"
SET "onboarding_completed" = true
WHERE "tenant_id" IS NOT NULL;
