import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  FileText,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { COMPLIANCE_AUDIT_LEDGER, getCurrentNcaaPeriod } from "../complianceEngine";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import type { ClearanceStatus, ComplianceAuditLog, NcaaRecruitingPeriod } from "../types";

interface CommunicationAuditRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "approved" | "blocked_compliance" | "pending_guardian";
  action_taken: string;
  reason: string | null;
  timestamp: string;
}

function mapMessageStatus(row: CommunicationAuditRow): ClearanceStatus {
  if (row.status === "approved") return "CLEARED";
  if (row.status === "pending_guardian") return "BLOCKED_MINOR_CONSENT";
  const reason = (row.reason ?? row.action_taken).toLowerCase();
  if (reason.includes("inducement") || reason.includes("signing bonus")) {
    return "BLOCKED_INDUCEMENT";
  }
  return "BLOCKED_CALENDAR";
}

function mapCommunicationAuditRow(row: CommunicationAuditRow): ComplianceAuditLog {
  return {
    id: row.id,
    schoolId: "unspecified",
    coachId: row.sender_id,
    athleteId: row.receiver_id,
    actionType: "DIRECT_MESSAGE",
    clearanceStatus: mapMessageStatus(row),
    notes: row.reason ?? row.action_taken,
    createdAt: row.timestamp,
  };
}

function getStatusConfig(status: ClearanceStatus) {
  if (status === "CLEARED") {
    return { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: ShieldCheck };
  }
  if (status === "BLOCKED_INDUCEMENT") {
    return { color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: AlertTriangle };
  }
  return { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: ShieldAlert };
}

function periodAccent(period: NcaaRecruitingPeriod): string {
  if (period === "DEAD") return "text-rose-500";
  if (period === "QUIET") return "text-amber-500";
  if (period === "EVALUATION") return "text-cyan-400";
  return "text-emerald-500";
}

export const ComplianceDashboard: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<NcaaRecruitingPeriod>("CONTACT");
  const [auditLogs, setAuditLogs] = useState<ComplianceAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setActivePeriod(getCurrentNcaaPeriod(new Date()));

    let isMounted = true;

    const loadLogs = async () => {
      const localLedger = [...COMPLIANCE_AUDIT_LEDGER];

      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setAuditLogs(localLedger);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("communication_audit_logs")
          .select("id, sender_id, receiver_id, status, action_taken, reason, timestamp")
          .order("timestamp", { ascending: false })
          .limit(50);

        if (!isMounted) return;

        if (error || !data) {
          setAuditLogs(localLedger);
          setLoading(false);
          return;
        }

        const remote = (data as CommunicationAuditRow[]).map(mapCommunicationAuditRow);
        setAuditLogs(remote.length > 0 ? remote : localLedger);
        setLoading(false);
      } catch {
        if (isMounted) {
          setAuditLogs(localLedger);
          setLoading(false);
        }
      }
    };

    void loadLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return auditLogs;
    return auditLogs.filter((log) =>
      [log.id, log.athleteId, log.coachId, log.notes, log.clearanceStatus, log.actionType]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [auditLogs, query]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-full min-h-[600px]">
      <div className="md:w-80 bg-slate-950 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
            <span className="truncate">Compliance Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">System Telemetry & Audit Gates</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" /> Active NCAA Period
          </span>
          <div className={`text-2xl font-black uppercase tracking-tight ${periodAccent(activePeriod)}`}>
            {activePeriod}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {activePeriod === "DEAD"
              ? "All in-person and digital recruiting contact is strictly prohibited."
              : "Standard digital communication and evaluations are permitted."}
          </p>
        </div>

        <div className="space-y-3 mt-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
            Active Firewalls
          </h3>
          <ul className="text-xs font-mono text-slate-300 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Inducement Scanning: ON
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> COPPA / Minor Consent: ON
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> RLS Database Filters: ON
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col bg-slate-900 min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 shrink-0" /> Immutable Audit Ledger
          </h3>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ID or Athlete..."
              aria-label="Search audit ledger"
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none min-h-[44px]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[320px]">
          {loading ? (
            Array.from({ length: 4 }, (_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-20 bg-slate-950 border border-slate-800 rounded-xl animate-pulse"
              />
            ))
          ) : filteredLogs.length === 0 ? (
            <div className="min-h-[320px] flex items-center justify-center text-center text-slate-500 text-sm font-mono px-4">
              No recent audit events logged.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const { color, icon: StatusIcon } = getStatusConfig(log.clearanceStatus);
              return (
                <div
                  key={log.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className={`mt-0.5 shrink-0 p-2 rounded-lg border ${color}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate">
                        {log.actionType.replaceAll("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-mono truncate">{log.notes}</p>
                    <div className="mt-0.5 flex flex-wrap gap-2 text-[10px] font-mono">
                      <span className="text-slate-600 truncate">Ath ID: {log.athleteId}</span>
                      <span className="text-slate-700">•</span>
                      <span
                        className={`font-bold ${
                          log.clearanceStatus === "CLEARED" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {log.clearanceStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
