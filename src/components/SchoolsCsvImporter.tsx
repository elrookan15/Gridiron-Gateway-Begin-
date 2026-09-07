// src/components/SchoolsCsvImporter.tsx
import React, { useState } from "react";

type ImportStatus = "IDLE" | "PROCESSING" | "SUCCESS" | "ERROR";

interface SchoolsCsvImportApiResponse {
  status?: string;
  message?: string;
  error?: string;
  programsUpserted?: number;
  coachesUpserted?: number;
  duplicatesSkipped?: number;
  errors?: string[];
  totalProgramsInMemory?: number;
  totalCoachesInMemory?: number;
  artifactPath?: string;
}

export const SchoolsCsvImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>("IDLE");
  const [log, setLog] = useState<string>("");

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || status === "PROCESSING") return;

    setStatus("PROCESSING");
    setLog("Initializing CSV parsing...");

    try {
      setLog("Reading file as text...");
      const csvText = await file.text();

      setLog(
        "Validating headers: schoolName, tier, headCoachName, coachEmail (blank emails stay null)..."
      );

      setLog("Uploading to /api/v1/admin/import-schools-csv...");
      const response = await fetch("/api/v1/admin/import-schools-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });

      let payload: SchoolsCsvImportApiResponse = {};
      try {
        payload = (await response.json()) as SchoolsCsvImportApiResponse;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const detail =
          payload.message ||
          payload.error ||
          (payload.errors?.length ? payload.errors[0] : null) ||
          `HTTP ${response.status}`;
        setStatus("ERROR");
        setLog(`Import failed: ${detail}`);
        return;
      }

      const programs = payload.programsUpserted ?? 0;
      const coaches = payload.coachesUpserted ?? 0;
      const dupes = payload.duplicatesSkipped ?? 0;
      const warnCount = payload.errors?.length ?? 0;
      const warnSuffix =
        warnCount > 0 ? ` Row warnings: ${warnCount}.` : "";

      setStatus("SUCCESS");
      setLog(
        `Import complete — ${programs} program(s), ${coaches} coach(es) upserted; ${dupes} duplicate(s) skipped.${warnSuffix} Blank coach emails remain null (never invented).`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown upload error";
      setStatus("ERROR");
      setLog(`Import failed: ${message}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold font-jakarta text-slate-100 uppercase tracking-widest mb-2">
          JUCO & Prep CSV Bulk Importer
        </h2>
        <p className="text-sm text-slate-400">
          Upload a verified CSV to map non-NCAA programs (NJCAA, CCCAA, Prep Academies) into the
          Gridiron Gateway directory. Required columns:{" "}
          <span className="font-mono text-purple-400">
            schoolName, tier, headCoachName, coachEmail
          </span>
          . Blank emails stay null — never invented.
        </p>
      </div>

      <form onSubmit={handleFileUpload} className="space-y-4">
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-slate-950">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setStatus("IDLE");
              setLog("");
            }}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-400/10 file:text-purple-400 hover:file:bg-purple-400/20 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={!file || status === "PROCESSING"}
          className="w-full bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 hover:bg-emerald-400 text-slate-950 font-bold font-jakarta uppercase tracking-wide py-3.5 rounded-xl min-h-[44px] transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          {status === "PROCESSING" ? "Processing Upload..." : "Import to Database"}
        </button>
      </form>

      {log && (
        <div
          className={`bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono animate-fade-in ${
            status === "ERROR"
              ? "text-rose-300"
              : status === "SUCCESS"
                ? "text-emerald-300"
                : "text-slate-300"
          }`}
        >
          <span className="text-purple-400 font-bold">{"> "}</span>
          {log}
        </div>
      )}
    </div>
  );
};
