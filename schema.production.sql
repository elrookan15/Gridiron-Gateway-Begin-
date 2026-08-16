-- =============================================================================
-- Gridiron Gateway — Production Relational Schema (CFBD / Sidearm / CSV)
-- Target: Supabase (PostgreSQL 15+)
-- Invariant: coach emails are nullable — never LLM-invented
-- =============================================================================

CREATE TYPE division_tier_enum AS ENUM (
  'FBS_POWER_4',
  'FBS_GROUP_OF_5',
  'FCS',
  'D2',
  'D3',
  'NAIA',
  'JUCO',
  'PREP'
);

CREATE TABLE schools (
  school_id VARCHAR(100) PRIMARY KEY, -- typically cfbd-{id} or csv-{tier}-{slug}
  institution_name VARCHAR(255) NOT NULL,
  mascot VARCHAR(100),
  abbreviation VARCHAR(50),
  tier division_tier_enum NOT NULL,
  conference VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  stadium_capacity INTEGER,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE college_coaches (
  coach_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id VARCHAR(100) NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  email VARCHAR(255), -- NULL when athletics page omits contact
  office_phone VARCHAR(50),
  twitter_handle VARCHAR(100),
  source_url VARCHAR(500),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athlete_profiles (
  athlete_id VARCHAR(100) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  grad_year INTEGER NOT NULL,
  primary_position VARCHAR(10) NOT NULL,
  state VARCHAR(50),
  star_rating INTEGER NOT NULL DEFAULT 0 CHECK (star_rating >= 0 AND star_rating <= 5),
  true_speed_mph DECIMAL(5, 2),
  cognition_score INTEGER CHECK (cognition_score IS NULL OR (cognition_score >= 0 AND cognition_score <= 100))
);

-- Optimize queries for the Autonomous Scouting Agent and Leaderboard
CREATE INDEX idx_schools_tier ON schools (tier);
CREATE INDEX idx_schools_state ON schools (state);
CREATE INDEX idx_coaches_school ON college_coaches (school_id);
CREATE INDEX idx_coaches_email ON college_coaches (email) WHERE email IS NOT NULL;
CREATE INDEX idx_athletes_position_year ON athlete_profiles (primary_position, grad_year);
CREATE INDEX idx_athletes_state ON athlete_profiles (state);

COMMENT ON TABLE schools IS 'CFBD-synced + CSV JUCO/Prep institution directory. PK = stable ingest id.';
COMMENT ON TABLE college_coaches IS 'Sidearm/CSV verified staff contacts. email NULL when unpublished.';
COMMENT ON TABLE athlete_profiles IS 'Scouting-agent athlete facts (TrueSpeed + Cognition) for scheme-fit matching.';
COMMENT ON COLUMN college_coaches.email IS 'Extracted from published athletics pages or verified CSV only — never hallucinated.';

-- RallySafe third-party NIL Go ledger (fail-closed clearinghouse). Apply:
-- supabase/migrations/20260814120000_nil_transactions.sql
-- Do not store CapGM / CAPS institutional revenue-share rows here.
