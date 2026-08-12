import React, { useState } from "react";
import { NilEscrowCampaign } from "../types";
import { ShieldCheck, DollarSign, Lock, CheckCircle2, AlertTriangle, Building2, RefreshCcw } from "lucide-react";

const MOCK_CAMPAIGNS: NilEscrowCampaign[] = [
  {
    id: "esc-1",
    campaignTitle: "Austin Local Business Auto Group Endorsement",
    sponsorName: "Austin Auto Group Collective",
    athleteName: "Derrick Vance Jr.",
    escrowTotalAmount: 50000,
    disbursedAmount: 20000,
    heldInEscrowAmount: 30000,
    complianceAuditStatus: "SEC / Compliance Clear",
    milestones: [
      { id: "m1", description: "Q1 Social Media Video Post & Charity Youth Camp Visit", payoutAmount: 20000, status: "Verified & Paid" },
      { id: "m2", description: "Midseason Autograph Signing Event", payoutAmount: 15000, status: "Pending Fulfillment" },
      { id: "m3", description: "Bowl Game Promotion Campaign", payoutAmount: 15000, status: "Pending Fulfillment" },
    ],
  },
  {
    id: "esc-2",
    campaignTitle: "Buford Fan Collective NIL Micro-Pool",
    sponsorName: "Peach State Recruits Collective",
    athleteName: "Malik Sanders",
    escrowTotalAmount: 25000,
    disbursedAmount: 10000,
    heldInEscrowAmount: 15000,
    complianceAuditStatus: "SEC / Compliance Clear",
    milestones: [
      { id: "m4", description: "Spring Game Social Takeover & Merch Launch", payoutAmount: 10000, status: "Verified & Paid" },
      { id: "m5", description: "Fall Season Kickoff Promotional Reel", payoutAmount: 15000, status: "Pending Fulfillment" },
    ],
  },
];

export const RallySafeEscrowModule: React.FC = () => {
  const [campaigns] = useState<NilEscrowCampaign[]>(MOCK_CAMPAIGNS);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" /> Compliant Smart-Contract Escrow Engine
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Gateway RallySafe NIL Escrow
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Conditional NIL micro-campaign funding holding collective sponsor assets in secure compliance-monitored escrow with auto-refund triggers upon transfer.
            </p>
          </div>
        </div>
      </div>

      {/* CAMPAIGNS LIST */}
      <div className="space-y-6">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {c.complianceAuditStatus}
                </span>
                <h3 className="font-extrabold text-white text-lg mt-1">{c.campaignTitle}</h3>
                <p className="text-xs text-slate-400">Sponsor: {c.sponsorName} • Athlete: {c.athleteName}</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-right">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Escrow Total</span>
                  <span className="text-base font-black text-amber-400 font-mono">{formatCurrency(c.escrowTotalAmount)}</span>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Held in Escrow</span>
                  <span className="text-base font-black text-lime-400 font-mono">{formatCurrency(c.heldInEscrowAmount)}</span>
                </div>
              </div>
            </div>

            {/* Milestones Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Conditional Fulfillment Milestones:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {c.milestones.map((m) => (
                  <div key={m.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">Milestone</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        m.status === "Verified & Paid"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium leading-snug">{m.description}</p>
                    <div className="text-right text-xs font-black text-lime-400 font-mono pt-1">
                      {formatCurrency(m.payoutAmount)}
                    </div>
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
