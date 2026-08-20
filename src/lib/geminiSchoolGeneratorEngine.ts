import type { SchoolEntry } from "../data/schoolsData";
import type { CollegeDivision } from "../types";

export interface GenerateSchoolPromptPayload {
  schoolQuery: string;
  divisionHint?: CollegeDivision;
}

/** Product-mandated copy when Sidearm/CSV has not verified a staff contact. */
export const UNVERIFIED_CONTACT_LABEL = "Contact not verified";

const VALID_DIVISIONS: readonly CollegeDivision[] = [
  "FBS",
  "FCS",
  "DII",
  "DIII",
  "NAIA",
  "JUCO",
  "PREP",
];

const DIVISION_ALIASES: Record<string, CollegeDivision> = {
  FBS: "FBS",
  FCS: "FCS",
  D2: "DII",
  DII: "DII",
  DIVISION2: "DII",
  D3: "DIII",
  DIII: "DIII",
  DIVISION3: "DIII",
  NAIA: "NAIA",
  JUCO: "JUCO",
  NJCAA: "JUCO",
  PREP: "PREP",
};

const DIVISION_LABEL_MAP: Record<CollegeDivision, string> = {
  FBS: "Division 1 FBS",
  FCS: "Division 1-AA / FCS",
  DII: "Division 2 (DII)",
  DIII: "Division 3 (DIII)",
  NAIA: "NAIA",
  JUCO: "JUCO / NJCAA",
  PREP: "Prep / Post-Grad",
};

/**
 * Gemini / schema drift emits D2/D3; CollegeDivision (`src/types.ts`) is DII/DIII.
 */
export function normalizeCollegeDivision(raw: unknown): CollegeDivision | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return DIVISION_ALIASES[key] ?? null;
}

export function hasVerifiedRecruitingEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === UNVERIFIED_CONTACT_LABEL) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function hasVerifiedRecruitingPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed === UNVERIFIED_CONTACT_LABEL) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && !digits.startsWith("555");
}

/** Gemini JSON is untrusted; division may be D2/D3 before normalization. */
export type SchoolEntryDraft = Omit<Partial<SchoolEntry>, "division"> & { division?: string };

export function validateSchoolEntry(entry: SchoolEntryDraft): {
  isValid: boolean;
  error?: string;
  school?: SchoolEntry;
} {
  if (!entry.name || !entry.name.trim()) {
    return { isValid: false, error: "School name is required." };
  }
  if (!entry.mascot || !entry.mascot.trim()) {
    return { isValid: false, error: "Mascot is required." };
  }

  const division = normalizeCollegeDivision(entry.division);
  if (!division || !VALID_DIVISIONS.includes(division)) {
    return {
      isValid: false,
      error: "Valid college division (FBS, FCS, DII, DIII, NAIA, JUCO, PREP) is required.",
    };
  }
  if (!entry.conference || !entry.conference.trim()) {
    return { isValid: false, error: "Conference name is required." };
  }
  if (!entry.cityState || !entry.cityState.trim()) {
    return { isValid: false, error: "City and state location is required." };
  }

  const idSlug = entry.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // LLM-filled emails/phones are forbidden. Contacts come from Sidearm or verified CSV only.
  const validatedSchool: SchoolEntry = {
    id: entry.id || `ai-${idSlug}-${Date.now().toString(36)}`,
    name: entry.name.trim(),
    mascot: entry.mascot.trim(),
    division,
    divisionLabel: entry.divisionLabel || DIVISION_LABEL_MAP[division],
    conference: entry.conference.trim(),
    cityState: entry.cityState.trim(),
    primaryColor: entry.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(entry.primaryColor) ? entry.primaryColor : "#0f172a",
    secondaryColor: entry.secondaryColor && /^#[0-9A-Fa-f]{6}$/.test(entry.secondaryColor) ? entry.secondaryColor : "#1e293b",
    logoUrl: entry.logoUrl || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80",
    recruitingEmail: UNVERIFIED_CONTACT_LABEL,
    recruitingPhone: UNVERIFIED_CONTACT_LABEL,
    totalActiveRecruits: typeof entry.totalActiveRecruits === "number" ? entry.totalActiveRecruits : 12,
    topMajors: Array.isArray(entry.topMajors) && entry.topMajors.length > 0 ? entry.topMajors : ["Sports Management", "Business", "Kinesiology"],
    programHighlights: typeof entry.programHighlights === "string" ? entry.programHighlights : "Generated via Gemini AI Recruiting Intelligence.",
    isFeatured: Boolean(entry.isFeatured),
  };

  return { isValid: true, school: validatedSchool };
}
