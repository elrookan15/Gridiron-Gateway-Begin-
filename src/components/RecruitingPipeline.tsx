/**
 * RecruitingPipeline — coach Kanban for target lifecycle progression.
 * Columns: Evaluating → Offered → Official Visit → Committed
 * Click-to-advance / click-to-regress (no external DnD libs).
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  type PipelineOffer,
  type RecruitingPipelineStage,
} from "../types";
import {
  getPipelineOffers,
  updatePipelineOfferStage,
} from "../services/schoolsApi";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Star,
} from "lucide-react";

/** Simulated logged-in coach school until auth + RLS session is wired. */
const DEMO_COACH_SCHOOL_ID = "fbs-texas";

const PIPELINE_STAGES: RecruitingPipelineStage[] = [
  "Evaluating",
  "Offered",
  "Official Visit",
  "Committed",
];

const STAGE_META: Record<
  RecruitingPipelineStage,
  { subtitle: string; accent: string; headerBg: string; icon: React.ReactNode }
> = {
  Evaluating: {
    subtitle: "Film review",
    accent: "border-t-cyan-500",
    headerBg: "bg-cyan-500/10 text-cyan-300",
    icon: <ClipboardList className="w-4 h-4 shrink-0" />,
  },
  Offered: {
    subtitle: "Scholarship extended",
    accent: "border-t-amber-500",
    headerBg: "bg-amber-500/10 text-amber-300",
    icon: <Star className="w-4 h-4 shrink-0" />,
  },
  "Official Visit": {
    subtitle: "On-campus",
    accent: "border-t-purple-500",
    headerBg: "bg-purple-500/10 text-purple-300",
    icon: <MapPin className="w-4 h-4 shrink-0" />,
  },
  Committed: {
    subtitle: "Verbal / NLI",
    accent: "border-t-emerald-500",
    headerBg: "bg-emerald-500/10 text-emerald-300",
    icon: <GraduationCap className="w-4 h-4 shrink-0" />,
  },
};

type LoadState = "loading" | "success" | "error";

function stageIndex(stage: RecruitingPipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

export const RecruitingPipeline: React.FC<{ schoolId?: string }> = ({
  schoolId = DEMO_COACH_SCHOOL_ID,
}) => {
  const [offers, setOffers] = useState<PipelineOffer[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPipeline = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);
    setActionError(null);

    if (!isSupabaseConfigured()) {
      setLoadState("error");
      setErrorMessage(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      );
      setOffers([]);
      return;
    }

    try {
      const rows = await getPipelineOffers(schoolId);
      setOffers(rows);
      setLoadState("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load recruiting pipeline.";
      setErrorMessage(message);
      setOffers([]);
      setLoadState("error");
    }
  }, [schoolId]);

  useEffect(() => {
    void loadPipeline();
  }, [loadPipeline]);

  const columns = useMemo(() => {
    const map: Record<RecruitingPipelineStage, PipelineOffer[]> = {
      Evaluating: [],
      Offered: [],
      "Official Visit": [],
      Committed: [],
    };
    for (const offer of offers) {
      map[offer.stage].push(offer);
    }
    return map;
  }, [offers]);

  const moveOffer = async (offerId: string, direction: -1 | 1) => {
    const current = offers.find((o) => o.id === offerId);
    if (!current) return;

    const nextIdx = stageIndex(current.stage) + direction;
    if (nextIdx < 0 || nextIdx >= PIPELINE_STAGES.length) return;

    const nextStage = PIPELINE_STAGES[nextIdx];
    const previous = offers;

    // Optimistic UI — preserve column heights / avoid CLS
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, stage: nextStage } : o)),
    );
    setMovingId(offerId);
    setActionError(null);

    try {
      await updatePipelineOfferStage(offerId, nextStage);
    } catch (err) {
      setOffers(previous);
      setActionError(err instanceof Error ? err.message : "Stage update failed.");
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Coach Recruiting Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Target Progression Board
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            School scope: <span className="font-mono text-cyan-400">{schoolId}</span>
            {" · "}
            Evaluating → Offered → Official Visit → Committed
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadPipeline()}
          disabled={loadState === "loading"}
          className="min-h-[44px] px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 shrink-0 ${loadState === "loading" ? "animate-spin" : ""}`} />
          Refresh Board
        </button>
      </div>

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3 text-xs text-rose-300 flex items-start gap-2" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {loadState === "error" && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-rose-300 font-bold text-sm">Pipeline sync failed</h3>
            <p className="text-xs text-slate-300 mt-0.5 break-words">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadPipeline()}
            className="min-h-[44px] px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold border border-rose-500/40 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Board — reserved min-height prevents CLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[420px]">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            offers={loadState === "loading" ? [] : columns[stage]}
            loading={loadState === "loading"}
            movingId={movingId}
            onMoveLeft={(id) => void moveOffer(id, -1)}
            onMoveRight={(id) => void moveOffer(id, 1)}
          />
        ))}
      </div>
    </div>
  );
};

interface PipelineColumnProps {
  stage: RecruitingPipelineStage;
  offers: PipelineOffer[];
  loading: boolean;
  movingId: string | null;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
  stage,
  offers,
  loading,
  movingId,
  onMoveLeft,
  onMoveRight,
}) => {
  const meta = STAGE_META[stage];
  const idx = stageIndex(stage);

  return (
    <section
      className={`bg-slate-900 border border-slate-800 border-t-4 ${meta.accent} rounded-2xl flex flex-col min-h-[420px] shadow-xl overflow-hidden`}
      aria-label={`${stage} column`}
    >
      <header className={`px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 ${meta.headerBg}`}>
        <div className="min-w-0 flex items-center gap-2">
          {meta.icon}
          <div className="min-w-0">
            <h2 className="text-sm font-black uppercase tracking-wide truncate text-white">{stage}</h2>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{meta.subtitle}</p>
          </div>
        </div>
        <span className="shrink-0 min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold text-white">
          {loading ? "—" : offers.length}
        </span>
      </header>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : offers.length === 0 ? (
          <p className="text-center text-xs text-slate-500 font-mono py-10 px-2">
            No targets in {stage}.
          </p>
        ) : (
          offers.map((offer) => (
            <PipelineCard
              key={offer.id}
              offer={offer}
              canMoveLeft={idx > 0}
              canMoveRight={idx < PIPELINE_STAGES.length - 1}
              isMoving={movingId === offer.id}
              onMoveLeft={() => onMoveLeft(offer.id)}
              onMoveRight={() => onMoveRight(offer.id)}
            />
          ))
        )}
      </div>
    </section>
  );
};

interface PipelineCardProps {
  offer: PipelineOffer;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  isMoving: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

const PipelineCard: React.FC<PipelineCardProps> = ({
  offer,
  canMoveLeft,
  canMoveRight,
  isMoving,
  onMoveLeft,
  onMoveRight,
}) => (
  <article className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3.5 shadow-md transition-colors space-y-3">
    <div className="flex items-start justify-between gap-2 min-w-0">
      <div className="min-w-0">
        <h3 className="text-sm font-extrabold text-white truncate">{offer.athleteName}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          <span className="text-amber-400 font-bold">{offer.position}</span>
          {" · "}
          Offered {Number.isNaN(Date.parse(offer.offerDate))
            ? offer.offerDate
            : new Date(offer.offerDate).toLocaleDateString()}
        </p>
      </div>
      <div className="flex text-amber-400 text-xs shrink-0" aria-label={`${offer.starRating} stars`}>
        {"★".repeat(Math.max(offer.starRating, 0)) || "☆"}
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5">
      {offer.isOfficial && (
        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          Official
        </span>
      )}
      <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800">
        {offer.commitmentStatus}
      </span>
    </div>

    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
      <button
        type="button"
        onClick={onMoveLeft}
        disabled={!canMoveLeft || isMoving}
        className="min-h-[44px] flex-1 px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-bold inline-flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={`Move ${offer.athleteName} to previous stage`}
      >
        <ChevronLeft className="w-4 h-4 shrink-0" />
        Back
      </button>
      <button
        type="button"
        onClick={onMoveRight}
        disabled={!canMoveRight || isMoving}
        className="min-h-[44px] flex-1 px-2 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold inline-flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label={`Advance ${offer.athleteName} to next stage`}
      >
        {isMoving ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          <>
            Advance <ChevronRight className="w-4 h-4 shrink-0" />
          </>
        )}
      </button>
    </div>
  </article>
);

const CardSkeleton: React.FC = () => (
  <div
    className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 animate-pulse min-h-[132px]"
    aria-hidden
  >
    <div className="h-4 w-2/3 bg-slate-800 rounded" />
    <div className="h-3 w-1/2 bg-slate-800 rounded" />
    <div className="h-8 w-full bg-slate-800 rounded-xl" />
  </div>
);

export default RecruitingPipeline;
