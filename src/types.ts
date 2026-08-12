export type Position = 
  | "QB" | "RB" | "WR" | "TE" 
  | "OT" | "OG" | "C" 
  | "DE" | "DT" | "EDGE" | "LB" 
  | "CB" | "S" | "ATH" 
  | "K" | "P" | "LS";

export type GradYear = 2025 | 2026 | 2027 | 2028 | 2029;

export type UserRole = "Athlete" | "Coach" | "Fan" | "HEAD_COACH_GM" | "POSITION_COACH" | "COMPLIANCE_OFFICER" | "ATHLETE_RECRUIT";

export type CollegeDivision = "FBS" | "FCS" | "DII" | "DIII" | "NAIA" | "JUCO" | "PREP";

export type DivisionTier = 'FBS_POWER_4' | 'FBS_GROUP_OF_5' | 'FCS' | 'D2' | 'D3' | 'JUCO' | 'PREP' | 'FBS_P4' | 'FBS_G5';

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

export interface TransferPortalAthlete {
  id: string;
  fullName: string;
  position: Position;
  formerSchool: string;
  formerDivision: CollegeDivision;
  conference: string;
  yearsEligibilityRemaining: number;
  portalEntryDate: string;
  status: "Active in Portal" | "Committed / Transferred" | "Withdrawn";
  destinationSchool?: string;
  height: string;
  weight: number;
  fortyTime: number;
  gpa: number;
  avatarUrl: string;
  statsHighlights: string;
  hudlUrl: string;
  verifiedStats: boolean;
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
  escrowTotalAmount: number;
  disbursedAmount: number;
  heldInEscrowAmount: number;
  milestones: {
    id: string;
    description: string;
    payoutAmount: number;
    status: "Verified & Paid" | "Pending Fulfillment" | "Refunded on Transfer";
  }[];
  complianceAuditStatus: "SEC / Compliance Clear" | "Under Review";
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



