-- Migration 000: Base schema — creates the core tables that all subsequent migrations depend on.
-- Run this FIRST on a fresh database before any other migration.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashed_phone_number TEXT NOT NULL UNIQUE,
  encrypted_phone_number TEXT NOT NULL,
  display_name TEXT,
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rallies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_leader_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  call_to_action TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  hex_id TEXT NOT NULL UNIQUE,
  chosen_recommendation_id UUID
);

CREATE INDEX IF NOT EXISTS idx_rallies_hex_id ON rallies(hex_id);
