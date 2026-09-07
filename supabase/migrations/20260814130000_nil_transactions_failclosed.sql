-- =============================================================================
-- Gridiron Gateway — Fail-Closed PostgreSQL Financial Compliance Migration
-- Enforces hard DB-level check constraint: payout_released requires CLEARED status
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE public.clearinghouse_status_enum AS ENUM (
        'PENDING',
        'FLAGGED_FOR_REVIEW',
        'CLEARED',
        'NOT_CLEARED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Generate the Transactions Table (if not existing)
CREATE TABLE IF NOT EXISTS public.nil_transactions (
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
    
    -- THE FAIL-CLOSED CONSTRAINT: The database physically rejects any update 
    -- attempting to release funds if the deal is not cleared.
    CONSTRAINT enforce_cleared_payout CHECK (
        (payout_released = FALSE) OR (clearinghouse_status = 'CLEARED')
    )
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.nil_transactions ENABLE ROW LEVEL SECURITY;

-- Auto-Updating Timestamp Trigger
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

-- RLS Policy: Athletes can strictly read ONLY their own transactions
DROP POLICY IF EXISTS "Athletes can view own nil transactions" ON public.nil_transactions;
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

-- RLS Policy: Only authenticated compliance officers or secure edge functions can manipulate escrow state
DROP POLICY IF EXISTS "Strict Compliance & Service Role Escrow Management" ON public.nil_transactions;
CREATE POLICY "Strict Compliance & Service Role Escrow Management" 
    ON public.nil_transactions 
    FOR ALL 
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR 
        auth.uid() IN (
            SELECT user_id FROM public.school_staff_roles WHERE role_tier = 'COMPLIANCE_OFFICER'
        )
    );
