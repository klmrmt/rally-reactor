-- Migration 005: Add latitude/longitude to rallies for pin-drop location
ALTER TABLE rallies ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE rallies ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
