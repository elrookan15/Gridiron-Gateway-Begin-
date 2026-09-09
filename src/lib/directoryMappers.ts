/**
 * Directory adapters: production `DatabaseSchool` / `DatabaseCoach` → SPA card models.
 * Contacts stay null unless Sidearm/CSV verified — never invent athletics emails.
 */
import type {
  CollegeCoachProfile,
  CollegeDivision,
  DatabaseCoach,
  DatabaseSchool,
  DivisionTierEnum,
} from "../types";

/** UI card for SchoolsDirectory — same field surface as legacy schoolsData.SchoolEntry. */
export interface DirectorySchoolCard {
  id: string;
  name: string;
  mascot: string;
  division: CollegeDivision;
  divisionLabel: string;
  conference: string;
  cityState: string;
  primaryColor: string;
  secondaryColor?: string;
  logoUrl: string;
  recruitingEmail: string | null;
  recruitingPhone: string | null;
  totalActiveRecruits: number;
  topMajors: string[];
  programHighlights: string;
  isFeatured: boolean;
}

/** Gateway Command Center directory row (legacy SchoolRecord shape). */
export type GatewayDivisionTier = "FBS_P4" | "FBS_G5" | "FCS" | "D2" | "D3" | "JUCO";

export interface GatewaySchoolCard {
  id: string;
  name: string;
  mascot: string;
  city: string;
  state: string;
  divisionTier: GatewayDivisionTier;
  conference: string;
  primaryRecruitingEmail: string | null;
  coachingPhone: string | null;
  topMajors: string[];
  programHighlights: string[];
  logoUrl: string;
  headCoach: string;
}

export interface DirectoryCoachJoined extends DatabaseCoach {
  institutionName: string;
  conference: string | null;
  tier: DivisionTierEnum;
  city: string | null;
  state: string | null;
}

const TIER_TO_COLLEGE_DIVISION: Record<DivisionTierEnum, CollegeDivision> = {
  FBS_POWER_4: "FBS",
  FBS_GROUP_OF_5: "FBS",
  FCS: "FCS",
  D2: "DII",
  D3: "DIII",
  NAIA: "NAIA",
  JUCO: "JUCO",
  PREP: "PREP",
};

const TIER_TO_LABEL: Record<DivisionTierEnum, string> = {
  FBS_POWER_4: "Division 1 FBS (Power 4)",
  FBS_GROUP_OF_5: "Division 1 FBS (Group of 5)",
  FCS: "Division 1-AA (FCS)",
  D2: "Division 2 (DII)",
  D3: "Division 3 (DIII)",
  NAIA: "NAIA",
  JUCO: "JUCO (NJCAA)",
  PREP: "PREP / Post-Grad",
};

const TIER_TO_GATEWAY: Record<DivisionTierEnum, GatewayDivisionTier> = {
  FBS_POWER_4: "FBS_P4",
  FBS_GROUP_OF_5: "FBS_G5",
  FCS: "FCS",
  D2: "D2",
  D3: "D3",
  NAIA: "D3",
  JUCO: "JUCO",
  PREP: "JUCO",
};

export function tierToCollegeDivision(tier: DivisionTierEnum): CollegeDivision {
  return TIER_TO_COLLEGE_DIVISION[tier];
}

export function matchesCollegeDivisionFilter(
  tier: DivisionTierEnum,
  filter: string,
): boolean {
  if (filter === "All") return true;
  return tierToCollegeDivision(tier) === filter;
}

function logoForSchool(schoolId: string, institutionName: string): string {
  const seed = encodeURIComponent(institutionName || schoolId);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=0f172a&textColor=a3e635`;
}

function avatarForCoach(coachId: string, fullName: string): string {
  const seed = encodeURIComponent(fullName || coachId);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=0f172a&textColor=38bdf8`;
}

export function mapDatabaseSchoolToDirectoryCard(
  school: DatabaseSchool,
): DirectorySchoolCard {
  const city = school.city?.trim() || "—";
  const state = school.state?.trim() || "—";
  const cityState = city === "—" && state === "—" ? "Location not verified" : `${city}, ${state}`;

  return {
    id: school.schoolId,
    name: school.institutionName,
    mascot: school.mascot?.trim() || "—",
    division: tierToCollegeDivision(school.tier),
    divisionLabel: TIER_TO_LABEL[school.tier],
    conference: school.conference?.trim() || "Independent",
    cityState,
    primaryColor: school.primaryColor?.trim() || "#0f172a",
    secondaryColor: school.secondaryColor?.trim() || undefined,
    logoUrl: logoForSchool(school.schoolId, school.institutionName),
    // Production `schools` has no recruiting contact columns — never invent.
    recruitingEmail: null,
    recruitingPhone: null,
    totalActiveRecruits: 0,
    topMajors: [],
    programHighlights:
      school.lastSyncedAt
        ? `Live directory row · last synced ${school.lastSyncedAt}`
        : "Live directory row from Supabase production schools.",
    isFeatured:
      school.tier === "FBS_POWER_4" || school.tier === "FBS_GROUP_OF_5",
  };
}

export function mapDatabaseSchoolToGatewayCard(
  school: DatabaseSchool,
  headCoachName?: string | null,
): GatewaySchoolCard {
  return {
    id: school.schoolId,
    name: school.institutionName,
    mascot: school.mascot?.trim() || "—",
    city: school.city?.trim() || "—",
    state: school.state?.trim() || "—",
    divisionTier: TIER_TO_GATEWAY[school.tier],
    conference: school.conference?.trim() || "Independent",
    primaryRecruitingEmail: null,
    coachingPhone: null,
    topMajors: [],
    programHighlights: [
      `Tier: ${school.tier}`,
      school.stadiumCapacity
        ? `Stadium capacity: ${school.stadiumCapacity}`
        : "Stadium capacity not verified",
    ],
    logoUrl: logoForSchool(school.schoolId, school.institutionName),
    headCoach: headCoachName?.trim() || "Contact not verified",
  };
}

export function mapDirectoryCoachToProfile(
  coach: DirectoryCoachJoined,
): CollegeCoachProfile {
  return {
    id: coach.coachId,
    fullName: coach.fullName,
    title: coach.title,
    school: coach.institutionName,
    division: tierToCollegeDivision(coach.tier),
    conference: coach.conference?.trim() || "Independent",
    avatarUrl: avatarForCoach(coach.coachId, coach.fullName),
    bio: "Verified staff row from production college_coaches. Extended bio not stored on the lean directory schema.",
    recruitingTerritory:
      coach.state?.trim() ? [coach.state.trim()] : [],
    targetPositions: [],
    email: coach.email,
    phone: coach.officePhone,
    twitterHandle: coach.twitterHandle?.replace(/^@/, "") || "",
    verifiedBadge: Boolean(coach.sourceUrl || coach.email || coach.lastVerifiedAt),
    officeAddress:
      coach.city && coach.state
        ? `${coach.city}, ${coach.state}`
        : "Office address not verified",
    yearsExperience: 0,
    activeEndorsementsCount: 0,
  };
}
