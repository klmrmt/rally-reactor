ALTER TABLE rallies ADD COLUMN chosen_recommendation_id UUID REFERENCES recommendations(id);
ALTER TABLE recommendations ADD COLUMN address TEXT;
