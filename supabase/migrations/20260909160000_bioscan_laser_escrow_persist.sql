-- BioScan telemetry + Combine Laser entries + RallySafe Express escrow campaigns.
-- Service-role writes from Express; authenticated/anon have no write path.
-- Integer cents only on escrow money columns.

CREATE TABLE IF NOT EXISTS public.bioscan_telemetry (
  athlete_external_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  max_velocity_mph NUMERIC(8, 3) NOT NULL DEFAULT 0,
  acceleration_rate NUMERIC(8, 3) NOT NULL DEFAULT 0,
  player_load_total NUMERIC(12, 3) NOT NULL DEFAULT 0,
  heart_rate_bpm INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bioscan_processed_at ON public.bioscan_telemetry (processed_at DESC);

CREATE TABLE IF NOT EXISTS public.combine_laser_entries (
  id TEXT PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  combine_event_name TEXT NOT NULL,
  laser_forty_time NUMERIC(8, 3) NOT NULL CHECK (laser_forty_time > 0),
  laser_shuttle_time NUMERIC(8, 3) NOT NULL DEFAULT 0,
  laser_three_cone_time NUMERIC(8, 3) NOT NULL DEFAULT 0,
  vertical_jump_inches NUMERIC(8, 3) NOT NULL DEFAULT 0,
  broad_jump_inches NUMERIC(8, 3) NOT NULL DEFAULT 0,
  badge TEXT NOT NULL DEFAULT 'Laser Verified',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_laser_recorded_at ON public.combine_laser_entries (recorded_at DESC);

CREATE TABLE IF NOT EXISTS public.rallysafe_escrow_campaigns (
  campaign_id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  amount_usd_cents INTEGER NOT NULL CHECK (amount_usd_cents >= 0),
  amount_usd_formatted TEXT NOT NULL,
  milestone_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  stripe_client_secret TEXT,
  escrow_status TEXT NOT NULL,
  title TEXT,
  sponsor TEXT,
  athlete TEXT,
  disbursed_cents INTEGER NOT NULL DEFAULT 0 CHECK (disbursed_cents >= 0),
  held_cents INTEGER NOT NULL DEFAULT 0 CHECK (held_cents >= 0),
  compliance_status TEXT,
  clearinghouse_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (clearinghouse_status IN ('PENDING', 'CLEARED', 'NOT_CLEARED', 'FLAGGED_FOR_REVIEW')),
  stripe_milestone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  athlete_in_transfer_portal BOOLEAN NOT NULL DEFAULT FALSE,
  regulatory_plane TEXT NOT NULL DEFAULT 'THIRD_PARTY_NIL_GO'
    CHECK (regulatory_plane IN ('THIRD_PARTY_NIL_GO', 'INSTITUTIONAL_CAPS')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rallysafe_escrow_release_failclosed CHECK (
    escrow_status <> 'RELEASED'
    OR (
      clearinghouse_status = 'CLEARED'
      AND stripe_milestone_verified = TRUE
      AND athlete_in_transfer_portal = FALSE
      AND regulatory_plane = 'THIRD_PARTY_NIL_GO'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_rallysafe_escrow_athlete ON public.rallysafe_escrow_campaigns (athlete_id);
CREATE INDEX IF NOT EXISTS idx_rallysafe_escrow_status ON public.rallysafe_escrow_campaigns (clearinghouse_status);

ALTER TABLE public.bioscan_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combine_laser_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rallysafe_escrow_campaigns ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: Express service-role is the only writer/reader for these ops tables.
-- SPA RallySafe ledger continues to use public.nil_transactions (separate fail-closed ledger).

COMMENT ON TABLE public.bioscan_telemetry IS 'Catapult/WHOOP BioScan webhook snapshots keyed by athlete_external_id.';
COMMENT ON TABLE public.combine_laser_entries IS 'Laser combine webhook ingest — verified timing only.';
COMMENT ON TABLE public.rallysafe_escrow_campaigns IS 'Express RallySafe campaign store (integer cents). Distinct from nil_transactions athlete ledger.';
COMMENT ON COLUMN public.rallysafe_escrow_campaigns.amount_usd_cents IS 'Integer cents — never float dollars.';
