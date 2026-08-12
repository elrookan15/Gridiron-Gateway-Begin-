import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign, Users, Sparkles, Zap, ArrowUpRight, ShieldCheck } from "lucide-react";

interface NILValuationChartProps {
  followerCount?: number;
  engagementRate?: number;
  nilStarRating?: number;
  totalValuation?: number;
}

export const NILValuationChart: React.FC<NILValuationChartProps> = ({
  followerCount = 45000,
  engagementRate = 4.2,
  nilStarRating = 4,
  totalValuation = 185000,
}) => {
  const [timeHorizon, setTimeHorizon] = useState<"12m" | "6m" | "quarterly">("12m");
  const [activeMetric, setActiveMetric] = useState<"all" | "social_only" | "collective_only">("all");

  // Generate dynamic trajectory points based on input parameters
  const chartData = useMemo(() => {
    const months = [
      { name: "Jan", factor: 0.55 },
      { name: "Feb", factor: 0.60 },
      { name: "Mar", factor: 0.68 },
      { name: "Apr", factor: 0.75 },
      { name: "May", factor: 0.82 },
      { name: "Jun", factor: 0.90 },
      { name: "Jul", factor: 0.96 },
      { name: "Aug", factor: 1.05 },
      { name: "Sep", factor: 1.15 },
      { name: "Oct", factor: 1.25 },
      { name: "Nov", factor: 1.35 },
      { name: "Dec", factor: 1.48 },
    ];

    const baseValuation = totalValuation || 185000;
    const currentFollowers = followerCount || 45000;
    const engagement = engagementRate || 4.2;

    // Split valuation: ~55% Collective, ~30% Social, ~15% Licensing
    const baseCollectiveRatio = 0.55;
    const baseSocialRatio = 0.30;
    const baseLicensingRatio = 0.15;

    const fullData = months.map((m, idx) => {
      // Exponential social growth curve boosted by engagement rate
      const growthCurve = Math.pow(1 + engagement / 100, idx * 0.4) * m.factor;
      
      const projectedFollowers = Math.round(currentFollowers * (0.65 + idx * 0.08) * (1 + engagement * 0.03));
      
      const collectiveVal = Math.round(baseValuation * baseCollectiveRatio * (0.8 + idx * 0.035));
      const socialVal = Math.round(
        baseValuation * baseSocialRatio * (projectedFollowers / currentFollowers) * (engagement / 4.0)
      );
      const licensingVal = Math.round(baseValuation * baseLicensingRatio * (0.85 + idx * 0.04));

      const totalVal = collectiveVal + socialVal + licensingVal;

      return {
        month: m.name,
        quarter: `Q${Math.floor(idx / 3) + 1}`,
        followers: projectedFollowers,
        followersFormatted: `${(projectedFollowers / 1000).toFixed(1)}k`,
        collectiveValuation: collectiveVal,
        socialValuation: socialVal,
        licensingValuation: licensingVal,
        totalValuation: totalVal,
        perPostValue: Math.round((socialVal / 12) * (engagement / 3.5)),
      };
    });

    if (timeHorizon === "6m") {
      return fullData.slice(0, 6);
    } else if (timeHorizon === "quarterly") {
      // Aggregate into 4 quarters
      return [
        { ...fullData[2], month: "Q1 National Signing" },
        { ...fullData[5], month: "Q2 Spring Showcase" },
        { ...fullData[8], month: "Q3 Fall Opener" },
        { ...fullData[11], month: "Q4 Bowl Season" },
      ];
    }

    return fullData;
  }, [followerCount, engagementRate, nilStarRating, totalValuation, timeHorizon]);

  const peakValuation = useMemo(() => {
    return Math.max(...chartData.map((d) => d.totalValuation));
  }, [chartData]);

  const endFollowers = useMemo(() => {
    return chartData[chartData.length - 1]?.followers || followerCount;
  }, [chartData, followerCount]);

  const followerGrowthPct = useMemo(() => {
    const start = chartData[0]?.followers || followerCount;
    if (!start) return 0;
    return Math.round(((endFollowers - start) / start) * 100);
  }, [chartData, endFollowers, followerCount]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Recruit Valuation Trends
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Social Impact Engine
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Projected Growth Trajectory</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </h2>
          <p className="text-xs text-slate-400">
            Simulated 12-month annual valuation curve mapping social media follower growth against brand sponsorship revenue & roster collective payouts.
          </p>
        </div>

        {/* Quick Highlights & Timeframe Selectors */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setTimeHorizon("12m")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                timeHorizon === "12m"
                  ? "bg-lime-500 text-slate-950 shadow-md shadow-lime-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setTimeHorizon("6m")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                timeHorizon === "6m"
                  ? "bg-lime-500 text-slate-950 shadow-md shadow-lime-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeHorizon("quarterly")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                timeHorizon === "quarterly"
                  ? "bg-lime-500 text-slate-950 shadow-md shadow-lime-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-lime-400" /> Peak Valuation
          </span>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            ${peakValuation.toLocaleString()}
          </div>
          <p className="text-[10px] font-bold text-lime-400 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Max Projected
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-sky-400" /> Projected Followers
          </span>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            {endFollowers.toLocaleString()}
          </div>
          <p className="text-[10px] font-bold text-sky-400 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +{followerGrowthPct}% Reach
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-400" /> Per-Post Rate
          </span>
          <div className="text-base sm:text-lg font-black text-white font-mono">
            ${chartData[chartData.length - 1]?.perPostValue?.toLocaleString() || "1,200"}
          </div>
          <p className="text-[10px] font-bold text-orange-300">
            Est. Sponsored Post
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-yellow-400" /> Market Tier
          </span>
          <div className="text-base sm:text-lg font-black text-yellow-400 font-mono">
            {nilStarRating}★ Prospect
          </div>
          <p className="text-[10px] font-bold text-slate-400">
            {engagementRate}% Engagement
          </p>
        </div>
      </div>

      {/* Filter Buttons for Chart Layer View */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
          Chart Layers:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMetric("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              activeMetric === "all"
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            All Streams
          </button>
          <button
            onClick={() => setActiveMetric("social_only")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              activeMetric === "social_only"
                ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            Social Endorsements
          </button>
          <button
            onClick={() => setActiveMetric("collective_only")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              activeMetric === "collective_only"
                ? "bg-lime-500/20 border-lime-500/50 text-lime-300"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            Collective Roster
          </button>
        </div>
      </div>

      {/* MAIN RECHARTS COMPOSITE CHART */}
      <div className="h-80 w-full font-mono text-xs pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorCollective" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorSocial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            
            {/* Left Y-Axis: Currency ($) */}
            <XAxis
              dataKey="month"
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              tick={{ fill: "#84cc16", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />

            {/* Right Y-Axis: Followers Count */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              tick={{ fill: "#38bdf8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const dataPoint = payload[0].payload;
                return (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-2 max-w-xs font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-black text-white text-sm">{label} Milestone</span>
                      <span className="text-[10px] font-mono text-sky-300 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {dataPoint.followersFormatted} Followers
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-center text-lime-400">
                        <span className="text-slate-400 font-sans text-[11px]">Collective Roster:</span>
                        <span className="font-bold">${dataPoint.collectiveValuation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sky-300">
                        <span className="text-slate-400 font-sans text-[11px]">Social Endorsement:</span>
                        <span className="font-bold">${dataPoint.socialValuation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-yellow-400">
                        <span className="text-slate-400 font-sans text-[11px]">Jersey & Licensing:</span>
                        <span className="font-bold">${dataPoint.licensingValuation.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-white text-sm font-black">
                        <span className="text-slate-300 font-sans text-xs">Total Annual Market:</span>
                        <span className="text-lime-400">${dataPoint.totalValuation.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 15, fontSize: "11px", fontFamily: "sans-serif" }}
            />

            {/* Area: Collective Roster Valuation */}
            {(activeMetric === "all" || activeMetric === "collective_only") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="collectiveValuation"
                name="Collective Roster Payout"
                stroke="#84cc16"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCollective)"
              />
            )}

            {/* Area: Social Endorsement Revenue */}
            {(activeMetric === "all" || activeMetric === "social_only") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="socialValuation"
                name="Social Endorsement Revenue"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSocial)"
              />
            )}

            {/* Line: Social Media Followers Trajectory (Right Y-Axis) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="followers"
              name="Social Media Reach (Followers)"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ fill: "#38bdf8", r: 4, strokeWidth: 2, stroke: "#09090b" }}
              activeDot={{ r: 6, fill: "#bae6fd", stroke: "#38bdf8", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical Footer Note */}
      <div className="pt-4 border-t border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 text-lime-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="leading-relaxed text-[11px]">
          <strong className="text-slate-200">Social Media Growth Correlation:</strong> Higher follower volume combined with engagement rate directly multiplies brand sponsor deals. The light blue curve illustrates sponsored campaign value expansion & follower reach, while lime green reflects collective payouts.
        </p>
      </div>
    </div>
  );
};
