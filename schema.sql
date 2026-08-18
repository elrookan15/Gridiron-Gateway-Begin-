-- =============================================================================
-- GRIDIRON GATEWAY — PRODUCTION RELATIONAL SCHEMA
-- Target Platform: Supabase / PostgreSQL 15+
-- Philosophy: Fail-Closed Security, Complete Data Integrity & NCAA Compliance
-- =============================================================================

CREATE TYPE division_tier_enum AS ENUM ('FBS_POWER_4', 'FBS_GROUP_OF_5', 'FCS', 'D2', 'D3', 'NAIA', 'JUCO', 'PREP');

CREATE TABLE IF NOT EXISTS schools (
    school_id VARCHAR(100) PRIMARY KEY,
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
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS college_coaches (
    coach_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id VARCHAR(100) REFERENCES schools(school_id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    office_phone VARCHAR(50),
    twitter_handle VARCHAR(100),
    source_url VARCHAR(500),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS athlete_profiles (
    athlete_id VARCHAR(100) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grad_year INTEGER NOT NULL,
    primary_position VARCHAR(10) NOT NULL,
    state VARCHAR(50),
    star_rating INTEGER DEFAULT 0,
    true_speed_mph DECIMAL(5,2),
    cognition_score INTEGER
);

-- Optimize queries for the Autonomous Scouting Agent and Leaderboard
CREATE INDEX IF NOT EXISTS idx_schools_tier ON schools(tier);
CREATE INDEX IF NOT EXISTS idx_coaches_school ON college_coaches(school_id);
CREATE INDEX IF NOT EXISTS idx_athletes_position_year ON athlete_profiles(primary_position, grad_year);

-- -----------------------------------------------------------------------------
-- 1. STRICT DOMAIN ENUMS
-- -----------------------------------------------------------------------------

-- Role-based user classification
CREATE TYPE user_role AS ENUM (
  'hs_athlete',
  'juco_athlete',
  'hs_coach',
  'college_coach',
  'compliance_officer'
);

-- Collegiate and prep athletic division tiers
CREATE TYPE division_tier AS ENUM (
  'FBS_P4',
  'FBS_G5',
  'FBS_IND',
  'FCS',
  'D2',
  'D3',
  'NAIA',
  'JUCO',
  'PREP'
);

-- 40-yard dash measurement verification method
CREATE TYPE dash_type AS ENUM (
  'hand',
  'laser'
);

-- Fail-closed message status lifecycle
CREATE TYPE message_status AS ENUM (
  'approved',
  'blocked_compliance',
  'pending_guardian'
);

-- Official recruitment commitment status
CREATE TYPE commitment_status AS ENUM (
  'Uncommitted',
  'Committed',
  'Signed'
);

-- -----------------------------------------------------------------------------
-- 2. AUTOMATED TIMESTAMP TRIGGER FUNCTION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 3. CORE DATABASE TABLES
-- -----------------------------------------------------------------------------

-- Core Users Table (Integrates directly with Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  guardian_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Minor safety guardian link
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE users IS 'Primary profile table linked to auth.users with self-referencing guardian linkage for minors.';
COMMENT ON COLUMN users.guardian_id IS 'Self-referencing FK linking minor athletes to verified parent/guardian user account.';

-- Colleges, Universities & Prep Programs Directory (legacy MVP UUID model)
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mascot TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  division division_tier NOT NULL,
  conference TEXT NOT NULL,
  primary_recruiting_email TEXT,
  coaching_phone TEXT,
  top_majors TEXT[] DEFAULT '{}'::TEXT[],
  program_highlights TEXT[] DEFAULT '{}'::TEXT[],
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE schools IS 'Comprehensive directory of collegiate and prep football programs across all divisions.';

-- Athlete Physical, Academic & NIL Profiles (1-to-1 with users)
CREATE TABLE athlete_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Physical Measurables & Combine Metrics
  height_inches NUMERIC(4,1),
  weight_lbs INTEGER,
  forty_yard_dash NUMERIC(4,2),
  forty_yard_type dash_type DEFAULT 'laser',
  shuttle_5_10_5 NUMERIC(4,2),
  vertical_jump_inches NUMERIC(4,1),
  bench_press_reps INTEGER,
  squat_lbs INTEGER,
  hand_size NUMERIC(4,2),
  arm_length NUMERIC(4,2),
  
  -- Athletic & High School Info
  primary_position TEXT,
  secondary_position TEXT,
  grad_class INTEGER,
  high_school TEXT,
  city_state TEXT,
  
  -- Academics & NCAA Eligibility
  ncaa_eligibility_id TEXT,
  cumulative_gpa NUMERIC(3,2),
  core_ncaa_gpa NUMERIC(3,2),
  sat_score INTEGER,
  act_score INTEGER,
  intended_major TEXT,
  
  -- NIL Valuation & Star Rating
  star_rating INTEGER DEFAULT 0 CHECK (star_rating >= 0 AND star_rating <= 5),
  position_tier TEXT,
  social_follower_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0.00,
  estimated_nil_value NUMERIC(12,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE athlete_profiles IS 'Detailed athletic, combine, academic, and NIL market valuation profile for high school and JUCO recruits.';

-- Scholarship Offers Table
CREATE TABLE scholarship_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(user_id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT FALSE NOT NULL,
  offer_date DATE DEFAULT CURRENT_DATE NOT NULL,
  commitment_status commitment_status DEFAULT 'Uncommitted' NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(athlete_id, school_id)
);

COMMENT ON TABLE scholarship_offers IS 'Tracks verbal and written official scholarship offers extended to athletes by schools.';

-- Athlete Social Handles & Media Film Links
CREATE TABLE athlete_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL UNIQUE REFERENCES athlete_profiles(user_id) ON DELETE CASCADE,
  twitter_handle TEXT,
  instagram_handle TEXT,
  facebook_handle TEXT,
  hudl_url TEXT,
  youtube_film_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE athlete_media IS 'Stores verified social media handles and game film highlight URLs for recruit scouting.';

-- NCAA Recruiting Calendar Rules Configuration
CREATE TABLE compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type TEXT NOT NULL CHECK (period_type IN ('CONTACT', 'QUIET', 'DEAD', 'EVALUATION')),
  division division_tier,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (end_time > start_time)
);

COMMENT ON TABLE compliance_rules IS 'NCAA recruiting calendar windows governing allowable coach-athlete interactions.';

-- Direct Messages Table (Fail-Closed Default Status)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status message_status DEFAULT 'blocked_compliance' NOT NULL,
  blocked_reason TEXT,
  guardian_approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE messages IS 'Compliance-gated coach-athlete direct messages. Defaults to blocked_compliance for safety.';

-- Communication Audit Logs (Append-Only)
CREATE TABLE communication_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status message_status NOT NULL,
  action_taken TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE communication_audit_logs IS 'Append-only regulatory audit log recording all communication attempts and compliance gating actions.';

-- NCAA messaging gate ledger (append-only, service_role insert):
-- supabase/migrations/20260817120000_compliance_audit_logs.sql (`public.compliance_audit_logs`)

-- -----------------------------------------------------------------------------
-- 4. AUTOMATED UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_profiles_updated_at
  BEFORE UPDATE ON athlete_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_media_updated_at
  BEFORE UPDATE ON athlete_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 5. AUTOMATED ATHLETE PROFILE & MEDIA CREATION TRIGGER
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically initialize profile and media records for athlete roles
  IF NEW.role IN ('hs_athlete', 'juco_athlete') THEN
    INSERT INTO athlete_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO athlete_media (athlete_id)
    VALUES (NEW.id)
    ON CONFLICT (athlete_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON FUNCTION handle_new_user() IS 'Auto-provisions athlete_profiles and athlete_media records upon creation of athlete user.';

-- -----------------------------------------------------------------------------
-- 6. PERFORMANCE INDEXES (BTREE)
-- -----------------------------------------------------------------------------

-- Foreign Key Indexes
CREATE INDEX idx_users_guardian_id ON users(guardian_id);
CREATE INDEX idx_scholarship_offers_athlete_id ON scholarship_offers(athlete_id);
CREATE INDEX idx_scholarship_offers_school_id ON scholarship_offers(school_id);
CREATE INDEX idx_athlete_media_athlete_id ON athlete_media(athlete_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_audit_logs_sender_id ON communication_audit_logs(sender_id);
CREATE INDEX idx_audit_logs_receiver_id ON communication_audit_logs(receiver_id);
CREATE INDEX idx_audit_logs_message_id ON communication_audit_logs(message_id);

-- Frequently Filtered & Searched Directory Columns
CREATE INDEX idx_athlete_profiles_grad_class ON athlete_profiles(grad_class);
CREATE INDEX idx_athlete_profiles_primary_pos ON athlete_profiles(primary_position);
CREATE INDEX idx_athlete_profiles_city_state ON athlete_profiles(city_state);
CREATE INDEX idx_athlete_profiles_star_rating ON athlete_profiles(star_rating);
CREATE INDEX idx_schools_division ON schools(division);
CREATE INDEX idx_schools_state ON schools(state);
CREATE INDEX idx_schools_conference ON schools(conference);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_compliance_rules_active_dates ON compliance_rules(is_active, start_time, end_time);

-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS across all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------
-- A. USERS POLICIES
-- ------------------------------------
CREATE POLICY "Users can view public user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------
-- B. SCHOOLS POLICIES
-- ------------------------------------
CREATE POLICY "Schools directory is viewable by authenticated users"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Compliance officers can insert/update schools"
  ON schools FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'compliance_officer'
    )
  );

-- ------------------------------------
-- C. ATHLETE PROFILES POLICIES
-- ------------------------------------
CREATE POLICY "Athlete profiles viewable by authenticated users"
  ON athlete_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes can update their own profile"
  ON athlete_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------
-- D. SCHOLARSHIP OFFERS POLICIES
-- ------------------------------------
CREATE POLICY "Scholarship offers viewable by authenticated users"
  ON scholarship_offers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes or college staff can manage scholarship offers"
  ON scholarship_offers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = athlete_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('college_coach', 'compliance_officer')
    )
  );

CREATE POLICY "Athletes or college staff can update scholarship offers"
  ON scholarship_offers FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = athlete_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('college_coach', 'compliance_officer')
    )
  );

-- ------------------------------------
-- E. ATHLETE MEDIA POLICIES
-- ------------------------------------
CREATE POLICY "Athlete media viewable by authenticated users"
  ON athlete_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Athletes can update their own media links"
  ON athlete_media FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

-- ------------------------------------
-- F. COMPLIANCE RULES POLICIES
-- ------------------------------------
CREATE POLICY "Compliance rules viewable by authenticated users"
  ON compliance_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Compliance officers can manage compliance rules"
  ON compliance_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'compliance_officer'
    )
  );

-- ------------------------------------
-- G. MESSAGES POLICIES
-- ------------------------------------
CREATE POLICY "Users can view messages they sent or received, or compliance officers"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'compliance_officer'
    )
  );

CREATE POLICY "Users can insert messages as sender"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders, receivers, or compliance officers can update messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'compliance_officer'
    )
  );

-- ------------------------------------
-- H. COMMUNICATION AUDIT LOGS POLICIES (APPEND-ONLY, SERVER-ROLE ONLY FOR INSERT)
-- ------------------------------------

-- Compliance officers can view audit logs
CREATE POLICY "Compliance officers can view communication audit logs"
  ON communication_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'compliance_officer'
    )
  );

-- Strictly lock out client-side INSERT/UPDATE/DELETE.
-- Only Supabase service_role (backend server) can insert audit records.
CREATE POLICY "Lock out client-side inserts on audit logs"
  ON communication_audit_logs FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Lock out client-side updates on audit logs"
  ON communication_audit_logs FOR UPDATE
  TO authenticated, anon
  USING (false);

CREATE POLICY "Lock out client-side deletes on audit logs"
  ON communication_audit_logs FOR DELETE
  TO authenticated, anon
  USING (false);

-- -----------------------------------------------------------------------------
-- 4. SEED DATA FOR ALL NCAA, NAIA, JUCO, AND PREP FOOTBALL TEAMS
-- -----------------------------------------------------------------------------

INSERT INTO schools (
    id, name, mascot, city, state, division, conference, primary_recruiting_email, coaching_phone, top_majors, program_highlights, logo_url
) VALUES 
-- =========================================================================
-- DIVISION 1 FBS: SEC (POWER 4)
-- =========================================================================
(
    gen_random_uuid(), 'University of Texas', 'Longhorns', 'Austin', 'TX', 'FBS_P4', 'SEC',
    'recruiting@texaslonghorns.com', '(512) 471-3050',
    ARRAY['Business', 'Kinesiology', 'Engineering', 'Communications'],
    ARRAY['Power 4 SEC Powerhouse', 'College Football Playoff contender', 'State-of-the-art DKR Texas Memorial Stadium'],
    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Georgia', 'Bulldogs', 'Athens', 'GA', 'FBS_P4', 'SEC',
    'recruiting@uga.edu', '(706) 542-1307',
    ARRAY['Sport Management', 'Finance', 'Agricultural Sciences'],
    ARRAY['2x CFP National Champions', 'Top NFL Draft producer', 'Sanford Stadium atmosphere'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Alabama', 'Crimson Tide', 'Tuscaloosa', 'AL', 'FBS_P4', 'SEC',
    'fb-recruiting@ia.ua.edu', '(205) 348-3600',
    ARRAY['Finance', 'Marketing', 'Sports Management', 'Mechanical Engineering'],
    ARRAY['18-Time National Champions', 'Dozens of First Round NFL Draft Picks', 'Mal Moore Athletic Facility'],
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Louisiana State University', 'Tigers', 'Baton Rouge', 'LA', 'FBS_P4', 'SEC',
    'footballrecruiting@lsu.edu', '(225) 578-1151',
    ARRAY['Kinesiology', 'Business Administration', 'Sports Administration'],
    ARRAY['Death Valley game days', 'WR U tradition', 'Multi-national championship heritage'],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Mississippi', 'Rebels', 'Oxford', 'MS', 'FBS_P4', 'SEC',
    'olemissrecruiting@olemiss.edu', '(662) 915-1564',
    ARRAY['Integrated Marketing', 'Finance', 'Exercise Science'],
    ARRAY['High-flying tempo offense', 'Transfer Portal powerhouse', 'The Grove tailgating tradition'],
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Tennessee', 'Volunteers', 'Knoxville', 'TN', 'FBS_P4', 'SEC',
    'volrecruiting@utk.edu', '(865) 974-1247',
    ARRAY['Sport Management', 'Supply Chain', 'Journalism'],
    ARRAY['Neyland Stadium 100k+ crowd', 'Vertical deep-shot offense', 'Top SEC NIL collective'],
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Oklahoma', 'Sooners', 'Norman', 'OK', 'FBS_P4', 'SEC',
    'soonersrecruiting@ou.edu', '(405) 325-2345',
    ARRAY['Energy Management', 'Business', 'Communication'],
    ARRAY['7-time National Champions', 'Heisman quarterback history', 'SEC trench dominance'],
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Texas A&M University', 'Aggies', 'College Station', 'TX', 'FBS_P4', 'SEC',
    'aggiefootball@athletics.tamu.edu', '(979) 845-3932',
    ARRAY['Agribusiness', 'Engineering', 'Finance'],
    ARRAY['Kyle Field 12th Man environment', 'Premier Texas recruiting hub', 'Top facilities'],
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- DIVISION 1 FBS: BIG TEN (POWER 4)
-- =========================================================================
(
    gen_random_uuid(), 'Ohio State University', 'Buckeyes', 'Columbus', 'OH', 'FBS_P4', 'Big Ten',
    'recruiting@buckeyes.osu.edu', '(614) 292-2531',
    ARRAY['Business Administration', 'Kinesiology and Exercise Science', 'Communications', 'Engineering'],
    ARRAY['8-Time National Champions', '900+ All-Time Program Wins', 'State-of-the-art Woody Hayes Athletic Center'],
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Oregon', 'Ducks', 'Eugene', 'OR', 'FBS_P4', 'Big Ten',
    'oregonrecruiting@uoregon.edu', '(541) 346-3825',
    ARRAY['Business', 'Journalism', 'Psychology', 'Human Physiology'],
    ARRAY['Innovative Nike Partnership & Facilities', 'Hatfield-Dowlin Complex', 'Multiple CFB Playoff Appearances'],
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Michigan', 'Wolverines', 'Ann Arbor', 'MI', 'FBS_P4', 'Big Ten',
    'michiganrecruiting@umich.edu', '(734) 763-4422',
    ARRAY['Ross School of Business', 'Sport Management', 'Economics'],
    ARRAY['2023 National Champions', 'The Big House 110k+ stadium', 'Physical rushing attack'],
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Pennsylvania State University', 'Nittany Lions', 'University Park', 'PA', 'FBS_P4', 'Big Ten',
    'psurecruiting@psu.edu', '(814) 865-0412',
    ARRAY['Smeal Business', 'Kinesiology', 'Engineering'],
    ARRAY['Legendary White Out games at Beaver Stadium', 'Elite NFL defensive draft producer'],
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Southern California', 'Trojans', 'Los Angeles', 'CA', 'FBS_P4', 'Big Ten',
    'uscrecruiting@usc.edu', '(213) 740-4100',
    ARRAY['Cinematic Arts', 'Marshall Business', 'Communication'],
    ARRAY['LA entertainment capital NIL hub', 'Lincoln Riley quarterback development system'],
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- DIVISION 1 FBS: ACC & BIG 12 (POWER 4)
-- =========================================================================
(
    gen_random_uuid(), 'Florida State University', 'Seminoles', 'Tallahassee', 'FL', 'FBS_P4', 'ACC',
    'fsurecruiting@fsu.edu', '(850) 644-1403',
    ARRAY['Sport Management', 'Finance', 'Criminology'],
    ARRAY['3-time National Champions', 'Florida recruiting pipeline', 'ACC power'],
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Clemson University', 'Tigers', 'Clemson', 'SC', 'FBS_P4', 'ACC',
    'clemsonrecruiting@clemson.edu', '(864) 656-4100',
    ARRAY['Parks & Recreation', 'Business', 'Industrial Engineering'],
    ARRAY['2x CFP Champions', 'Death Valley hill entrance', 'Top elite culture program'],
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Utah', 'Utes', 'Salt Lake City', 'UT', 'FBS_P4', 'Big 12',
    'utahrecruiting@utah.edu', '(801) 581-8563',
    ARRAY['Kinesiology', 'Business', 'Mining Engineering'],
    ARRAY['Kyle Whittingham physical development culture', 'Rice-Eccles Stadium fortress'],
    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Colorado', 'Buffaloes', 'Boulder', 'CO', 'FBS_P4', 'Big 12',
    'buffsrecruiting@colorado.edu', '(303) 492-6141',
    ARRAY['Leeds Business', 'Integrative Physiology', 'Media Studies'],
    ARRAY['Deion Sanders media power', 'Top national NIL spotlight', 'Scenic Boulder campus'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- DIVISION 1 FBS: GROUP OF 5 & INDEPENDENTS
-- =========================================================================
(
    gen_random_uuid(), 'University of Notre Dame', 'Fighting Irish', 'Notre Dame', 'IN', 'FBS_IND', 'Independent',
    'ndrecruiting@nd.edu', '(574) 631-6000',
    ARRAY['Mendoza College of Business', 'Pre-Med', 'Finance'],
    ARRAY['11-Time National Champions', 'Global brand & NBC national broadcast contract', 'Touchdown Jesus tradition'],
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Appalachian State University', 'Mountaineers', 'Boone', 'NC', 'FBS_G5', 'Sun Belt',
    'appstaterecruiting@appstate.edu', '(828) 262-2501',
    ARRAY['Building Science', 'Recreation Management', 'Accounting', 'Criminal Justice'],
    ARRAY['Famous 2007 Michigan Upset', 'Multiple Sun Belt Conference Titles', 'Kidd Brewer Stadium Mountain Atmosphere'],
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Boise State University', 'Broncos', 'Boise', 'ID', 'FBS_G5', 'Mountain West',
    'boisestate.recruiting@boisestate.edu', '(208) 426-1281',
    ARRAY['Kinesiology', 'Supply Chain', 'General Business'],
    ARRAY['Famous Blue Turf at Albertsons Stadium', 'Fiesta Bowl Championship pedigree', 'Premier G5 power'],
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Tulane University', 'Green Wave', 'New Orleans', 'LA', 'FBS_G5', 'AAC',
    'tulanerecruiting@tulane.edu', '(504) 865-5500',
    ARRAY['Finance', 'Public Health', 'Business Law'],
    ARRAY['Cotton Bowl Champions', 'Premier Tier-1 academic institution in G5', 'New Orleans Yulman Stadium'],
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- DIVISION 1 FCS
-- =========================================================================
(
    gen_random_uuid(), 'North Dakota State University', 'Bisons', 'Fargo', 'ND', 'FCS', 'Missouri Valley',
    'ndsu.fbrecruiting@ndsu.edu', '(701) 231-7811',
    ARRAY['Agricultural Sciences', 'Construction Management', 'Sport Management', 'Industrial Engineering'],
    ARRAY['9-Time FCS National Champions (2011-2021)', 'Hosted ESPN College GameDay Multi-times', 'Fargodome Home Field Advantage'],
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'South Dakota State University', 'Jackrabbits', 'Brookings', 'SD', 'FCS', 'Missouri Valley',
    'sdsu.recruiting@sdstate.edu', '(605) 688-5125',
    ARRAY['Agronomy', 'Mechanical Engineering', 'Pre-Physical Therapy'],
    ARRAY['Back-to-back FCS National Champions', 'Dana J. Dykhouse Stadium fortress', 'Missouri Valley power'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Montana State University', 'Bobcats', 'Bozeman', 'MT', 'FCS', 'Big Sky',
    'msu.recruiting@msubobcats.com', '(406) 994-5694',
    ARRAY['Mechanical Engineering', 'Business', 'Cell Biology and Neuroscience', 'Animal Science'],
    ARRAY['Regular FCS Playoff Contender', 'Bozeman Brawl Rivalry vs Montana', 'Bobcat Stadium Altitude Advantage'],
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Montana', 'Grizzlies', 'Missoula', 'MT', 'FCS', 'Big Sky',
    'grizrecruiting@mso.umt.edu', '(406) 243-5373',
    ARRAY['Wildlife Biology', 'Forestry', 'Business Administration'],
    ARRAY['2-Time FCS National Champions', 'Washington-Grizzly Stadium 26k+ atmosphere', 'Griz Nation culture'],
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- DIVISION II (DII)
-- =========================================================================
(
    gen_random_uuid(), 'Grand Valley State University', 'Lakers', 'Allendale', 'MI', 'D2', 'GLIAC',
    'gvsu.recruiting@gvsu.edu', '(616) 331-8800',
    ARRAY['Biomedical Sciences', 'Nursing', 'Engineering', 'Supply Chain Management'],
    ARRAY['4-Time NCAA Division II National Champions', 'Lubbers Stadium (largest capacity in Division II)', '17 GLIAC Conference Titles'],
    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Ferris State University', 'Bulldogs', 'Big Rapids', 'MI', 'D2', 'GLIAC',
    'ferrisrecruiting@ferris.edu', '(231) 591-2860',
    ARRAY['Criminal Justice', 'HVAC Engineering Technology', 'Pharmacy', 'Mechanical Engineering Technology'],
    ARRAY['Back-to-Back D2 National Champions (2021, 2022)', 'Highly Exploding Triple Option Offense', 'Top-tier D2 Strength & Conditioning Program'],
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Valdosta State University', 'Blazers', 'Valdosta', 'GA', 'D2', 'Gulf South',
    'vsuathletics@valdosta.edu', '(229) 333-5844',
    ARRAY['Organizational Leadership', 'Biology', 'Business Management', 'Exercise Physiology'],
    ARRAY['4-Time NCAA Division II National Champions', 'Title Town USA Heritage', 'Elite Recruiting Pipelines in Georgia and Florida'],
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Pittsburg State University', 'Gorillas', 'Pittsburg', 'KS', 'D2', 'MIAA',
    'pittstaterecruiting@pittstate.edu', '(620) 235-4389',
    ARRAY['Construction Engineering Technology', 'Automotive Technology', 'Accounting', 'Nursing'],
    ARRAY['Carnie Smith Stadium ("The Jungle")', '4 National Championship Titles', 'MIAA Powerhouse with massive local fanbase'],
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- DIVISION III (DIII)
-- =========================================================================
(
    gen_random_uuid(), 'University of Mount Union', 'Purple Raiders', 'Alliance', 'OH', 'D3', 'OAC',
    'mountunionrecruiting@mountunion.edu', '(330) 823-4880',
    ARRAY['Exercise Science', 'Sport Business', 'Mechanical Engineering', 'Finance'],
    ARRAY['13-Time NCAA Division III National Champions', 'Highest winning percentage in college football history', 'Stellar academic integration and post-grad career network'],
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'North Central College', 'Cardinals', 'Naperville', 'IL', 'D3', 'CCIW',
    'nccrecruiting@noctrl.edu', '(630) 637-5300',
    ARRAY['Actuarial Science', 'Computer Science', 'Entrepreneurship', 'Marketing'],
    ARRAY['2-Time NCAA Division III National Champions (2019, 2022)', 'Naperville location provides stellar internship access', 'Top-ranked high-tempo offense nationally'],
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'University of Wisconsin-Whitewater', 'Warhawks', 'Whitewater', 'WI', 'D3', 'WIAC',
    'uwwfootball@uww.edu', '(262) 472-1420',
    ARRAY['Special Education', 'Accounting', 'General Business', 'Safety Studies'],
    ARRAY['6-Time NCAA Division III National Champions', 'Famous WIAC power rivalries', 'Perpignan Perkins Stadium "The Hawk Dome"'],
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Saint John''s University', 'Johnnies', 'Collegeville', 'MN', 'D3', 'MIAC',
    'johnnyrecruiting@csbsju.edu', '(320) 363-2011',
    ARRAY['Global Business Leadership', 'Biology', 'Computer Science', 'Accounting'],
    ARRAY['Winningest program in D3 history under legendary John Gagliardi', 'Clemens Stadium natural bowl setting', 'Highly active national alumni base'],
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- NAIA
-- =========================================================================
(
    gen_random_uuid(), 'Keiser University', 'Seahawks', 'West Palm Beach', 'FL', 'NAIA', 'Sun Conference',
    'keiser.recruiting@keiseruniversity.edu', '(561) 478-5000',
    ARRAY['Sports Management', 'Business Administration', 'Nursing'],
    ARRAY['2023 NAIA National Champions', 'Florida athletic talent hub', 'Modern West Palm Beach campus facilities'],
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Northwestern College', 'Red Raiders', 'Orange City', 'IA', 'NAIA', 'GPAC',
    'nw.football@nwciowa.edu', '(712) 707-7000',
    ARRAY['Agribusiness', 'Exercise Science', 'Elementary Education'],
    ARRAY['2022 NAIA National Champions', 'GPAC power program', 'Consistent NAIA Playoff contender'],
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- JUNIOR COLLEGE (JUCO) / NJCAA
-- =========================================================================
(
    gen_random_uuid(), 'East Mississippi Community College', 'Lions', 'Scooba', 'MS', 'JUCO', 'MACCC',
    'emccrecruiting@eastms.edu', '(662) 476-5000',
    ARRAY['General Studies', 'Criminal Justice', 'Automotive Technology', 'Industrial Maintenance'],
    ARRAY['Featured on Netflix''s "Last Chance U"', '5-Time NJCAA National Champions', 'Premier pipeline to FBS Power 4 programs'],
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Hutchinson Community College', 'Blue Dragons', 'Hutchinson', 'KS', 'JUCO', 'Jayhawk',
    'hutchccrecruiting@hutchcc.edu', '(620) 665-3500',
    ARRAY['Liberal Arts', 'Business', 'Fire Science', 'Agriculture'],
    ARRAY['NJCAA National Champion (2020)', 'Elite athletic training and academic tracking', 'Highly competitive Jayhawk Conference pedigree'],
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Iowa Western Community College', 'Reivers', 'Council Bluffs', 'IA', 'JUCO', 'ICCAC',
    'iwcc.recruiting@iwcc.edu', '(712) 325-3200',
    ARRAY['Associate of Arts', 'Sports Medicine'],
    ARRAY['3-time NJCAA National Champions', 'Elite weight room and indoor training complex'],
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80'
),

-- =========================================================================
-- PREP SCHOOLS / POST-GRAD
-- =========================================================================
(
    gen_random_uuid(), 'IMG Academy', 'Ascenders', 'Bradenton', 'FL', 'PREP', 'Independent',
    'imgrecruiting@imgacademy.com', '(941) 755-1000',
    ARRAY['High School College Prep Curriculum'],
    ARRAY['World''s premier sports training destination', 'Annual roster loaded with 5-star recruit prospects', 'Unmatched national television exposure'],
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'St. Frances Academy', 'Panthers', 'Baltimore', 'MD', 'PREP', 'National Independent',
    'stfrances.football@sfa.edu', '(410) 539-5794',
    ARRAY['College Preparatory'],
    ARRAY['National schedule powerhouse facing top programs in USA', '30+ Division I FBS signees per class'],
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=120&auto=format&fit=crop&q=80'
),
(
    gen_random_uuid(), 'Mater Dei High School', 'Monarchs', 'Santa Ana', 'CA', 'PREP', 'Trinity League',
    'materdei.recruiting@materdei.org', '(714) 754-7700',
    ARRAY['Honors & AP College Prep'],
    ARRAY['Multiple Heisman Trophy alumni', 'National championship high school'],
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=120&auto=format&fit=crop&q=80'
);

-- =============================================================================
-- AUTOMATED INGESTION PIPELINE (CFBD + SIDEARM + CSV)
-- Programs/coaches must come from verified ingress — never LLM-hallucinated staff.
-- =============================================================================

CREATE TYPE program_data_source AS ENUM (
  'cfbd',
  'sidearm_scrape',
  'csv_bulk',
  'manual'
);

CREATE TYPE coach_staff_role AS ENUM (
  'Head Coach',
  'Offensive Coordinator',
  'Defensive Coordinator',
  'Position Coach',
  'Recruiting Coordinator',
  'Other'
);

CREATE TABLE program_directory (
  id TEXT PRIMARY KEY,
  cfbd_id INTEGER UNIQUE,
  institution_name TEXT NOT NULL,
  mascot TEXT,
  abbreviation TEXT,
  conference TEXT,
  classification TEXT NOT NULL CHECK (
    classification IN ('fbs', 'fcs', 'ii', 'iii', 'juco', 'prep', 'naia', 'unknown')
  ),
  city TEXT,
  state TEXT,
  stadium_capacity INTEGER,
  primary_color_hex TEXT,
  secondary_color_hex TEXT,
  athletics_base_url TEXT,
  data_source program_data_source NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_directory_classification ON program_directory (classification);
CREATE INDEX idx_program_directory_conference ON program_directory (conference);

CREATE TABLE coaching_staff (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES program_directory(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  role_category coach_staff_role NOT NULL DEFAULT 'Other',
  -- Nullable by design: never invent contacts when Sidearm omits them
  email TEXT,
  phone TEXT,
  twitter_handle TEXT,
  staff_page_url TEXT NOT NULL,
  source program_data_source NOT NULL CHECK (source IN ('sidearm_scrape', 'csv_bulk', 'manual')),
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (program_id, full_name, title)
);

CREATE INDEX idx_coaching_staff_program ON coaching_staff (program_id);
CREATE INDEX idx_coaching_staff_email ON coaching_staff (email) WHERE email IS NOT NULL;
CREATE INDEX idx_coaching_staff_active ON coaching_staff (is_active);

COMMENT ON TABLE program_directory IS 'CFBD-synced NCAA programs + CSV-imported JUCO/Prep — source of truth for SchoolsDirectory.';
COMMENT ON TABLE coaching_staff IS 'Verified coach contacts from Sidearm scrape or CSV. Maps to TypeScript DatabaseCoach (coachId=id, schoolId=program_id).';
COMMENT ON COLUMN coaching_staff.email IS 'Must be extracted from published athletics pages or verified CSV — never LLM-generated. Nullable when unpublished.';
COMMENT ON COLUMN coaching_staff.twitter_handle IS 'Optional public handle; null until verified from staff page or CSV.';

-- Application-facing coach directory (legacy TEXT ids). Prefer schema.production.sql
-- college_coaches (UUID + schools.school_id FK) for new Supabase deployments.
CREATE TABLE college_coaches (
  coach_id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES program_directory(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT,
  office_phone TEXT,
  twitter_handle TEXT,
  source_url TEXT,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_college_coaches_school ON college_coaches (school_id);
CREATE INDEX idx_college_coaches_email ON college_coaches (email) WHERE email IS NOT NULL;

COMMENT ON TABLE college_coaches IS 'Legacy ingest mirror. Production deployments should use schema.production.sql.';

-- RallySafe third-party NIL Go ledger (fail-closed clearinghouse). Apply:
-- supabase/migrations/20260814120000_nil_transactions.sql
-- supabase/migrations/20260818110000_csc_nil_go_monotonic_sync.sql
-- CapGM institutional revenue-share must never be written to public.nil_transactions.
-- COPPA minor contact lock: supabase/migrations/20260816120000_parental_consents.sql
-- Transfer portal ticker: supabase/migrations/20260816140000_transfer_portal_entries.sql

