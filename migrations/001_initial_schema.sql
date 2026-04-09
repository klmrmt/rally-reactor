-- Migration 001: Initial schema for Rally MVP
-- Step 1: Fix users PK and clean up partial state (outside transaction)

-- users.user_id has no PK — add it so FKs can reference it
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);

-- Drop the partially-created recommendations table from a failed run
DROP TABLE IF EXISTS recommendations CASCADE;

-- Enum types — use DO with alternate quoting to avoid $$ conflicts
DO $block$
BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'rally_status';
  IF NOT FOUND THEN
    CREATE TYPE rally_status AS ENUM ('voting', 'recommending', 'picking', 'decided', 'completed');
  END IF;
END
$block$;

DO $block$
BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'budget_level';
  IF NOT FOUND THEN
    EXECUTE $$CREATE TYPE budget_level AS ENUM ('$', '$$', '$$$')$$;
  END IF;
END
$block$;

DO $block$
BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'distance_level';
  IF NOT FOUND THEN
    CREATE TYPE distance_level AS ENUM ('walk', 'short_drive', 'anywhere');
  END IF;
END
$block$;

-- Add new columns to rallies (idempotent)
ALTER TABLE rallies
  ADD COLUMN IF NOT EXISTS status rally_status NOT NULL DEFAULT 'voting',
  ADD COLUMN IF NOT EXISTS voting_closes_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rally_id UUID NOT NULL REFERENCES rallies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rally_id, display_name)
);

-- Constraint votes table
CREATE TABLE IF NOT EXISTS constraint_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rally_id UUID NOT NULL REFERENCES rallies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  budget budget_level NOT NULL,
  vibes TEXT[] NOT NULL DEFAULT '{}',
  distance distance_level NOT NULL,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rally_id, participant_id)
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rally_id UUID NOT NULL REFERENCES rallies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  why_it_fits TEXT,
  distance_label TEXT,
  price_level TEXT,
  rating NUMERIC(2,1),
  image_url TEXT,
  maps_url TEXT,
  source TEXT NOT NULL DEFAULT 'google_places',
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Final votes table
CREATE TABLE IF NOT EXISTS final_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rally_id UUID NOT NULL REFERENCES rallies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rally_id, participant_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rally_id UUID NOT NULL REFERENCES rallies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  liked BOOLEAN NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rally_id, participant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_participants_rally_id ON participants(rally_id);
CREATE INDEX IF NOT EXISTS idx_constraint_votes_rally_id ON constraint_votes(rally_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_rally_id ON recommendations(rally_id);
CREATE INDEX IF NOT EXISTS idx_final_votes_rally_id ON final_votes(rally_id);
CREATE INDEX IF NOT EXISTS idx_final_votes_recommendation_id ON final_votes(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rally_id ON feedback(rally_id);
