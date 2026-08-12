import React, { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Database } from "lucide-react";

interface ImportResponse {
  importedAt?: string;
  programsUpserted?: number;
  coachesUpserted?: number;
  duplicatesSkipped?: number;
  errors?: string[];
  error?: string;
  message?: string;
}

const SAMPLE_CSV = `schoolName,tier,city,state,conference,mascot,headCoachName,coachEmail,coachPhone,coachTitle
East Mississippi Community College,juco,Scooba,MS,MACCC,Lions,Verified Coach Name,coach@emcc.edu,(662) 476-5000,Head Coach
IMG Academy,prep,Bradenton,FL,Independent,Ascenders,Verified Prep Coach,,(941) 755-1000,Head Coach
`;

export const SchoolsCsvImporter: React.FC = () => {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const handleImport = async () => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/v1/admin/import-schools-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const data = (await response.json()) as ImportResponse;
      if (!response.ok) {
        throw new Error(data.message || data.error || "CSV import failed.");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV import failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Database className="w-3.5 h-3.5" /> JUCO / Prep CSV Bulk Importer
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Schools CSV Importer</h1>
        <p className="text-xs text-slate-300 max-w-2xl">
          Upload verified NJCAA / CCCAA / Prep spreadsheets. Required columns:{" "}
          <span className="font-mono text-amber-300">schoolName, tier, headCoachName, coachEmail</span>. Blank emails
          stay null — never invent contacts.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <label className="flex flex-col sm:flex-row sm:items-center gap-3 min-h-[44px]">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-black uppercase tracking-wider cursor-pointer hover:border-amber-500/40">
            <Upload className="w-4 h-4 text-amber-400" /> Choose CSV File
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
          </span>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> POST /api/v1/admin/import-schools-csv
          </span>
        </label>

        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={12}
          className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/40"
        />

        <button
          type="button"
          onClick={handleImport}
          disabled={isSubmitting || !csvText.trim()}
          className="min-h-[44px] px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {isSubmitting ? "Validating & Importing..." : "Import Verified Schools CSV"}
        </button>

        {error && (
          <div className="p-3 rounded-2xl border border-rose-500/40 text-rose-300 text-xs font-bold flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {result && (
          <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" /> Import Complete
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <Stat label="Programs" value={String(result.programsUpserted ?? 0)} />
              <Stat label="Coaches" value={String(result.coachesUpserted ?? 0)} />
              <Stat label="Dupes Skipped" value={String(result.duplicatesSkipped ?? 0)} />
              <Stat label="Row Errors" value={String(result.errors?.length ?? 0)} />
            </div>
            {!!result.errors?.length && (
              <ul className="text-amber-200/90 space-y-1 list-disc pl-4">
                {result.errors.slice(0, 8).map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
      <div className="text-[9px] text-slate-500 uppercase font-bold">{label}</div>
      <div className="text-sm font-black text-emerald-300 mt-0.5">{value}</div>
    </div>
  );
}
