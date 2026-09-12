# Live Supabase ops (Gridiron Gateway)

Project: **Gridiron Gateway** (`ujdgjaaioyfbvylzexts`)  
URL: `https://ujdgjaaioyfbvylzexts.supabase.co`

## SPA / Express env

Copy from `.env.example`. Never put `SUPABASE_SERVICE_ROLE_KEY` in Vite.

| Var | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | SPA | Project URL |
| `VITE_SUPABASE_ANON_KEY` | SPA | Anon or publishable key (RLS) |
| `SUPABASE_URL` | Express | Same project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Express / ops scripts | Ingest + persist only |

## Directory cutover (applied)

1. MVP UUID `schools` → `schools_mvp_archive` (then dropped — see dossier cleanup).
2. Production `schools` (`school_id`, `institution_name`, `tier` / `division_tier_enum`).
3. `college_coaches.school_id` → VARCHAR FK to production schools; PK column `coach_id`.
4. Public SELECT RLS on `schools` + `college_coaches` (writes = service role).
5. `bioscan_telemetry`, `combine_laser_entries`, `rallysafe_escrow_campaigns`.

Repo mirrors: `supabase/migrations/20260909150000_production_schools_directory_cutover.sql`,  
`20260909155000_college_coaches_coach_id_align.sql`,  
`20260909160000_bioscan_laser_escrow_persist.sql`,  
`20260909140000_directory_public_read_rls.sql`.

## Dossier archive cleanup (applied)

1. `scholarship_offers.school_id` UUID → `VARCHAR(100)` FK → `schools(school_id)`.
2. Added `scholarship_offers.notes` for pipeline stage tags.
3. Dropped `schools_mvp_archive` (no remaining FKs; offers were empty).

Repo mirror: `supabase/migrations/20260911120000_dossier_offers_production_schools.sql`.

SPA dossier embeds: `schools(school_id, institution_name, primary_color, abbreviation)`  
→ UI aliases `id` / `name` via `mapProductionOfferSchool`.

## JWT RBAC (app_metadata only)

SPA reads **`app_metadata.school_id`** and **`app_metadata.gateway_role`** only.  
`user_metadata` is user-editable — not an authorization source.

Stamp claims (service role):

```bash
SUPABASE_URL=https://ujdgjaaioyfbvylzexts.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=... \
  npx tsx scripts/ops/stampCoachClaims.ts --file scripts/ops/coach-claims.example.json
```

Roles: `HEAD_COACH_GM` | `POSITION_COACH` | `COMPLIANCE_OFFICER` | `ATHLETE_RECRUIT`.

After stamping, users must **refresh session** (sign out/in) so JWT picks up new `app_metadata`.

## Seeded directory smoke

Anon REST should return rows for:

- `GET /rest/v1/schools?select=school_id,institution_name,tier`
- `GET /rest/v1/college_coaches?select=coach_id,full_name,school_id,email`

Null `email` → UI shows **Contact not verified** (do not invent addresses).

## Residual debt

- Athlete dossier still uses MVP `athlete_profiles.user_id` + `users` (lean `athlete_id` cutover pending).
- RallySafe SPA `nil_transactions` vs Express `rallysafe_escrow_campaigns`.
- Full CFBD / Sidearm ingest beyond seed rows (`npm run ingest:cfbd` with service role).
