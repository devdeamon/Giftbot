-- Create mining-related tables for real traffic generation
CREATE TABLE IF NOT EXISTS mining_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  order_id UUID NOT NULL,
  target_mbps INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  loss_rate DECIMAL(5,4) DEFAULT 0,
  jitter_ms DECIMAL(8,2) DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mining_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id UUID REFERENCES mining_sessions(id),
  bytes_processed BIGINT NOT NULL,
  quality_score DECIMAL(8,4) NOT NULL,
  final_score DECIMAL(12,6) NOT NULL,
  proof_signature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  total_score DECIMAL(15,6) DEFAULT 0,
  total_bytes BIGINT DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  last_mining_at TIMESTAMP WITH TIME ZONE,
  trust_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_id ON mining_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_sessions_status ON mining_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mining_payouts_user_id ON mining_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_payouts_created_at ON mining_payouts(created_at);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_score ON user_stats(total_score DESC);

-- Create materialized views for leaderboards
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_leaderboard AS
SELECT 
  u.user_id,
  u.name as display_name,
  COALESCE(SUM(p.final_score), 0) as daily_score,
  COUNT(p.id) as sessions_today,
  DATE(p.created_at) as day
FROM user_stats u
LEFT JOIN mining_payouts p ON u.user_id = p.user_id 
  AND DATE(p.created_at) = CURRENT_DATE
GROUP BY u.user_id, u.name, DATE(p.created_at)
ORDER BY daily_score DESC;

CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_leaderboard AS
SELECT 
  u.user_id,
  u.name as display_name,
  COALESCE(SUM(p.final_score), 0) as weekly_score,
  COUNT(p.id) as sessions_week,
  DATE_TRUNC('week', p.created_at) as week
FROM user_stats u
LEFT JOIN mining_payouts p ON u.user_id = p.user_id 
  AND p.created_at >= DATE_TRUNC('week', CURRENT_DATE)
GROUP BY u.user_id, u.name, DATE_TRUNC('week', p.created_at)
ORDER BY weekly_score DESC;

-- Insert or update user stats trigger
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id, total_score, total_bytes, sessions_count, last_mining_at)
  VALUES (NEW.user_id, NEW.final_score, NEW.bytes_processed, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_score = user_stats.total_score + NEW.final_score,
    total_bytes = user_stats.total_bytes + NEW.bytes_processed,
    sessions_count = user_stats.sessions_count + 1,
    last_mining_at = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_user_stats
  AFTER INSERT ON mining_payouts
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();
