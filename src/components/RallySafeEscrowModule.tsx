import React, { useCallback, useEffect, useState } from "react";
import type { NilTransaction, RallySafeReleaseSnapshot } from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { canReleaseNilEscrow } from "../lib/rallySafeReleaseGate";
import {
  fetchNilTransactionsForAthlete,
  releaseNilEscrowPayout,
} from "../services/nilTransactionsApi";
import { isAthleteActiveInTransferPortal } from "../services/transferPortalApi";

interface EscrowModuleProps {
  athleteId: string;
}

function formatDealCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.trunc(abs / 100);
  const remainder = abs % 100;
  const body = `$${dollars.toLocaleString("en-US")}.${remainder.toString().padStart(2, "0")}`;
  return negative ? `-${body}` : body;
}

function snapshotForTransaction(
  tx: NilTransaction,
  athleteInTransferPortal: boolean,
): RallySafeReleaseSnapshot {
  return {
    clearinghouseStatus: tx.clearinghouseStatus,
    stripeMilestoneVerified: tx.clearinghouseStatus === "CLEARED",
    athleteInTransferPortal,
    regulatoryPlane: "THIRD_PARTY_NIL_GO",
    payoutReleased: tx.payoutReleased,
  };
}

export const RallySafeEscrowModule: React.FC<EscrowModuleProps> = ({ athleteId }) => {
  const [transactions, setTransactions] = useState<NilTransaction[]>([]);
  const [portalLocked, setPortalLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadLedger = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase connection required to view escrow ledger.");
      setTransactions([]);
      setPortalLocked(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [rows, inPortal] = await Promise.all([
        fetchNilTransactionsForAthlete(athleteId),
        isAthleteActiveInTransferPortal(athleteId),
      ]);
      setTransactions(rows);
      setPortalLocked(inPortal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ledger data.");
      setTransactions([]);
      setPortalLocked(false);
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);

  const handleReleaseFunds = async (transactionId: string) => {
    const target = transactions.find((tx) => tx.id === transactionId);
    if (!target) return;

    const gate = canReleaseNilEscrow(snapshotForTransaction(target, portalLocked));
    if (gate.ok === false) {
      return;
    }

    setProcessingId(transactionId);
    setActionError(null);
    try {
      const updated = await releaseNilEscrowPayout(transactionId);
      setTransactions((prev) => prev.map((tx) => (tx.id === updated.id ? updated : tx)));
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "FAIL_CLOSED: payout rejected by Postgres or RLS.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <AlertTriangle className="w-8 h-8 text-rose-500 mb-3 shrink-0" />
        <p className="text-sm font-mono text-rose-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
          <Lock className="w-5 h-5 shrink-0 text-slate-400" />
          RallySafe Escrow Ledger
        </h3>
      </div>

      {portalLocked && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl px-4 py-3 text-xs font-mono text-rose-200 min-h-[44px] flex items-center">
          Transfer portal lock active — RallySafe will not release capital.
        </div>
      )}

      {actionError && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl px-4 py-3 text-xs font-mono text-rose-200">
          {actionError}
        </div>
      )}

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono py-4 text-center min-h-[44px]">
            No active NIL transactions.
          </p>
        ) : (
          transactions.map((tx) => {
            const isNotCleared = tx.clearinghouseStatus === "NOT_CLEARED";
            const gate = canReleaseNilEscrow(snapshotForTransaction(tx, portalLocked));
            const canRelease = gate.ok === true;

            return (
              <article
                key={tx.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-extrabold text-slate-200 truncate">
                      {tx.sponsorName}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest rounded bg-slate-800 text-emerald-400 font-mono shrink-0">
                      {formatDealCents(tx.dealAmountCents)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    {tx.clearinghouseStatus === "CLEARED" ? (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> CLEARED
                      </span>
                    ) : isNotCleared ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> NOT CLEARED — eligibility
                        crisis
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />{" "}
                        {tx.clearinghouseStatus.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  {tx.vbpNotes && (
                    <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                      {tx.vbpNotes}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center">
                  {tx.payoutReleased ? (
                    <div className="min-h-[44px] px-4 flex items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold gap-2">
                      <Unlock className="w-4 h-4 shrink-0" /> Funds Released
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleReleaseFunds(tx.id)}
                      disabled={!canRelease || processingId === tx.id}
                      className={`min-h-[44px] px-4 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        canRelease
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {processingId === tx.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Release Escrow"
                      )}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
