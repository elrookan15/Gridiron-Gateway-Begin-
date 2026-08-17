import React, { useMemo, useState } from "react";
import { MOCK_COACH_VIEWS } from "../data/mockData";
import { dispatchComplianceGate } from "../services/complianceGateApi";
import { getCurrentNcaaPeriod } from "../complianceEngine";
import { Eye, ShieldCheck, MessageSquare, Send, Calendar, CheckCircle2 } from "lucide-react";

export const CoachMessagingFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"views" | "messages">("views");
  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender: "Coach Brian Hartline (Ohio State)",
      text: "Caden, saw your spring combine laser numbers. Very impressed with your pocket presence and release. Are you planning to attend our Buckeye Showcase in June?",
      time: "Yesterday, 4:15 PM",
      isCoach: true,
    },
    {
      id: "m2",
      sender: "You (Caden Carter)",
      text: "Coach Hartline, thank you! Yes sir, I will be at the June 12th showcase with my offensive coordinator. Looking forward to meeting you in Columbus!",
      time: "Yesterday, 5:02 PM",
      isCoach: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const activePeriod = useMemo(() => getCurrentNcaaPeriod(new Date()), []);
  const messagingLocked = activePeriod === "DEAD";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setGateError(null);

    const evaluation = await dispatchComplianceGate({
      schoolId: "sch_ohio_state",
      coachId: "cch_hartline_osu",
      athleteId: "ath_caden_carter",
      athleteAge: 18,
      hasParentalConsent: false,
      messagePayload: text,
      actionType: "DIRECT_MESSAGE",
    });

    setIsSending(false);

    if (!evaluation.isCleared) {
      setGateError(evaluation.reason);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: evaluation.auditLogId ?? `m-${Date.now()}`,
        sender: "You (Caden Carter)",
        text,
        time: "Just now",
        isCoach: false,
      },
    ]);
    setInputMessage("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white space-y-8">
      {/* NCAA RECRUITING PERIOD COMPLIANCE BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/40 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 font-black text-[10px] rounded uppercase tracking-wider ${
                  messagingLocked ? "bg-rose-500 text-slate-950" : "bg-emerald-500 text-slate-950"
                }`}
              >
                CURRENT NCAA PERIOD: {activePeriod} PERIOD
              </span>
              <span className="text-xs text-slate-400">Class of 2026</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {messagingLocked
                ? "DEAD period: in-person and digital recruiting contact is blocked."
                : "Direct phone, text, and in-person contact permitted by NCAA Division I legislation."}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab("views")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "views" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Coach Views Analytics ({MOCK_COACH_VIEWS.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "messages" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Direct Messages
          </button>
        </div>
      </div>

      {/* COACH VIEWS ANALYTICS FEED */}
      {activeTab === "views" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" /> Verified College Coach Views Feed
              </h2>
              <p className="text-xs text-slate-400">
                Real-time tracking when verified Division I - NAIA coaches view your profile or Hudl film.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Verified Coach Badge Enabled
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_COACH_VIEWS.map((cv) => (
              <div
                key={cv.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs shrink-0">
                    {cv.division}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-white">{cv.coachName}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Staff
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      {cv.coachTitle} • <strong className="text-white">{cv.schoolName}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-300 mb-0.5">
                    {cv.action}
                  </span>
                  <p className="text-[10px] text-slate-500">{cv.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPLIANCE DIRECT MESSAGING SIMULATOR */}
      {activeTab === "messages" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-400" /> Coach Direct Messaging (NCAA Compliant)
            </h2>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Active Chat with Ohio State Staff
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-80 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-md p-3.5 rounded-2xl text-xs ${
                  m.isCoach
                    ? "bg-slate-900 border border-slate-800 text-slate-200"
                    : "bg-emerald-600 text-slate-950 font-medium ml-auto"
                }`}
              >
                <p className={`font-bold text-[10px] mb-1 ${m.isCoach ? "text-amber-400" : "text-slate-950/80"}`}>
                  {m.sender}
                </p>
                <p className="leading-relaxed">{m.text}</p>
                <span className={`text-[9px] block text-right mt-1 ${m.isCoach ? "text-slate-500" : "text-slate-950/70"}`}>
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
            {gateError ? (
              <p className="text-xs font-mono text-rose-400" role="alert">
                {gateError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={messagingLocked ? "Messaging locked during NCAA DEAD period" : "Type your reply to Coach..."}
                disabled={messagingLocked || isSending}
                className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 min-h-[44px] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={messagingLocked || isSending}
                className="shrink-0 min-h-[44px] px-5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                Send <Send className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
