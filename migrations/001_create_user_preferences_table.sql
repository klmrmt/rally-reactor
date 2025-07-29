-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rally_id VARCHAR(6) NOT NULL,
    cost_level VARCHAR(10) NOT NULL CHECK (cost_level IN ('low', 'medium', 'high')),
    vibe VARCHAR(20) NOT NULL CHECK (vibe IN ('casual', 'formal', 'adventure', 'relaxed', 'energetic')),
    location_radius INTEGER NOT NULL CHECK (location_radius >= 1 AND location_radius <= 50),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one preference per user per rally
    UNIQUE(user_id, rally_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_rally ON user_preferences(user_id, rally_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_rally_id ON user_preferences(rally_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 