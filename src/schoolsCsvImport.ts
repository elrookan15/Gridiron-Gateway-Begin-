/**
 * JUCO / Prep CSV parser used by admin API + SchoolsCsvImporter UI.
 * Required columns: schoolName, tier, headCoachName, coachEmail (email may be empty → null).
 */
import type { CanonicalProgramRecord, DatabaseCoach } from "./types";
import { slugify, writeJsonArtifact } from "./ingestionUtils";

export interface SchoolsCsvImportRow {
  schoolName: string;
  tier: string;
  city?: string;
  state?: string;
  conference?: string;
  mascot?: string;
  headCoachName: string;
  coachEmail: string;
  coachPhone?: string;
  coachTitle?: string;
}

export interface SchoolsCsvImportResult {
  importedAt: string;
  programsUpserted: number;
  coachesUpserted: number;
  duplicatesSkipped: number;
  errors: string[];
  programs: CanonicalProgramRecord[];
  coaches: DatabaseCoach[];
  artifactPath: string;
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell.trim());
      if (row.some((v) => v.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some((v) => v.length > 0)) rows.push(row);
  }
  return rows;
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = (value || "").trim();
  return trimmed.length ? trimmed : null;
}

function normalizeTier(raw: string): CanonicalProgramRecord["classification"] {
  const t = raw.trim().toLowerCase();
  if (t === "juco" || t === "njcaa" || t === "cccaa") return "juco";
  if (t === "prep" || t === "post-grad" || t === "postgrad") return "prep";
  if (t === "naia") return "naia";
  if (t === "fbs") return "fbs";
  if (t === "fcs") return "fcs";
  if (t === "dii" || t === "ii") return "ii";
  if (t === "diii" || t === "iii") return "iii";
  return "juco";
}

export function parseSchoolsCsv(csvText: string): SchoolsCsvImportResult {
  const rows = parseCsv(csvText);
  const errors: string[] = [];
  if (rows.length < 2) {
    return {
      importedAt: new Date().toISOString(),
      programsUpserted: 0,
      coachesUpserted: 0,
      duplicatesSkipped: 0,
      errors: ["CSV must include a header row and at least one data row."],
      programs: [],
      coaches: [],
      artifactPath: "",
    };
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);

  // Accept both plan headers and earlier template headers
  const schoolNameIdx = idx("schoolname") >= 0 ? idx("schoolname") : idx("institution_name");
  const tierIdx = idx("tier") >= 0 ? idx("tier") : idx("classification");
  const coachNameIdx = idx("headcoachname") >= 0 ? idx("headcoachname") : idx("head_coach_name");
  const coachEmailIdx = idx("coachemail") >= 0 ? idx("coachemail") : idx("head_coach_email");

  if (schoolNameIdx < 0 || tierIdx < 0 || coachNameIdx < 0 || coachEmailIdx < 0) {
    return {
      importedAt: new Date().toISOString(),
      programsUpserted: 0,
      coachesUpserted: 0,
      duplicatesSkipped: 0,
      errors: [
        "CSV missing required columns: schoolName, tier, headCoachName, coachEmail (or institution_name/classification/head_coach_* aliases).",
      ],
      programs: [],
      coaches: [],
      artifactPath: "",
    };
  }

  const cityIdx = idx("city") >= 0 ? idx("city") : -1;
  const stateIdx = idx("state") >= 0 ? idx("state") : -1;
  const conferenceIdx = idx("conference") >= 0 ? idx("conference") : -1;
  const mascotIdx = idx("mascot") >= 0 ? idx("mascot") : -1;
  const phoneIdx = idx("coachphone") >= 0 ? idx("coachphone") : idx("head_coach_phone");
  const titleIdx = idx("coachtitle") >= 0 ? idx("coachtitle") : idx("head_coach_title");

  const importedAt = new Date().toISOString();
  const programs: CanonicalProgramRecord[] = [];
  const coaches: DatabaseCoach[] = [];
  const seenPrograms = new Set<string>();
  const seenCoaches = new Set<string>();
  let duplicatesSkipped = 0;

  rows.slice(1).forEach((row, rowIndex) => {
    const schoolName = (row[schoolNameIdx] || "").trim();
    const tier = (row[tierIdx] || "").trim();
    const headCoachName = (row[coachNameIdx] || "").trim();
    const coachEmailRaw = (row[coachEmailIdx] || "").trim();

    if (!schoolName || !tier) {
      errors.push(`Row ${rowIndex + 2}: schoolName and tier are required.`);
      return;
    }
    if (!headCoachName) {
      errors.push(`Row ${rowIndex + 2}: headCoachName is required.`);
      return;
    }

    const classification = normalizeTier(tier);
    const programId = `csv-${classification}-${slugify(schoolName)}`;
    if (seenPrograms.has(programId)) {
      duplicatesSkipped += 1;
    } else {
      seenPrograms.add(programId);
      programs.push({
        id: programId,
        cfbdId: null,
        institutionName: schoolName,
        mascot: mascotIdx >= 0 ? emptyToNull(row[mascotIdx]) : null,
        abbreviation: null,
        conference: conferenceIdx >= 0 ? emptyToNull(row[conferenceIdx]) : null,
        classification,
        city: cityIdx >= 0 ? emptyToNull(row[cityIdx]) : null,
        state: stateIdx >= 0 ? emptyToNull(row[stateIdx]) : null,
        stadiumCapacity: null,
        primaryColorHex: null,
        secondaryColorHex: null,
        athleticsBaseUrl: null,
        dataSource: "csv_bulk",
        lastSyncedAt: importedAt,
      });
    }

    const coachKey = `${programId}::${headCoachName.toLowerCase()}`;
    if (seenCoaches.has(coachKey)) {
      duplicatesSkipped += 1;
      return;
    }
    seenCoaches.add(coachKey);

    const email = emptyToNull(coachEmailRaw);
    if (email && !email.includes("@")) {
      errors.push(`Row ${rowIndex + 2}: coachEmail must be a valid email or blank.`);
      return;
    }

    coaches.push({
      coachId: `csv-coach-${slugify(programId)}-${slugify(headCoachName)}`,
      schoolId: programId,
      fullName: headCoachName,
      title: (titleIdx >= 0 ? emptyToNull(row[titleIdx]) : null) || "Head Coach",
      email,
      officePhone: phoneIdx >= 0 ? emptyToNull(row[phoneIdx]) : null,
      twitterHandle: null,
      lastVerifiedDate: importedAt,
    });
  });

  const artifactPath = writeJsonArtifact("schools_csv_import.json", {
    importedAt,
    programs,
    coaches,
    errors,
    duplicatesSkipped,
  });

  return {
    importedAt,
    programsUpserted: programs.length,
    coachesUpserted: coaches.length,
    duplicatesSkipped,
    errors,
    programs,
    coaches,
    artifactPath,
  };
}
