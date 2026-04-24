-- Add pause and restart fields to cycles table
ALTER TABLE cycles
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pause_reason TEXT,
  ADD COLUMN IF NOT EXISTS total_paused_days INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS restart_reason TEXT;
