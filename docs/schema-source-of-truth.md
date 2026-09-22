# Schema source of truth

| Artifact | Role |
|---|---|
| `schema.production.sql` | **Canonical** production directory: `schools(school_id VARCHAR)`, `college_coaches`, scouting `athlete_profiles(athlete_id)`. |
| `supabase/migrations/` | **Canonical** live apply path (RLS, cutover, NIL, COPPA, telemetry). |
| `schema.sql` | Composite historical dump for app tables (users, dossier `athlete_profiles(user_id)`, messages, ingest mirrors). Production `schools` / `college_coaches` appear once at the top; legacy MVP UUID directory is **`schools_mvp_archive` only**. |

## Do not

- Reintroduce a second `CREATE TABLE schools` with UUID `id`.
- Reintroduce a second `CREATE TABLE college_coaches` with TEXT ids.
- LLM-invent coach emails — leave `email` NULL → UI **Contact not verified**.

## Fresh apply (recommended)

1. Apply `supabase/migrations/` in order on Supabase, **or**
2. Apply `schema.production.sql` then the non-directory sections of `schema.sql` carefully.

Regression gate: `npm run test:schema-sql`.
