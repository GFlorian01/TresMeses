-- Add onboarding_complete flag to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

-- Backfill: users who already have a cycle completed setup manually via /settings
UPDATE users
SET onboarding_complete = true
WHERE id IN (SELECT DISTINCT user_id FROM cycles);
