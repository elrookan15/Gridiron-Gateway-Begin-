/**
 * JWT → Gateway staff permissions.
 * Claims: app_metadata.gateway_role | user_metadata.gateway_role
 *         app_metadata.school_id | user_metadata.school_id
 */
import type { User } from "@supabase/supabase-js";
import type { MultiTenantUser, UserRole } from "../types";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import { resolveCoachSchoolIdFromUser } from "./coachSession";

export type GatewayStaffRole = Extract<
  UserRole,
  "HEAD_COACH_GM" | "POSITION_COACH" | "COMPLIANCE_OFFICER" | "ATHLETE_RECRUIT"
>;

export interface StaffSessionContext {
  userId: string;
  schoolId: string | null;
  role: GatewayStaffRole;
  user: MultiTenantUser;
}

const ROLE_PERMISSIONS: Record<
  GatewayStaffRole,
  MultiTenantUser["permissions"]
> = {
  HEAD_COACH_GM: {
    role: "HEAD_COACH_GM",
    roleTitle: "Head Coach / Roster GM",
    canAccessCapGM: true,
    canAccessFilmStudio: true,
    canAccessEscrow: true,
    canSendMessages: true,
    dashboardBadgeText: "JWT: Full Front-Office & CapGM Authority",
  },
  POSITION_COACH: {
    role: "POSITION_COACH",
    roleTitle: "Position Coach",
    canAccessCapGM: false,
    canAccessFilmStudio: true,
    canAccessEscrow: false,
    canSendMessages: true,
    dashboardBadgeText: "JWT: Position View — CapGM locked",
  },
  COMPLIANCE_OFFICER: {
    role: "COMPLIANCE_OFFICER",
    roleTitle: "Compliance Officer",
    canAccessCapGM: false,
    canAccessFilmStudio: false,
    canAccessEscrow: true,
    canSendMessages: false,
    dashboardBadgeText: "JWT: Fail-Closed Compliance Gatekeeper",
  },
  ATHLETE_RECRUIT: {
    role: "ATHLETE_RECRUIT",
    roleTitle: "Athlete Recruit",
    canAccessCapGM: false,
    canAccessFilmStudio: false,
    canAccessEscrow: false,
    canSendMessages: true,
    dashboardBadgeText: "JWT: Athlete dossier access",
  },
};

const ALLOWED_ROLES = new Set<string>([
  "HEAD_COACH_GM",
  "POSITION_COACH",
  "COMPLIANCE_OFFICER",
  "ATHLETE_RECRUIT",
]);

export function parseGatewayStaffRole(raw: unknown): GatewayStaffRole | null {
  if (typeof raw !== "string") return null;
  const normalized = raw.trim().toUpperCase();
  if (ALLOWED_ROLES.has(normalized)) return normalized as GatewayStaffRole;
  // Common aliases
  if (normalized === "HEAD_COACH" || normalized === "GM") return "HEAD_COACH_GM";
  if (normalized === "COMPLIANCE") return "COMPLIANCE_OFFICER";
  if (normalized === "ATHLETE" || normalized === "RECRUIT") return "ATHLETE_RECRUIT";
  if (normalized === "POSITION" || normalized === "ASSISTANT") return "POSITION_COACH";
  return null;
}

export function permissionsForGatewayRole(role: GatewayStaffRole) {
  return ROLE_PERMISSIONS[role];
}

export function staffContextFromUser(user: User): StaffSessionContext | null {
  const role =
    parseGatewayStaffRole(user.app_metadata?.gateway_role) ??
    parseGatewayStaffRole(user.user_metadata?.gateway_role) ??
    parseGatewayStaffRole(user.app_metadata?.role_tier) ??
    parseGatewayStaffRole(user.user_metadata?.role_tier);

  if (!role) return null;

  const schoolId = resolveCoachSchoolIdFromUser(user);
  const email = user.email ?? "staff@gateway.local";
  const name =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    email;

  const permissions = permissionsForGatewayRole(role);
  const multiUser: MultiTenantUser = {
    id: user.id,
    name,
    role,
    title: permissions.roleTitle,
    school: schoolId ?? "School not bound on JWT",
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f172a&textColor=a3e635`,
    permissions,
  };

  return { userId: user.id, schoolId, role, user: multiUser };
}

export async function resolveStaffSessionContext(): Promise<StaffSessionContext | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) return null;
  return staffContextFromUser(data.session.user);
}
