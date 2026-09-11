/**
 * Stamp Supabase Auth app_metadata for coach JWT RBAC.
 * Uses service role only — never run from the Vite SPA.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/ops/stampCoachClaims.ts \
 *       --email coach@school.edu --school-id cfbd-251 --role HEAD_COACH_GM
 *
 * Or batch JSON file:
 *   npx tsx scripts/ops/stampCoachClaims.ts --file scripts/ops/coach-claims.example.json
 *
 * Claims written (app_metadata only — user_metadata is not authoritative):
 *   school_id, gateway_role
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ALLOWED_ROLES = new Set([
  "HEAD_COACH_GM",
  "POSITION_COACH",
  "COMPLIANCE_OFFICER",
  "ATHLETE_RECRUIT",
]);

interface ClaimStamp {
  email: string;
  schoolId: string;
  role: string;
}

function parseArgs(argv: string[]): {
  stamps: ClaimStamp[];
  dryRun: boolean;
} {
  const dryRun = argv.includes("--dry-run");
  const fileIdx = argv.indexOf("--file");
  if (fileIdx >= 0) {
    const path = resolve(argv[fileIdx + 1] ?? "");
    const raw = JSON.parse(readFileSync(path, "utf8")) as ClaimStamp[];
    if (!Array.isArray(raw)) throw new Error("--file must be a JSON array");
    return { stamps: raw.map(normalizeStamp), dryRun };
  }

  const email = flag(argv, "--email");
  const schoolId = flag(argv, "--school-id");
  const role = flag(argv, "--role");
  if (!email || !schoolId || !role) {
    throw new Error(
      "Provide --email --school-id --role, or --file path/to/claims.json",
    );
  }
  return { stamps: [normalizeStamp({ email, schoolId, role })], dryRun };
}

function flag(argv: string[], name: string): string | null {
  const i = argv.indexOf(name);
  if (i < 0) return null;
  return argv[i + 1] ?? null;
}

function normalizeStamp(input: ClaimStamp): ClaimStamp {
  const email = input.email.trim().toLowerCase();
  const schoolId = input.schoolId.trim();
  const role = input.role.trim().toUpperCase();
  if (!email.includes("@")) throw new Error(`Invalid email: ${input.email}`);
  if (!schoolId) throw new Error("schoolId required");
  if (!ALLOWED_ROLES.has(role)) {
    throw new Error(`role must be one of ${[...ALLOWED_ROLES].join(", ")}`);
  }
  return { email, schoolId, role };
}

type AuthUserRow = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
};

/** Paginate GoTrue listUsers until email match or pages exhausted (perPage max 200). */
async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<AuthUserRow | null> {
  const perPage = 200;
  let page = 1;
  for (;;) {
    const { data: listed, error: listErr } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (listErr || !listed?.users) {
      throw new Error(listErr?.message ?? "listUsers empty response");
    }
    const user = listed.users.find(
      (u: AuthUserRow) => (u.email ?? "").toLowerCase() === email,
    );
    if (user) return user;
    if (listed.users.length < perPage) return null;
    page += 1;
  }
}

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    process.exit(1);
  }

  const { stamps, dryRun } = parseArgs(process.argv.slice(2));
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let failures = 0;
  for (const stamp of stamps) {
    let user: AuthUserRow | null;
    try {
      user = await findAuthUserByEmail(admin, stamp.email);
    } catch (err) {
      console.error(
        `[FAIL] listUsers: ${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }
    if (!user) {
      console.error(`[FAIL] no auth user for ${stamp.email}`);
      failures += 1;
      continue;
    }

    const nextAppMeta = {
      ...(user.app_metadata ?? {}),
      school_id: stamp.schoolId,
      gateway_role: stamp.role,
    };

    console.log(
      `${dryRun ? "[DRY] " : ""}stamp ${stamp.email} → school_id=${stamp.schoolId} gateway_role=${stamp.role}`,
    );
    if (dryRun) continue;

    const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: nextAppMeta,
    });
    if (updErr) {
      console.error(`[FAIL] ${stamp.email}: ${updErr.message}`);
      failures += 1;
      continue;
    }
    console.log(`[OK] ${stamp.email}`);
  }

  if (failures > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
