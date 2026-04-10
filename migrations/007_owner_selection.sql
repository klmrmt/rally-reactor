ALTER TABLE rallies ADD COLUMN IF NOT EXISTS chosen_recommendation_id UUID REFERENCES recommendations(id);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS address TEXT;
