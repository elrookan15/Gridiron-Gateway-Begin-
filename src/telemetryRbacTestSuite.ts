/**
 * Telemetry / escrow persist + staff RBAC unit gates (no live Supabase required).
 */
import assert from "node:assert/strict";
import type { User } from "@supabase/supabase-js";
import { isServiceRoleConfigured } from "./lib/supabaseAdmin";
import {
  persistBioscanTelemetry,
  persistLaserCombineEntry,
} from "./lib/telemetryPersist";
import { persistEscrowCampaign } from "./lib/escrowPersist";
import {
  parseGatewayStaffRole,
  permissionsForGatewayRole,
  staffContextFromUser,
} from "./lib/staffRbac";

let failures = 0;

async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

async function main(): Promise<void> {
  await check("RBAC: HEAD_COACH_GM unlocks CapGM + escrow", () => {
    const perms = permissionsForGatewayRole("HEAD_COACH_GM");
    assert.equal(perms.canAccessCapGM, true);
    assert.equal(perms.canAccessEscrow, true);
    assert.equal(perms.canAccessFilmStudio, true);
  });

  await check("RBAC: POSITION_COACH locks CapGM + escrow", () => {
    const perms = permissionsForGatewayRole("POSITION_COACH");
    assert.equal(perms.canAccessCapGM, false);
    assert.equal(perms.canAccessEscrow, false);
    assert.equal(perms.canAccessFilmStudio, true);
  });

  await check("RBAC: parse aliases", () => {
    assert.equal(parseGatewayStaffRole("GM"), "HEAD_COACH_GM");
    assert.equal(parseGatewayStaffRole("compliance"), "COMPLIANCE_OFFICER");
    assert.equal(parseGatewayStaffRole("nope"), null);
  });

  await check("RBAC: staffContextFromUser reads JWT claims", () => {
    const user = {
      id: "user-1",
      email: "coach@example.com",
      app_metadata: { gateway_role: "HEAD_COACH_GM", school_id: "cfbd-251" },
      user_metadata: { full_name: "Coach Test" },
    } as unknown as User;
    const ctx = staffContextFromUser(user);
    assert.ok(ctx);
    assert.equal(ctx?.role, "HEAD_COACH_GM");
    assert.equal(ctx?.schoolId, "cfbd-251");
    assert.equal(ctx?.user.permissions.canAccessCapGM, true);
  });

  await check("telemetry persist fails closed without service role", async () => {
    if (isServiceRoleConfigured()) return;
    const bio = await persistBioscanTelemetry({
      session_id: "s1",
      athlete_external_id: "ath_1",
      timestamp: new Date().toISOString(),
      max_velocity_mph: 21,
      acceleration_rate: 4,
      player_load_total: 100,
      heart_rate_bpm: 160,
      processed_at: new Date().toISOString(),
    });
    assert.equal(bio.ok, false);
    const laser = await persistLaserCombineEntry({
      id: "las_1",
      athleteName: "Test",
      combineEventName: "Event",
      laserFortyTime: 4.5,
      laserShuttleTime: 4.2,
      laserThreeConeTime: 7.1,
      verticalJumpInches: 30,
      broadJumpInches: 100,
      badge: "Laser Verified",
      timestamp: new Date().toISOString(),
    });
    assert.equal(laser.ok, false);
  });

  await check("escrow persist fails closed without service role", async () => {
    if (isServiceRoleConfigured()) return;
    const result = await persistEscrowCampaign({
      campaignId: "cmp_test",
      sponsorId: "spn",
      athleteId: "ath",
      amountUsdCents: 1000,
      amountUsdFormatted: "$10.00",
      milestoneConditions: [],
      stripeClientSecret: "pi_x",
      escrowStatus: "FUNDED",
      created_at: new Date().toISOString(),
      clearinghouseStatus: "PENDING",
      stripeMilestoneVerified: false,
      athleteInTransferPortal: false,
      regulatoryPlane: "THIRD_PARTY_NIL_GO",
    });
    assert.equal(result.ok, false);
  });

  if (failures > 0) {
    console.error(`\nTelemetry/RBAC suite: ${failures} failure(s)`);
    process.exit(1);
  }
  console.log("\nTelemetry/RBAC suite: all checks passed");
}

void main();
