-- Migration 002: Indexes for account-based dashboard queries

CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_rallies_group_leader_id ON rallies(group_leader_id);
