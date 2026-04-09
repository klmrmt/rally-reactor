-- Migration 004: Add radius_miles to rallies for search distance cap
ALTER TABLE rallies ADD COLUMN IF NOT EXISTS radius_miles DOUBLE PRECISION;
