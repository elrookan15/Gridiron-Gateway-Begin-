/**
 * JUCO / Prep CSV Bulk Importer — Step 3 of the program directory pipeline.
 *
 * NJCAA/CCCAA/Prep sites are non-standard; do not scrape them. Import a verified
 * spreadsheet instead. Empty email/phone cells remain null — never backfilled by AI.
 *
 * Usage:
 *   npx tsx scripts/ingestion/jucoPrepCsvImport.ts data/ingestion/templates/juco_prep_programs.template.csv
 */
import fs from "fs";
import path from "path";
import type { CanonicalCoachStaffRecord, CanonicalProgramRecord } from "../../src/types";
import { classifyRole, slugify, writeJsonArtifact } from "./lib/io";

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
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function emptyToNull(value: string | undefined): string | null {
  const trimmed = (value || "").trim();
  return trimmed.length ? trimmed : null;
}

export function importJucoPrepCsv(csvPath: string): {
  programs: CanonicalProgramRecord[];
  coaches: CanonicalCoachStaffRecord[];
} {
  const absolute = path.resolve(csvPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`CSV not found: ${absolute}`);
  }

  const rows = parseCsv(fs.readFileSync(absolute, "utf8"));
  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => headers.indexOf(name);

  const required = ["institution_name", "classification", "city", "state"];
  for (const column of required) {
    if (idx(column) < 0) {
      throw new Error(`CSV missing required column: ${column}`);
    }
  }

  const syncedAt = new Date().toISOString();
  const programs: CanonicalProgramRecord[] = [];
  const coaches: CanonicalCoachStaffRecord[] = [];

  for (const row of rows.slice(1)) {
    const institutionName = row[idx("institution_name")];
    const classificationRaw = (row[idx("classification")] || "").toLowerCase();
    if (!institutionName) continue;

    const classification =
      classificationRaw === "juco" || classificationRaw === "prep" || classificationRaw === "naia"
        ? classificationRaw
        : "juco";

    const programId = `csv-${classification}-${slugify(institutionName)}`;
    programs.push({
      id: programId,
      cfbdId: null,
      institutionName,
      mascot: emptyToNull(row[idx("mascot")]),
      abbreviation: emptyToNull(row[idx("abbreviation")]),
      conference: emptyToNull(row[idx("conference")]),
      classification,
      city: emptyToNull(row[idx("city")]),
      state: emptyToNull(row[idx("state")]),
      stadiumCapacity: null,
      primaryColorHex: emptyToNull(row[idx("primary_color_hex")]),
      secondaryColorHex: emptyToNull(row[idx("secondary_color_hex")]),
      athleticsBaseUrl: emptyToNull(row[idx("athletics_base_url")]),
      dataSource: "csv_bulk",
      lastSyncedAt: syncedAt,
    });

    const coachName = emptyToNull(row[idx("head_coach_name")]);
    const coachTitle = emptyToNull(row[idx("head_coach_title")]) || "Head Coach";
    if (coachName) {
      coaches.push({
        id: `csv-staff-${slugify(programId)}-${slugify(coachName)}`,
        programId,
        fullName: coachName,
        title: coachTitle,
        roleCategory: classifyRole(coachTitle),
        email: emptyToNull(row[idx("head_coach_email")]),
        phone: emptyToNull(row[idx("head_coach_phone")]),
        staffPageUrl: emptyToNull(row[idx("athletics_base_url")]) || "csv://bulk-import",
        source: "csv_bulk",
        lastVerifiedAt: syncedAt,
        isActive: true,
      });
    }
  }

  writeJsonArtifact("juco_prep_programs.json", {
    importedAt: syncedAt,
    count: programs.length,
    programs,
  });
  writeJsonArtifact("juco_prep_coaches.json", {
    importedAt: syncedAt,
    count: coaches.length,
    missingEmailCount: coaches.filter((c) => !c.email).length,
    coaches,
  });

  console.log(`[CSV] Imported ${programs.length} programs and ${coaches.length} coaches from ${absolute}`);
  return { programs, coaches };
}

const csvPath = process.argv[2];
if (process.argv[1]?.includes("jucoPrepCsvImport")) {
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/ingestion/jucoPrepCsvImport.ts <path-to-csv>");
    process.exit(1);
  }
  try {
    importJucoPrepCsv(csvPath);
  } catch (err) {
    console.error("[CSV] Import failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
