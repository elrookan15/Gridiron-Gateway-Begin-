import React, { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Clock, GraduationCap, Search } from "lucide-react";

import { isSupabaseConfigured } from "../lib/supabaseClient";
import { getTransferPortalAthletes } from "../services/schoolsApi";
import type { PortalStatus, TransferPortalAthlete } from "../types";

function getStatusBadge(status: PortalStatus) {
  if (status === "ACTIVE") {
    return (
      <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[10px] font-bold tracking-widest uppercase shrink-0">
        In Portal
      </span>
    );
  }
  if (status === "WITHDRAWN") {
    return (
      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold tracking-widest uppercase shrink-0">
        Withdrawn
      </span>
    );
  }
  return (
    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold tracking-widest uppercase shrink-0">
      Transferred
    </span>
  );
}

export const TransferPortalModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<TransferPortalAthlete[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PortalStatus | "ALL">("ACTIVE");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPortalData = async () => {
      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setTransfers([]);
          setLoading(false);
        }
        return;
      }

      try {
        const rows = await getTransferPortalAthletes();
        if (isMounted) {
          setTransfers(rows);
          setFetchError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setTransfers([]);
          setFetchError(err instanceof Error ? err.message : "Portal fetch failed.");
          setLoading(false);
        }
      }
    };

    void fetchPortalData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransfers = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return transfers
      .filter((athlete) => {
        const matchesSearch =
          needle === "" ||
          athlete.athleteName.toLowerCase().includes(needle) ||
          athlete.originSchool.name.toLowerCase().includes(needle);
        const matchesStatus = statusFilter === "ALL" || athlete.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => Date.parse(b.entryDate) - Date.parse(a.entryDate));
  }, [transfers, searchQuery, statusFilter]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full min-h-[600px]">
      <div className="bg-slate-950 p-6 border-b border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 shrink-0 text-cyan-400" />
              <span className="truncate">NCAA Transfer Portal</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Live tracking of undergraduate and graduate transfers.
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as PortalStatus | "ALL")}
            aria-label="Filter portal status"
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 min-h-[44px] focus:outline-none focus:border-cyan-500 appearance-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active in Portal</option>
            <option value="MATRICULATED">Matriculated</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by athlete name or origin school..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search transfer portal"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 text-sm font-mono text-slate-200 min-h-[44px] focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-slate-900 min-h-0">
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading portal tape">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={`portal-skel-${index}`} className="h-24 bg-slate-950 border border-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="min-h-[240px] flex items-center justify-center text-center py-16 text-rose-400 font-mono text-sm border-2 border-dashed border-rose-500/20 rounded-xl px-4">
            {fetchError}
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="min-h-[240px] flex items-center justify-center text-center py-16 text-slate-500 font-mono text-sm border-2 border-dashed border-slate-800 rounded-xl px-4">
            No transfer portal records match your current filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransfers.map((athlete) => (
              <article
                key={athlete.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded bg-slate-900 border border-slate-800 shrink-0">
                    <span className="text-lg font-black text-slate-200">{athlete.position}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-base font-extrabold text-slate-100 truncate">{athlete.athleteName}</h3>
                      {getStatusBadge(athlete.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex text-amber-400 text-xs tracking-widest shrink-0">
                        {"★".repeat(athlete.starRating)}
                      </div>
                      <span
                        className={`text-[10px] font-mono uppercase flex items-center gap-1 ${
                          athlete.transferType === "GRADUATE" ? "text-purple-400" : "text-cyan-400"
                        }`}
                      >
                        <GraduationCap className="w-3 h-3 shrink-0" /> {athlete.transferType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:w-1/2 justify-between md:justify-end shrink-0">
                  <div className="space-y-1 text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 shrink-0" /> Entered {new Date(athlete.entryDate).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {athlete.eligibilityRemaining} Year{athlete.eligibilityRemaining !== 1 ? "s" : ""} Eligibility
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 min-w-[160px]">
                    <div className="flex flex-col items-center min-w-0">
                      <div
                        className="w-3 h-3 rounded-full mb-1 shrink-0"
                        style={{ backgroundColor: athlete.originSchool.primaryColor }}
                      />
                      <span className="text-[10px] font-bold text-slate-300 uppercase truncate max-w-[60px]">
                        {athlete.originSchool.name}
                      </span>
                    </div>
                    <ArrowRightLeft className="w-4 h-4 text-slate-600 shrink-0" />
                    <div className="flex flex-col items-center min-w-0">
                      {athlete.destinationSchool ? (
                        <>
                          <div
                            className="w-3 h-3 rounded-full mb-1 shrink-0"
                            style={{ backgroundColor: athlete.destinationSchool.primaryColor }}
                          />
                          <span className="text-[10px] font-bold text-slate-300 uppercase truncate max-w-[60px]">
                            {athlete.destinationSchool.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full border border-dashed border-slate-600 mb-1" />
                          <span className="text-[10px] font-mono text-slate-500">TBD</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
