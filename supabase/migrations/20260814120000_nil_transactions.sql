-- =============================================================================
-- Gridiron Gateway — fail-closed NIL Go ledger (institutional baseline)
-- Prerequisites are idempotent so the EXACT table/CHECK/RLS block can apply
-- against this repo's athlete_profiles (user_id PK) and staff table.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.school_staff_roles (
    user_id UUID NOT NULL,
    school_id TEXT NOT NULL,
    role_tier TEXT NOT NULL,
    PRIMARY KEY (user_id, school_id)
);

ALTER TABLE public.school_staff_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regclass('public.athlete_profiles') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'athlete_profiles'
         AND column_name = 'id'
     )
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'athlete_profiles'
         AND column_name = 'user_id'
     ) THEN
    ALTER TABLE public.athlete_profiles ADD COLUMN id UUID;
    UPDATE public.athlete_profiles SET id = user_id WHERE id IS NULL;
    ALTER TABLE public.athlete_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
    CREATE UNIQUE INDEX IF NOT EXISTS athlete_profiles_id_uidx ON public.athlete_profiles (id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_nil_tx_protect_clearinghouse ON public.nil_transactions;
DROP TABLE IF EXISTS public.nil_transactions CASCADE;
DROP TYPE IF EXISTS public.clearinghouse_status CASCADE;
DROP TYPE IF EXISTS public.clearinghouse_status_enum CASCADE;

-- 1. Create the Strict Clearinghouse Enum
CREATE TYPE public.clearinghouse_status_enum AS ENUM (
    'PENDING',
    'FLAGGED_FOR_REVIEW',
    'CLEARED',
    'NOT_CLEARED'
);

-- 2. Generate the Transactions Table
CREATE TABLE public.nil_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
    sponsor_name TEXT NOT NULL,
    -- Financials strictly stored in integer-cents to prevent IEEE 754 precision loss
    deal_amount_cents INTEGER NOT NULL CHECK (deal_amount_cents >= 0),
    clearinghouse_status public.clearinghouse_status_enum DEFAULT 'PENDING' NOT NULL,
    payout_released BOOLEAN DEFAULT FALSE NOT NULL,
    vbp_notes TEXT, -- Audit trail for Valid Business Purpose (VBP) / Range of Compensation (RoC)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- 3. THE FAIL-CLOSED CONSTRAINT: The database physically rejects any update
    -- attempting to release funds if the deal is not cleared.
    CONSTRAINT enforce_cleared_payout CHECK (
        (payout_released = FALSE) OR (clearinghouse_status = 'CLEARED')
    )
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.nil_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Auto-Updating Timestamp Trigger
CREATE OR REPLACE FUNCTION update_nil_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_nil_transactions_modtime ON public.nil_transactions;
CREATE TRIGGER update_nil_transactions_modtime
    BEFORE UPDATE ON public.nil_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_nil_modified_column();

-- 6. RLS Policy: Athletes can strictly read ONLY their own transactions
CREATE POLICY "Athletes can view own nil transactions"
    ON public.nil_transactions
    FOR SELECT
    USING (
        auth.uid() = (
            SELECT user_id
            FROM public.athlete_profiles
            WHERE id = nil_transactions.athlete_id
        )
    );

-- 7. RLS Policy: Only authenticated compliance officers or secure edge functions can manipulate escrow state
CREATE POLICY "Strict Compliance & Service Role Escrow Management"
    ON public.nil_transactions
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        auth.uid() IN (
            SELECT user_id FROM public.school_staff_roles WHERE role_tier = 'COMPLIANCE_OFFICER'
        )
    );
