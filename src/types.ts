export type Position = 
  | "QB" | "RB" | "WR" | "TE" 
  | "OT" | "OG" | "C" 
  | "DE" | "DT" | "EDGE" | "LB" 
  | "CB" | "S" | "ATH" 
  | "K" | "P" | "LS";

export type GradYear = 2025 | 2026 | 2027 | 2028 | 2029;

export type UserRole = "Athlete" | "Coach" | "Fan" | "HEAD_COACH_GM" | "POSITION_COACH" | "COMPLIANCE_OFFICER" | "ATHLETE_RECRUIT";

export type CollegeDivision = "FBS" | "FCS" | "DII" | "DIII" | "NAIA" | "JUCO" | "PREP";

export type DivisionTier = 'FBS_POWER_4' | 'FBS_GROUP_OF_5' | 'FCS' | 'D2' | 'D3' | 'JUCO' | 'PREP' | 'FBS_P4' | 'FBS_G5' | 'FBS_IND';

export interface SchoolEntry {
  id: string;
  name: string;
  mascot?: string;
  city: string;
  state: string;
  division: DivisionTier;
  conference: string;
  primaryRecruitingEmail?: string;
  coachingPhone?: string;
  topMajors?: string[];
  programHighlights?: string[];
}

export interface CollegeProgram {
  id: string;
  institutionName: string;
  mascot: string;
  abbreviation: string;
  tier: DivisionTier;
  conference: string;
  location: {
    city: string;
    state: string;
  };
  brandColors: {
    primary: string; // Hex code matching visual architecture rules
    secondary: string;
  };
  stadiumCapacity?: number;
}

export interface CollegeOffer {
  id: string;
  schoolName: string;
  division: CollegeDivision;
  conference: string;
  offerDate: string;
  status: "Offered" | "Committed" | "Warm Interest" | "Official Visit Scheduled";
  schoolColor?: string;
  logoUrl?: string;
}

export interface AthleteProfile {
  // 1. Basic & Contact Info (1-4)
  fullName: string;
  highSchool: string;
  cityState: string;
  gradClass: GradYear;
  primaryEmail: string;
  primaryPhone: string;
  parentName: string;
  parentEmailPhone: string;

  // 2. Physical & Athletic Metrics (5-9)
  primaryPosition: Position;
  secondaryPosition?: Position;
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  handSizeInches: number;
  armLengthInches: number;

  // 3. Verified Performance Stats (10-14)
  fortyTime: number; // e.g. 4.52
  fortyTimingType: "Laser" | "Hand-timed";
  shuttleTime: number; // e.g. 4.18
  verticalJump: number; // e.g. 34.5
  benchPress: number; // e.g. 275
  squatMax: number; // e.g. 405

  // 4. Academic Credentials (15-18)
  gpa: number; // Cumulative Unweighted GPA, e.g. 3.85
  weightedGpa: number; // e.g. 4.20
  coreGpa: number; // Core NCAA GPA, e.g. 3.75
  satScore?: number; // e.g. 1280
  actScore?: number; // e.g. 28
  intendedMajor: string;

  // 5. Game & Film Media (19-21)
  hudlUrl: string;
  youtubeFilmUrl?: string;
  twitterHandle: string;
  instagramHandle?: string;
  facebookHandle?: string;

  // 6. On-Field Performance & Honors (22-25)
  seasonStats: string; // e.g. "3,420 Passing Yds, 38 TDs, 6 INTs, 480 Rushing Yds"
  honors: string; // e.g. "1st Team All-State, District MVP, 2x Team Captain"
  isTeamCaptain: boolean;
  varsityStarterYears: number;

  // 7. Recruiting & Preferences (26-30)
  ncaaEligibilityId: string;
  offers: CollegeOffer[];
  topTargetSchools: string[]; // e.g. ["Georgia", "Alabama", "Texas", "Ohio State", "Oregon"]
  preferredEnvironment: "Urban" | "Suburban" | "College Town" | "Any";
  preferredCampusSize: "Large (15,000+)" | "Medium (5,000-15,000)" | "Small (<5,000)";
  commitmentStatus: "Uncommitted" | "Committed" | "Decommitted";
  committedSchool?: string;
  starRating?: number; // 3, 4, 5
  videoIntroUrl?: string;
  videoIntroBio?: {
    whoIAm?: string;
    whereFrom?: string;
    strengths?: string;
    weaknesses?: string;
    whyRecruitMe?: string;
  };
}

export interface TopRecruit {
  rank: number;
  id: string;
  fullName: string;
  position: Position;
  highSchool: string;
  state: string;
  gradClass: GradYear;
  height: string;
  weight: number;
  fortyTime: number;
  gpa: number;
  starRating: 3 | 4 | 5;
  compositeScore: number; // e.g., 0.9985
  committedTo?: string; // e.g., "Georgia"
  commitmentStatus: "Committed" | "Uncommitted" | "Decommitted";
  crystalBall: { school: string; percentage: number; color: string }[];
  topOffers: string[];
  hudlUrl: string;
  avatarUrl: string;
  verifiedCoachViews: number;
}

export interface CampEntry {
  id: string;
  name: string;
  host: string;
  division: CollegeDivision | "Independent Showcase";
  campType: "Mega Camp" | "Position Skills" | "Combine / Showcase" | "Specialist K/P Camp";
  city: string;
  state: string;
  zipCode: string;
  date: string;
  time: string;
  cost: number;
  registerUrl: string;
  description: string;
  features: string[];
  rating: number;
  totalReviews: number;
  isBookmarked?: boolean;
}

export interface CoachView {
  id: string;
  coachName: string;
  coachTitle: string;
  schoolName: string;
  division: CollegeDivision;
  schoolLogo: string;
  action: "Viewed Profile" | "Watched Hudl Highlight Reel" | "Downloaded Verified Stats" | "Sent Direct Message";
  timestamp: string;
  isVerifiedCoach: boolean;
}

export interface NcaaCourse {
  id: string;
  category: "English" | "Math" | "Natural Science" | "Social Science" | "Extra English/Math/Sci" | "Additional Core";
  courseName: string;
  grade: "A" | "B" | "C" | "D" | "F" | "In Progress";
  credits: number; // 1.0 or 0.5
  isRequired: boolean;
}

export interface SocialPost {
  id: string;
  platform: "Twitter" | "Instagram" | "Facebook";
  authorName: string;
  handle: string;
  avatarUrl: string;
  timestamp: string;
  content: string;
  likes: number;
  retweets: number;
  verified: boolean;
  mediaUrl?: string;
  videoUrl?: string;
  highlightTitle?: string;
}

export interface CoachEndorsement {
  id: string;
  coachName: string;
  coachTitle: string;
  schoolName: string;
  division: CollegeDivision;
  avatarUrl: string;
  badge: "Head Coach" | "Position Coach" | "Recruiting Coordinator" | "Scout Evaluator" | "High School Head Coach";
  relationship: string;
  text: string;
  date: string;
  scoreBonus: number; // e.g., +15 Composite Points on Top 250
  verified: boolean;
}

export interface WeeklyHighlight {
  id: string;
  rank: number;
  athleteName: string;
  position: Position;
  highSchool: string;
  state: string;
  gradClass: GradYear;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  votes: number;
  userHasVoted?: boolean;
  category: "Touchdown / Big Play" | "Defensive Hit / Pick 6" | "Ankle Breaker Juke" | "O-Line Pancake" | "Special Teams Clutch";
  submittedDate: string;
}

export interface CollegeCoachProfile {
  id: string;
  fullName: string;
  title: string;
  school: string;
  division: CollegeDivision;
  conference: string;
  avatarUrl: string;
  bio: string;
  recruitingTerritory: string[];
  targetPositions: Position[];
  email: string;
  phone: string;
  twitterHandle: string;
  verifiedBadge: boolean;
  officeAddress: string;
  yearsExperience: number;
  activeEndorsementsCount: number;
}

export type PortalStatus = "ACTIVE" | "WITHDRAWN" | "MATRICULATED";
export type TransferType = "UNDERGRADUATE" | "GRADUATE";

export interface TransferPortalAthlete {
  id: string;
  athleteId: string;
  athleteName: string;
  position: string;
  starRating: number;
  transferType: TransferType;
  eligibilityRemaining: number;
  originSchool: {
    id: string;
    name: string;
    primaryColor: string;
  };
  destinationSchool: {
    id: string;
    name: string;
    primaryColor: string;
  } | null;
  entryDate: string;
  status: PortalStatus;
}

export interface CoachPipelineProspect {
  id: string;
  athleteName: string;
  position: Position;
  highSchoolOrSchool: string;
  state: string;
  gradClass: number;
  stage: "Identified" | "Contacted" | "Offered" | "Committed";
  rating: number; // 1-5
  notes: string;
  lastActivity: string;
  avatarUrl: string;
}

/** Kanban stages for `RecruitingPipeline` (coach workspace). */
export type RecruitingPipelineStage =
  | "Evaluating"
  | "Offered"
  | "Official Visit"
  | "Committed";

/** Offer row enriched with athlete facts for the recruiting Kanban board. */
export interface PipelineOffer {
  id: string;
  schoolId: string;
  athleteId: string;
  isOfficial: boolean;
  offerDate: string;
  commitmentStatus: string;
  stage: RecruitingPipelineStage;
  athleteName: string;
  position: string;
  starRating: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: "Offer" | "Camp" | "Ranking" | "CoachView" | "Endorsement" | "Media";
  title: string;
  description: string;
  badgeText: string;
  schoolLogo?: string;
}

// ============================================================================
// PHASE 1 NEXT-GEN RECRUITING & GM TYPES ($20.5M CAP, COGNITION, TRUESPEED)
// ============================================================================

export interface CapPositionBudget {
  category: "QB" | "Skill (WR/RB/TE)" | "Trench (OL/DL/LB)" | "Secondary (CB/S)" | "Specialists";
  allocatedAmount: number;
  targetPercentage: number;
  activePlayerCount: number;
  avgCostPerPlayer: number;
}

export interface RosterPlayerCapItem {
  id: string;
  athleteName: string;
  position: Position;
  yearClass: "FR" | "SO" | "JR" | "SR" | "GR";
  nilCapValue: number;
  spWinImpactScore: number;
  epaPerPlayContribution: number;
  retentionRiskLevel: "Low Risk" | "Moderate Risk" | "High Flight Risk";
  retentionRiskFactors: string[];
  isPortalTarget?: boolean;
}

export interface CapGMRosterModel {
  schoolId: string;
  schoolName: string;
  totalSalaryCap: number; // $20,500,000
  totalAllocated: number;
  remainingCapSpace: number;
  projectedTeamWins: number;
  spNationalRank: number;
  budgets: CapPositionBudget[];
  players: RosterPlayerCapItem[];
}

/** House v. NCAA revenue-share cap in integer cents ($20.5M = 2_050_000_000). */
export const CAP_GM_HARD_CAP_CENTS = 2_050_000_000;

export type RetentionRiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface CapGmPlayer {
  id: string;
  name: string;
  position: string;
  starRating: number;
  marketValueCents: number;
  allocatedCents: number;
  baseEpa: number;
  isRetained: boolean;
  notes: string;
}

export interface CapGmState {
  totalCapCents: number;
  allocatedCents: number;
  remainingCents: number;
  projectedEpa: number;
  globalRetentionRisk: RetentionRiskLevel;
}

export interface CognitiveProfile {
  id: string;
  athleteName: string;
  overallScore: number; // 0-100
  perceptionSpeedMs: number;
  trackingEfficiencyScore: number;
  decisionSpeedUnderPressureMs: number;
  tacticalSchemeMatches: {
    schemeName: string;
    matchPercentage: number;
    suitabilityNotes: string;
  }[];
  scoutEvaluationSummary: string;
}

export interface TrueSpeedAnalysis {
  id: string;
  athleteName: string;
  videoTitle: string;
  status: "Verified Authentic" | "Framerate Anomaly Detected" | "Unverified Tape";
  detectedFps: number;
  estimatedMaxMph: number;
  yardLineCalibrationRatio: number;
  framerateManipulationFound: boolean;
  trueSpeedConfidenceScore: number;
}

/** MediaPipe PoseLandmarker kinematic output mapped to Supabase TrueSpeed rows. */
export type TrueSpeedVerificationStatus =
  | "UNVERIFIED"
  | "PROCESSING"
  | "AUTHENTICATED"
  | "REJECTED";

export interface TrueSpeedTelemetry {
  athleteId: string;
  verifiedFortyTime: number | null;
  peakVelocityMph: number | null;
  averageStrideLengthInches: number | null;
  confidenceScore: number;
  verificationStatus: TrueSpeedVerificationStatus;
  analyzedAt: string | null;
}

export interface BioScanTelemetry {
  id: string;
  athleteName: string;
  inGameMaxSprintMph: number;
  accelerationRateMs2: number;
  decelerationRateMs2: number;
  playerLoadScore: number;
  recoveryScorePercentage: number;
  hardwareProvider: "Catapult Vector" | "WHOOP 4.0" | "Garmin Pro";
  lastSyncTimestamp: string;
}

export interface NilEscrowCampaign {
  id: string;
  campaignTitle: string;
  sponsorName: string;
  athleteName: string;
  athleteId: string;
  /** Integer cents — never float dollars. */
  escrowTotalAmountCents: number;
  disbursedAmountCents: number;
  heldInEscrowAmountCents: number;
  milestones: NilEscrowMilestone[];
  complianceAuditStatus: "SEC / Compliance Clear" | "Under Review";
    clearinghouseStatus: ClearinghouseStatus;
    stripeMilestoneVerified: boolean;
    athleteInTransferPortal: boolean;
    /** THIRD_PARTY_NIL_GO is RallySafe. INSTITUTIONAL_CAPS is CapGM only. */
    regulatoryPlane: NilRegulatoryPlane;
    payoutReleased: boolean;
    vbpNotes: string | null;
}

export type ClearinghouseStatus =
  | "PENDING"
  | "CLEARED"
  | "NOT_CLEARED"
  | "FLAGGED_FOR_REVIEW";

/** Row contract for `public.nil_transactions` (fail-closed CHECK on payout_released). */
export interface NilTransaction {
  id: string;
  athleteId: string;
  sponsorName: string;
  dealAmountCents: number;
  clearinghouseStatus: ClearinghouseStatus;
  payoutReleased: boolean;
  vbpNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NilRegulatoryPlane = "THIRD_PARTY_NIL_GO" | "INSTITUTIONAL_CAPS";

export interface NilEscrowMilestone {
  id: string;
  description: string;
  payoutAmountCents: number;
  status: "Verified & Paid" | "Pending Fulfillment" | "Refunded on Transfer";
  stripeMilestoneVerified: boolean;
}

export interface RallySafeReleaseSnapshot {
  clearinghouseStatus: ClearinghouseStatus;
  stripeMilestoneVerified: boolean;
  athleteInTransferPortal: boolean;
  regulatoryPlane: NilRegulatoryPlane;
  payoutReleased?: boolean;
}

/** Closed market set for the 2026 NIL estimator (House v. NCAA revenue-share tiers). */
export type NilMarketDivision =
  | "FBS_P4"
  | "FBS_G5"
  | "FCS"
  | "D2"
  | "D3"
  | "NAIA"
  | "JUCO"
  | "PREP";

export type NilPositionGroup = "QB" | "SKILL" | "DEFENSE" | "LINEMAN" | "SPECIAL";

export type NilStarRating = 1 | 2 | 3 | 4 | 5;

/** Integer-cents breakdown from `estimateNilValuationCents`. */
export interface NilValuationCents {
  athleticCents: number;
  socialCents: number;
  totalCents: number;
}

export interface NilValuationInput {
  division: NilMarketDivision;
  position: NilPositionGroup;
  stars: NilStarRating;
  followers: number;
  /** Engagement percent in tenths (45 = 4.5%). */
  engagementTenths: number;
}

// PHASE 3: AI HUDL FILM TAGGING ENGINE INTERFACES
export interface FilmTagItem {
  id: string;
  playNumber: number;
  quarter: number;
  downAndDistance: string;
  playType: "Zone Read" | "Play Action Pass" | "Press Coverage" | "Tackle for Loss" | "Scramble Drill";
  coverageShell: "Cover 1 Single High" | "Cover 2 Man" | "Cover 3 Match" | "Cover 4 Quarters";
  routeRun: "Post-Corner" | "Dig / In" | "Go / Fly" | "Slant" | "Out Stem";
  resultYardage: number;
  videoTimestamp: string;
  confidenceScore: number;
}

export interface FilmBreakdownSession {
  sessionId: string;
  athleteName: string;
  reelTitle: string;
  totalPlaysTagged: number;
  coveragesDetected: string[];
  routesDetected: string[];
  tags: FilmTagItem[];
}

// PHASE 3: MULTI-TENANT RBAC PERMISSIONS INTERFACES

export interface RolePermissionConfig {
  role: UserRole;
  roleTitle: string;
  canAccessCapGM: boolean;
  canAccessFilmStudio: boolean;
  canAccessEscrow: boolean;
  canSendMessages: boolean;
  positionGroupFilter?: string;
  dashboardBadgeText: string;
}

export interface MultiTenantUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  school: string;
  avatarUrl: string;
  permissions: RolePermissionConfig;
}

// PHASE 4: AUTONOMOUS SCOUTING, LASER COMBINE & PARENT PORTAL INTERFACES

export interface SchemeFitScoutAlert {
  alertId: string;
  athleteId: string;
  athleteName: string;
  confidenceScore: number; 
  matchedScheme: 'Air Raid' | 'Spread Option' | 'West Coast' | '3-4 Blitz' | 'Cover 3 Match';
  keyMetrics: {
    trueSpeedMph: number;
    cognitionScore: number;
    laserShuttle?: number;
  };
  timestamp: string;
}

export interface VerifiedLaserCombineEntry {
  eventId: string;
  athleteId: string;
  combineLocation: string;
  date: string;
  laser40YardDash: number;
  laser20YardShuttle: number;
  laser3ConeDrill: number;
  verticalJumpInches: number;
  broadJumpInches: number;
  verifiedBy: string;
}

export type MinorSafetyStatus = "PENDING_CONSENT" | "CONSENT_GRANTED" | "CONSENT_DENIED";

export type GuardianRelationship = "MOTHER" | "FATHER" | "LEGAL_GUARDIAN";

export interface ParentConsentRecord {
  consentId: string;
  athleteId: string;
  guardianName: string;
  guardianEmail: string;
  relationship: GuardianRelationship;
  coppaConsent: boolean;
  messagingConsent: boolean;
  biometricConsent: boolean;
  digitalSignature: string;
  safetyStatus: MinorSafetyStatus;
  milestoneDisclosuresAgreed: boolean;
  coppaFerpaWaived: boolean;
  signatureTimestamp: string;
  escrowCampaignId?: string;
}

// ============================================================================
// AUTOMATED PROGRAM / COACH INGESTION PIPELINE (CFBD + SIDEARM + CSV)
// Never invent coach emails or staff lists — only persist verified ingress.
// ============================================================================

export type ProgramDataSource = "cfbd" | "sidearm_scrape" | "csv_bulk" | "manual";

export type CoachStaffRoleCategory =
  | "Head Coach"
  | "Offensive Coordinator"
  | "Defensive Coordinator"
  | "Position Coach"
  | "Recruiting Coordinator"
  | "Other";

/** Canonical program row synced from CFBD `/teams` or JUCO/Prep CSV bulk import. */
export interface CanonicalProgramRecord {
  id: string;
  cfbdId: number | null;
  institutionName: string;
  mascot: string | null;
  abbreviation: string | null;
  conference: string | null;
  classification: "fbs" | "fcs" | "ii" | "iii" | "juco" | "prep" | "naia" | "unknown";
  city: string | null;
  state: string | null;
  stadiumCapacity: number | null;
  primaryColorHex: string | null;
  secondaryColorHex: string | null;
  athleticsBaseUrl: string | null;
  dataSource: ProgramDataSource;
  lastSyncedAt: string;
}

/** Staff contact extracted from Sidearm `/staff.aspx` / `/coaches.aspx` or CSV — email/phone may be null. */
export interface CanonicalCoachStaffRecord {
  id: string;
  programId: string;
  fullName: string;
  title: string;
  roleCategory: CoachStaffRoleCategory;
  email: string | null;
  phone: string | null;
  twitterHandle?: string | null;
  staffPageUrl: string;
  source: Exclude<ProgramDataSource, "cfbd">;
  lastVerifiedAt: string;
  isActive: boolean;
}

export interface IngestionRunSummary {
  runId: string;
  startedAt: string;
  finishedAt: string;
  programsUpserted: number;
  coachesUpserted: number;
  coachesMissingEmail: number;
  errors: string[];
}

/**
 * Relational coach row for CoachesDirectory / messaging (Postgres `college_coaches`).
 * `schoolId` maps to `schools.school_id` in schema.production.sql (typically `cfbd-{id}`).
 * `email` is nullable — never invent unpublished athletics contacts.
 */
export interface DatabaseCoach {
  coachId: string;
  schoolId: string;
  fullName: string;
  title: string;
  email: string | null;
  officePhone: string | null;
  twitterHandle: string | null;
  sourceUrl: string | null;
  lastVerifiedAt: string;
}

/** Production schools row — schema.production.sql */
export type DivisionTierEnum =
  | "FBS_POWER_4"
  | "FBS_GROUP_OF_5"
  | "FCS"
  | "D2"
  | "D3"
  | "NAIA"
  | "JUCO"
  | "PREP";

export interface DatabaseSchool {
  schoolId: string;
  institutionName: string;
  mascot: string | null;
  abbreviation: string | null;
  tier: DivisionTierEnum;
  conference: string | null;
  city: string | null;
  state: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  stadiumCapacity: number | null;
  lastSyncedAt: string;
}

/** Lean athlete facts for Autonomous Scouting Agent / Leaderboard indexes */
export interface DatabaseAthleteProfile {
  athleteId: string;
  firstName: string;
  lastName: string;
  gradYear: number;
  primaryPosition: string;
  state: string | null;
  starRating: number;
  trueSpeedMph: number | null;
  cognitionScore: number | null;
}

/**
 * Full athlete dossier — joins `athlete_profiles` + `users` + `athlete_media` +
 * `scholarship_offers`→`schools` (MVP relational model in schema.sql).
 */
export interface AthleteFullProfile {
  id: string;
  first_name: string;
  last_name: string;
  height_inches: number | null;
  weight_lbs: number | null;
  forty_yard_dash: number | null;
  vertical_jump_inches: number | null;
  position_tier: string | null;
  star_rating: number | null;
  media: {
    twitter_handle: string | null;
    instagram_handle: string | null;
    hudl_link: string | null;
    youtube_link: string | null;
  } | null;
  offers: {
    id: string;
    is_official: boolean;
    offer_date: string;
    commitment_status: string;
    school: {
      id: string;
      name: string;
      primary_color: string | null;
      abbreviation: string | null;
    } | null;
  }[];
}

/** Map Sidearm/CSV ingress → relational `DatabaseCoach` contract. */
export function toDatabaseCoach(staff: CanonicalCoachStaffRecord): DatabaseCoach {
  return {
    coachId: staff.id,
    schoolId: staff.programId,
    fullName: staff.fullName,
    title: staff.title,
    email: staff.email,
    officePhone: staff.phone,
    twitterHandle: staff.twitterHandle ?? null,
    sourceUrl: staff.staffPageUrl,
    lastVerifiedAt: staff.lastVerifiedAt,
  };
}

const POWER4_CONFERENCES = ["SEC", "Big Ten", "Big 12", "ACC"] as const;

/** Power 4 vs Group of 5 from CFBD conference name (FBS only). */
export function mapFbsConferenceToTier(
  conference: string | null | undefined
): Extract<DivisionTierEnum, "FBS_POWER_4" | "FBS_GROUP_OF_5"> {
  if (conference && (POWER4_CONFERENCES as readonly string[]).includes(conference)) {
    return "FBS_POWER_4";
  }
  return "FBS_GROUP_OF_5";
}

export function classificationToDivisionTier(
  classification: CanonicalProgramRecord["classification"],
  conference?: string | null
): DivisionTierEnum {
  switch (classification) {
    case "fbs":
      return mapFbsConferenceToTier(conference);
    case "fcs":
      return "FCS";
    case "ii":
      return "D2";
    case "iii":
      return "D3";
    case "naia":
      return "NAIA";
    case "juco":
      return "JUCO";
    case "prep":
      return "PREP";
    default:
      return "FCS";
  }
}

/** Map CFBD/CSV program ingress → production `schools` row. */
export function toDatabaseSchool(program: CanonicalProgramRecord): DatabaseSchool {
  return {
    schoolId: program.id,
    institutionName: program.institutionName,
    mascot: program.mascot,
    abbreviation: program.abbreviation,
    tier: classificationToDivisionTier(program.classification, program.conference),
    conference: program.conference,
    city: program.city,
    state: program.state,
    primaryColor: program.primaryColorHex,
    secondaryColor: program.secondaryColorHex,
    stadiumCapacity: program.stadiumCapacity,
    lastSyncedAt: program.lastSyncedAt,
  };
}

export type RecruitingPeriodType = "dead" | "quiet" | "contact" | "evaluation";
export type NcaaRecruitingPeriod = "CONTACT" | "EVALUATION" | "QUIET" | "DEAD";

export type ComplianceGateDecision = "ALLOWED" | "BLOCKED" | "FLAGGED_FOR_REVIEW";
export type ClearanceStatus =
  | "CLEARED"
  | "BLOCKED_CALENDAR"
  | "BLOCKED_MINOR_CONSENT"
  | "BLOCKED_INDUCEMENT";

export interface ComplianceGateContext {
  coachId: string;
  recruitId: string;
  recruitAge: number;
  hasParentalConsent: boolean;
  contactMethod: "direct_message" | "email" | "phone_call" | "in_person";
  messagePayload?: string;
  evaluationDate?: string;
}

export interface ComplianceEvaluation {
  isCleared: boolean;
  status: ClearanceStatus;
  flaggedKeywords: string[];
  reason: string;
}

export interface ComplianceAuditLog {
  id: string;
  schoolId: string;
  coachId: string;
  athleteId: string;
  actionType: "DIRECT_MESSAGE" | "OFFER_EXTENSION" | "CAMP_INVITE";
  clearanceStatus: ClearanceStatus;
  notes: string;
  createdAt: string;
}

export interface NcaaClearanceRequest {
  schoolId: string;
  coachId: string;
  athleteId: string;
  recruitAge: number;
  hasParentalConsent: boolean;
  period: NcaaRecruitingPeriod;
  actionType: ComplianceAuditLog["actionType"];
  contactMethod: "electronic" | "written" | "call" | "in_person";
  messagePayload: string;
}


