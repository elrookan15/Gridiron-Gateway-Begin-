import React, { useState } from "react";
import { ParentConsentRecord } from "../types";
import { ShieldCheck, FileCheck, CheckCircle2, Lock, UserCheck, AlertTriangle } from "lucide-react";

const MOCK_PARENT_CONSENTS: ParentConsentRecord[] = [
  {
    id: "parent-1",
    athleteId: "rec_derrick_vance",
    athleteName: "Derrick Vance Jr.",
    parentName: "Derrick Vance Sr. (Father)",
    parentEmail: "derrick.vance.sr@example.com",
    isConsentGranted: true,
    coppaComplianceStatus: "COPPA / FERPA Verified",
    signedTimestamp: "June 10, 2026",
    consentScope: [
      "Direct Coach Electronic Messaging Consent (Athletes under 18)",
      "RallySafe NIL Escrow Milestone Authorization",
      "Academic Transcript FERPA Evaluation Release",
    ],
  },
];

export const ParentConsentPortal: React.FC = () => {
  const [consents] = useState<ParentConsentRecord[]>(MOCK_PARENT_CONSENTS);
  const [isSigned, setIsSigned] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/60 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> COPPA / FERPA External Compliance & Consent Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Parent & Guardian Compliance Consent Hub
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              External compliance sign-off workflow allowing parents of student-athletes under 18 to digitally e-sign COPPA messaging waivers and RallySafe NIL escrow disclosures.
            </p>
          </div>
        </div>
      </div>

      {/* CONSENT CARDS */}
      <div className="space-y-6">
        {consents.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                  {c.coppaComplianceStatus}
                </span>
                <h3 className="font-extrabold text-white text-lg mt-1">{c.athleteName} (Minor Athlete)</h3>
                <p className="text-xs text-slate-400">Parent/Guardian: {c.parentName} ({c.parentEmail})</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">E-Signed On:</span>
                <span className="text-xs font-black text-emerald-400 font-mono">{c.signedTimestamp}</span>
              </div>
            </div>

            {/* Granted Scopes Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Authorized Legal Consent Scope:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {c.consentScope.map((scope, idx) => (
                  <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 font-medium">{scope}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
