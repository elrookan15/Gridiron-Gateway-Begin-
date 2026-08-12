import React, { useState } from "react";
import { Server, Database, Shield, Code2, Layers, Search, Lock, DollarSign, Scale, FileText, AlertCircle, CheckCircle2, Landmark, HelpCircle, UserCheck, Sparkles, Building2, BadgePercent } from "lucide-react";
import { LogoBrandShowcase } from "./LogoBrandShowcase";

export const TechDocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"logo_brand" | "nil_guide" | "architecture">("logo_brand");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Title & Document Switcher Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Code2 className="w-3.5 h-3.5" /> Gridiron Gateway Technical & Legal Documentation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Engineering & Product Reference Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Brand Logo Emblem, System Architecture, Relational Schemas & August 2026 NIL Regulatory & Compliance Guide.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("logo_brand")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "logo_brand"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-950" />
            <span>Logo & Brand Identity</span>
          </button>
          <button
            onClick={() => setActiveTab("nil_guide")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "nil_guide"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>NIL Guide (Aug 2026)</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900/60 text-[10px] font-mono">NEW</span>
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "architecture"
                ? "bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>System Architecture</span>
          </button>
        </div>
      </div>

      {activeTab === "logo_brand" && <LogoBrandShowcase />}

      {activeTab === "nil_guide" && (
        <div className="space-y-8 animate-fadeIn">
          {/* NIL Banner Disclaimer */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              GRIDIRON GATEWAY — NIL Rules & Regulations Reference Guide (v1.0 — August 2026)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Not Legal Advice:</strong> Sourced from current public reporting, NCAA/CSC materials, and legal-industry analysis to inform product decisions. NIL rules are shaped simultaneously by the House v. NCAA class-action settlement, the College Sports Commission (CSC) NIL Go clearinghouse, a 50-state legal patchwork, and pending federal bills.
            </p>
          </div>

          {/* Core Highlights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">1. House Settlement & Revenue Sharing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Division I schools can now directly share athletics revenue (~$20.5M per-school annual cap). Direct school pay co-exists alongside third-party brand/collective NIL deals.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">2. CSC & NIL Go Clearinghouse</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Administered by Deloitte & CEO Bryan Seeley. D1 athletes must report third-party NIL deals within 5 business days. Review exemption limit set at $2,500/deal ($15k cap/yr).
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">3. Inducements & High School Rules</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                NIL recruiting inducement ban permanently enjoined in court. High school NIL permitted in ~45 states + DC, but requires state-specific & public vs private association logic.
              </p>
            </div>
          </div>

          {/* Feature-by-Feature Platform Implications Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> Platform Feature-by-Feature NIL Matrix (Section 11)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <th className="p-3">Platform Feature</th>
                    <th className="p-3">NIL Regulatory Implication</th>
                    <th className="p-3">Required Action for Engineering / Product</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      Coach Endorsement System
                    </td>
                    <td className="p-3 text-slate-300">
                      Could resemble informal, undocumented NIL compensation promises warned by CSC in Jan 2026 if linked to monetary value.
                    </td>
                    <td className="p-3 text-emerald-400 font-medium">
                      Keep endorsements purely qualitative & reputational. Require verified-account coach status.
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      AI Recruiting Outreach Assistant
                    </td>
                    <td className="p-3 text-slate-300">
                      Facilitating NIL negotiation risks triggering state athlete-agent registration laws (Florida, California, Louisiana).
                    </td>
                    <td className="p-3 text-amber-400 font-medium">
                      Scope AI drafts to general recruiting communications. Add human review step & disclaimers before sending.
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      Social Media Showcase Feed
                    </td>
                    <td className="p-3 text-slate-300">
                      Surfaces sponsored social posts. FTC Endorsement Guides require clear & conspicuous disclosures.
                    </td>
                    <td className="p-3 text-sky-400 font-medium">
                      Flag sponsored content distinctly. Source media strictly via official platform APIs.
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      High School Profile Builder
                    </td>
                    <td className="p-3 text-slate-300">
                      High school NIL is a 50-state patchwork (45 states permit, but vary by public vs private school athletic association).
                    </td>
                    <td className="p-3 text-purple-400 font-medium">
                      Collect state & school type early. Require parent/guardian consent capture for athletes under 18.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Legislative & Regulatory Landscape Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> Federal Bills Pending (Section 10)
              </h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <strong className="text-white block">SCORE Act (H.R. 4312):</strong> Preempts state NIL laws with one federal standard; limited antitrust shield for NCAA; bars athlete employee status.
                </li>
                <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <strong className="text-white block">SAFE Act (Senate):</strong> Focuses on athlete healthcare, medical benefits, and revenue equity.
                </li>
                <li className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <strong className="text-white block">Protect College Sports Act (2026):</strong> Bipartisan proposal combining federal NIL framework with transfer/eligibility rules.
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" /> Platform Compliance Checklist (Section 12)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Treat NIL as a live target — re-check regulatory assumptions quarterly.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Obtain legal counsel sign-off on athlete-agent statute exposure prior to releasing AI outreach tools.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Incorporate state-level and athletic association rules into profile onboarding flows.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Maintain public rankings and endorsements as purely reputational signals.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "architecture" && (
        <div className="space-y-8 animate-fadeIn">
          {/* TECH STACK RECOMMENDATIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-base text-white">Frontend Layer</h2>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>React 19 + TypeScript:</strong> Single-Page Application (SPA) runtime.</li>
                <li>• <strong>Vite:</strong> Ultra-fast modern build engine.</li>
                <li>• <strong>Tailwind CSS v4:</strong> Dark-mode athletic design system.</li>
                <li>• <strong>Motion:</strong> Smooth layout & state animations.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-base text-white">Backend & AI Layer</h2>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>Node.js + Express:</strong> High-throughput API gateway.</li>
                <li>• <strong>Server-Side Gemini 3.6 Flash:</strong> AI outreach generator & scouting assistant without API key leakage.</li>
                <li>• <strong>esbuild + tsx:</strong> Production bundle compilation to single CommonJS artifact.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-base text-white">Database & Search Layer</h2>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>PostgreSQL / Firestore:</strong> Relational tables for recruits, stats, academics, offers & camps.</li>
                <li>• <strong>Algolia / Elasticsearch:</strong> Faceted search engine sub-200ms latency for position, state & star rating.</li>
                <li>• <strong>Redis:</strong> Leaderboard caching and messaging rate-limiting.</li>
              </ul>
            </div>
          </div>

          {/* DATABASE SCHEMAS OVERVIEW (RELATIONAL TABLES FROM SPEC) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" /> Relational Database Schemas (Section 3 Spec)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              {/* recruits table */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold uppercase block">Table: `recruits` & `recruit_stats`</span>
                <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed p-2 bg-slate-900 rounded">
{`recruits {
  id: uuid (PK),
  user_id: uuid (FK),
  full_name: varchar,
  grad_year: int,
  high_school: varchar,
  state: varchar(2),
  primary_position: varchar (QB, WR, EDGE...),
  height_in: int, weight_lbs: int,
  commitment_status: enum (uncommitted/committed/decommitted)
}

recruit_stats {
  id: uuid (PK), recruit_id: uuid (FK),
  forty_yard: decimal, forty_type: enum (laser/hand),
  shuttle_5_10_5: decimal, vertical_jump: decimal,
  bench_max: int, squat_max: int,
  verified: boolean, verified_by: uuid
}`}
                </pre>
              </div>

              {/* recruit_academics & offers */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-bold uppercase block">Table: `recruit_academics` & `offers`</span>
                <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed p-2 bg-slate-900 rounded">
{`recruit_academics {
  id: uuid (PK), recruit_id: uuid (FK),
  gpa_unweighted: decimal, gpa_weighted: decimal,
  core_gpa: decimal (NCAA Core GPA),
  sat_score: int, act_score: int,
  intended_major: varchar,
  ncaa_eligibility_id: varchar
}

offers {
  id: uuid (PK), recruit_id: uuid (FK),
  school_id: uuid (FK), offered_date: date,
  status: enum (offered/committed/decommitted)
}`}
                </pre>
              </div>

              {/* camps & rankings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-bold uppercase block">Table: `camps` & `rankings`</span>
                <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed p-2 bg-slate-900 rounded">
{`camps {
  id: uuid (PK), name: varchar, host_school_id: uuid,
  division: enum (FBS/FCS/DII/DIII/JUCO),
  camp_type: enum (skills/mega/specialist),
  date: date, zip: varchar, lat/lng: decimal,
  cost: decimal, registration_url: text
}

rankings {
  id: uuid (PK), recruit_id: uuid (FK),
  national_rank: int, position_rank: int, state_rank: int,
  star_rating: int (3-5), composite_score: decimal
}`}
                </pre>
              </div>

              {/* messages & recruiting_periods */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-purple-400 font-bold uppercase block">Table: `messages` & `recruiting_periods`</span>
                <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed p-2 bg-slate-900 rounded">
{`messages {
  id: uuid (PK), sender_id: uuid, recipient_id: uuid,
  thread_id: uuid, sent_at: timestamp,
  ncaa_period_flag: varchar, body: text
}

recruiting_periods {
  id: uuid (PK), sport: varchar, division: enum,
  period_type: enum (quiet/dead/contact/evaluation),
  start_date: timestamp, end_date: timestamp
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* NCAA COMPLIANCE & SEARCH ARCHITECTURE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Lock className="w-5 h-5" /> Section 5: NCAA Messaging Compliance Rule Engine
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated compliance layer evaluating recruit class year, division, and active contact periods (Quiet, Dead, Contact, Evaluation) prior to message dispatch.
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Rule Engine Check:</span>
                  <span className="text-emerald-400 font-bold">Passed</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Audit Log Trail:</span>
                  <span className="text-slate-200 font-mono">ID #AUD-88204</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Contact Period Badge:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Contact Period Open</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Search className="w-5 h-5" /> Section 4: Faceted Search & Geo-Radius Engine
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sub-200ms faceted filtering combining primary position, state, star rating, core GPA ranges, and 50-mile geocoded camp radiuses.
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                <div>Algolia Indexing Queue: Denormalized per recruit</div>
                <div>Geo-Search: PostGIS / aroundLatLng (50 mi)</div>
                <div>Cache Layer: Redis query caching (60s TTL)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

