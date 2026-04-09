-- Migration 003: Add lat/lng to recommendations for map display
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
