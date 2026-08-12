import React from "react";

interface GridironLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
  variant?: "badge" | "full" | "icon-only";
}

export const GridironLogo: React.FC<GridironLogoProps> = ({
  className = "",
  size = 48,
  showText = false,
  textClassName = "",
  variant = "badge",
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xl transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Grey Stadium Background Gradient */}
          <linearGradient id="greyStadiumBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Faceted Purple Gradient (Left Arch Side) */}
          <linearGradient id="polyPurpleDeep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="50%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          <linearGradient id="polyPurpleLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Faceted Lime/Emerald Gradient (Right Arch Side) */}
          <linearGradient id="polyGreenDeep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="polyGreenBright" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>

          {/* Diploma Metallic Scroll Gradient */}
          <linearGradient id="diplomaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Stadium Floodlight Glow Filter */}
          <filter id="faintStadiumGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Beam Light Radial */}
          <radialGradient id="lightBeam" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- GREY BACKGROUND CANVAS WITH ROUNDED CORNERS --- */}
        <rect width="200" height="200" rx="28" fill="url(#greyStadiumBg)" />
        <rect x="2" y="2" width="196" height="196" rx="26" fill="none" stroke="#334155" strokeWidth="1.5" opacity="0.8" />

        {/* --- FAINT STADIUM LIGHTS & CONICAL BEAMS --- */}
        {/* Top Left Floodlight Beam */}
        <path d="M 25 15 L 110 185 L 10 185 Z" fill="url(#lightBeam)" opacity="0.7" />
        {/* Top Right Floodlight Beam */}
        <path d="M 175 15 L 190 185 L 90 185 Z" fill="url(#lightBeam)" opacity="0.7" />

        {/* Stadium Floodlight Light Clusters (Top Left) */}
        <g filter="url(#faintStadiumGlow)" opacity="0.85">
          <circle cx="20" cy="18" r="3.5" fill="#fef08a" />
          <circle cx="28" cy="16" r="3.5" fill="#fef08a" />
          <circle cx="20" cy="25" r="3.5" fill="#e0f2fe" />
          <circle cx="28" cy="23" r="3.5" fill="#e0f2fe" />
          <line x1="24" y1="28" x2="24" y2="38" stroke="#64748b" strokeWidth="1.5" />
        </g>

        {/* Stadium Floodlight Light Clusters (Top Right) */}
        <g filter="url(#faintStadiumGlow)" opacity="0.85">
          <circle cx="172" cy="16" r="3.5" fill="#fef08a" />
          <circle cx="180" cy="18" r="3.5" fill="#fef08a" />
          <circle cx="172" cy="23" r="3.5" fill="#e0f2fe" />
          <circle cx="180" cy="25" r="3.5" fill="#e0f2fe" />
          <line x1="176" y1="28" x2="176" y2="38" stroke="#64748b" strokeWidth="1.5" />
        </g>

        {/* Faint Field Yardlines Grid on Grey Background */}
        <g opacity="0.12">
          <line x1="20" y1="160" x2="180" y2="160" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="20" y1="175" x2="180" y2="175" stroke="#ffffff" strokeWidth="1" />
          <line x1="100" y1="145" x2="100" y2="185" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3,3" />
        </g>

        {/* --- GEOMETRIC FACETED GATEWAY ARCH & FOOTBALL HELMET --- */}
        <g transform="translate(0, 0)">
          {/* Arch Top Gateway Pillar - Purple Left Facet */}
          <polygon points="100,22 80,45 100,58" fill="url(#polyPurpleLight)" />
          <polygon points="100,22 100,58 120,45" fill="url(#polyGreenBright)" />
          
          {/* Top Keystone Arch Accent */}
          <polygon points="94,18 106,18 108,34 92,34" fill="#a3e635" />

          {/* Left Gateway Arch (Low-Poly Purple/Indigo Facets) */}
          <polygon points="92,34 68,60 84,80 100,58" fill="url(#polyPurpleDeep)" />
          <polygon points="68,60 48,102 65,115 84,80" fill="#4338ca" />
          <polygon points="48,102 32,130 55,135 65,115" fill="#312e81" />
          <polygon points="32,130 25,148 58,148 55,135" fill="url(#polyPurpleDeep)" />

          {/* Right Gateway Arch & Football Helmet Shell (Low-Poly Emerald/Lime Facets) */}
          <polygon points="108,34 100,58 122,75 138,55" fill="url(#polyGreenBright)" />
          <polygon points="138,55 122,75 142,98 158,78" fill="url(#polyGreenDeep)" />

          {/* Football Helmet Facemask Integration (Right Side) */}
          <path
            d="M 132,82 L 168,82 L 175,102 L 148,118 L 138,98 Z"
            fill="url(#polyGreenBright)"
            opacity="0.9"
          />
          {/* Helmet Facemask Bars */}
          <path
            d="M 148,88 L 172,88 M 150,96 L 174,96 M 152,104 L 170,104 M 165,84 L 165,110"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right Base Arch Pillar */}
          <polygon points="130,122 120,148 145,148 152,125" fill="url(#polyGreenDeep)" />

          {/* --- DIAGONAL ROLLED DIPLOMA SCROLL (Crossing Arch Center) --- */}
          <g transform="rotate(-35 95 95)">
            {/* Diploma Body Cylinder */}
            <rect x="55" y="85" width="70" height="18" rx="4" fill="url(#diplomaGrad)" stroke="#60a5fa" strokeWidth="1.2" />
            {/* Diploma Scroll Ends */}
            <ellipse cx="55" cy="94" rx="4" ry="9" fill="#93c5fd" stroke="#1d4ed8" strokeWidth="1" />
            <ellipse cx="125" cy="94" rx="4" ry="9" fill="#ffffff" stroke="#3b82f6" strokeWidth="1" />
            {/* Gold Ribbon Wrap */}
            <rect x="86" y="84" width="8" height="20" rx="1" fill="#f59e0b" stroke="#fef08a" strokeWidth="0.8" />
          </g>

          {/* --- TACTICAL PLAY CALLS: X X O & ROUTE ARROW --- */}
          <g transform="translate(82, 122)">
            {/* X 1 */}
            <path d="M 0,12 L 8,22 M 8,12 L 0,22" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            {/* X 2 */}
            <path d="M 14,12 L 22,22 M 22,12 L 14,22" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            {/* O */}
            <circle cx="33" cy="17" r="5" fill="none" stroke="#a855f7" strokeWidth="3" />
            {/* Play Route Arrow (Diagonal Upward) */}
            <path
              d="M 22,22 L 34,4 M 26,4 L 34,4 L 34,12"
              fill="none"
              stroke="#a3e635"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* --- GRIDIRON GATEWAY BRAND TYPOGRAPHY (at bottom of badge or full display) --- */}
        {variant !== "icon-only" && (
          <g transform="translate(100, 172)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1"
            >
              GRIDIRON
            </text>
            <text
              x="0"
              y="11"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="1.5"
            >
              GATEWAY
            </text>
          </g>
        )}
      </svg>

      {showText && (
        <div className={textClassName}>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              GRIDIRON
            </span>
            <span className="text-emerald-400 font-black text-2xl tracking-tight">GATEWAY</span>
          </div>
          <p className="text-[10px] text-amber-400 font-bold tracking-widest uppercase mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            Academia • Playbooks • NCAA Recruiting Hub
          </p>
        </div>
      )}
    </div>
  );
};
