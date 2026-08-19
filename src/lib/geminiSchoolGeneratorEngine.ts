import type { SchoolEntry } from "../data/schoolsData";
import type { CollegeDivision } from "../types";

export interface GenerateSchoolPromptPayload {
  schoolQuery: string;
  divisionHint?: CollegeDivision;
}

export function validateSchoolEntry(entry: Partial<SchoolEntry>): { isValid: boolean; error?: string; school?: SchoolEntry } {
  if (!entry.name || !entry.name.trim()) {
    return { isValid: false, error: "School name is required." };
  }
  if (!entry.mascot || !entry.mascot.trim()) {
    return { isValid: false, error: "Mascot is required." };
  }
  const validDivisions: CollegeDivision[] = ["FBS", "FCS", "DII", "DIII", "NAIA", "JUCO", "PREP"];
  if (!entry.division || !validDivisions.includes(entry.division)) {
    return { isValid: false, error: "Valid college division (FBS, FCS, DII, DIII, NAIA, JUCO, PREP) is required." };
  }
  if (!entry.conference || !entry.conference.trim()) {
    return { isValid: false, error: "Conference name is required." };
  }
  if (!entry.cityState || !entry.cityState.trim()) {
    return { isValid: false, error: "City and state location is required." };
  }

  const divisionLabelMap: Record<CollegeDivision, string> = {
    FBS: "Division 1 FBS",
    FCS: "Division 1-AA / FCS",
    DII: "Division 2 (DII)",
    DIII: "Division 3 (DIII)",
    NAIA: "NAIA",
    JUCO: "JUCO / NJCAA",
    PREP: "Prep / Post-Grad",
  };

  const idSlug = entry.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const validatedSchool: SchoolEntry = {
    id: entry.id || `ai-${idSlug}-${Date.now().toString(36)}`,
    name: entry.name.trim(),
    mascot: entry.mascot.trim(),
    division: entry.division,
    divisionLabel: entry.divisionLabel || divisionLabelMap[entry.division],
    conference: entry.conference.trim(),
    cityState: entry.cityState.trim(),
    primaryColor: entry.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(entry.primaryColor) ? entry.primaryColor : "#0f172a",
    secondaryColor: entry.secondaryColor && /^#[0-9A-Fa-f]{6}$/.test(entry.secondaryColor) ? entry.secondaryColor : "#1e293b",
    logoUrl: entry.logoUrl || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80",
    recruitingEmail: entry.recruitingEmail || `recruiting@${idSlug}.edu`,
    recruitingPhone: entry.recruitingPhone || "(555) 019-2026",
    totalActiveRecruits: typeof entry.totalActiveRecruits === "number" ? entry.totalActiveRecruits : 12,
    topMajors: Array.isArray(entry.topMajors) && entry.topMajors.length > 0 ? entry.topMajors : ["Sports Management", "Business", "Kinesiology"],
    programHighlights: typeof entry.programHighlights === "string" ? entry.programHighlights : "Generated via Gemini AI Recruiting Intelligence.",
    isFeatured: Boolean(entry.isFeatured),
  };

  return { isValid: true, school: validatedSchool };
}
