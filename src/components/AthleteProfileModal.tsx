import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  getAthleteProfileFull,
  type AthleteFullProfile,
} from "../services/schoolsApi";
import { Loader2, X } from "lucide-react";

interface AthleteProfileModalProps {
  isOpen: boolean;
  athleteId: string | null;
  onClose: () => void;
}

function formatHeight(inches: number | null): string {
  if (inches == null || !Number.isFinite(inches) || inches <= 0) return "--";
  const whole = Math.floor(inches);
  const feet = Math.floor(whole / 12);
  const rem = whole % 12;
  return `${feet}'${rem}"`;
}

function formatWeight(lbs: number | null): string {
  if (lbs == null || !Number.isFinite(lbs) || lbs <= 0) return "--";
  return `${lbs} lbs`;
}

function formatForty(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "--";
  return `${seconds.toFixed(2)}s`;
}

function formatVertical(inches: number | null): string {
  if (inches == null || !Number.isFinite(inches) || inches <= 0) return "--";
  return `${inches}"`;
}

export const AthleteProfileModal: React.FC<AthleteProfileModalProps> = ({
  isOpen,
  athleteId,
  onClose,
}) => {
  const [profile, setProfile] = useState<AthleteFullProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Escape, focus restore, scroll lock (client-only — hydration safe)
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      // Lightweight focus trap within the dialog
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Defer focus until after paint so the close control is mounted
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, handleClose]);

  // Fetch when opened with a valid athlete id
  useEffect(() => {
    let cancelled = false;

    if (!isOpen || !athleteId) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);

    void getAthleteProfileFull(athleteId)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        if (!data) {
          setError("Profile data unavailable.");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load athlete profile.";
        setError(message);
        setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, athleteId]);

  if (!isOpen) return null;

  const displayName = loading
    ? "Loading…"
    : profile
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : "Athlete Profile";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={handleClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4 p-5 sm:p-6 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight truncate"
            >
              {displayName}
            </h2>
            {!loading && profile && (
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 font-mono text-sm font-bold rounded border border-cyan-500/20">
                  {profile.position_tier || "ATH"}
                </span>
                <span className="text-amber-400 text-sm font-bold tracking-widest shrink-0">
                  {"★".repeat(Math.min(Math.max(profile.star_rating ?? 0, 0), 5))}
                </span>
              </div>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white transition-colors shrink-0 rounded-xl hover:bg-slate-800 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-950">
          {loading ? (
            <div className="space-y-6" aria-busy="true" aria-live="polite">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-6">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400 shrink-0" />
                Syncing verified profile…
              </div>
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-slate-800 rounded-xl border border-slate-800" />
                <div className="h-40 bg-slate-800 rounded-xl border border-slate-800" />
              </div>
            </div>
          ) : profile ? (
            <div className="space-y-8">
              <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Height" value={formatHeight(profile.height_inches)} />
                <StatCard label="Weight" value={formatWeight(profile.weight_lbs)} />
                <StatCard label="40-Yard" value={formatForty(profile.forty_yard_dash)} />
                <StatCard label="Vertical" value={formatVertical(profile.vertical_jump_inches)} />
              </section>

              {profile.media &&
                (profile.media.hudl_link ||
                  profile.media.youtube_link ||
                  profile.media.twitter_handle ||
                  profile.media.instagram_handle) && (
                  <section>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Verified Media
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.media.hudl_link && (
                        <MediaBadge
                          label="Hudl Film"
                          url={profile.media.hudl_link}
                          color="text-orange-400 bg-orange-400/10 border-orange-400/20"
                        />
                      )}
                      {profile.media.youtube_link && (
                        <MediaBadge
                          label="YouTube"
                          url={profile.media.youtube_link}
                          color="text-rose-400 bg-rose-400/10 border-rose-400/20"
                        />
                      )}
                      {profile.media.twitter_handle && (
                        <MediaBadge
                          label={`@${profile.media.twitter_handle}`}
                          url={`https://x.com/${encodeURIComponent(profile.media.twitter_handle.replace(/^@/, ""))}`}
                          color="text-sky-400 bg-sky-400/10 border-sky-400/20"
                        />
                      )}
                      {profile.media.instagram_handle && (
                        <MediaBadge
                          label={`@${profile.media.instagram_handle}`}
                          url={`https://instagram.com/${encodeURIComponent(profile.media.instagram_handle.replace(/^@/, ""))}`}
                          color="text-purple-400 bg-purple-400/10 border-purple-400/20"
                        />
                      )}
                    </div>
                  </section>
                )}

              <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Active Offers ({profile.offers.length})
                </h3>
                {profile.offers.length === 0 ? (
                  <p className="text-sm text-slate-500 font-mono">
                    No verified offers reported yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {profile.offers.map((offer) => (
                      <li
                        key={offer.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-3 h-10 rounded-sm shrink-0"
                            style={{
                              backgroundColor: offer.school?.primary_color || "#334155",
                            }}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-200 truncate">
                              {offer.school?.name || "School not verified"}
                            </p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              Offered on{" "}
                              {Number.isNaN(Date.parse(offer.offer_date))
                                ? offer.offer_date
                                : new Date(offer.offer_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {offer.is_official && (
                            <span className="px-2 py-1.5 min-h-[40px] inline-flex items-center text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded uppercase">
                              Official
                            </span>
                          )}
                          <span className="px-2 py-1.5 min-h-[40px] inline-flex items-center text-[10px] font-bold tracking-widest text-slate-400 bg-slate-800 rounded uppercase">
                            {offer.commitment_status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3" role="alert">
              <p className="text-slate-400 font-mono text-sm">
                {error || "Profile data unavailable."}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[88px]">
    <span className="text-xs text-slate-500 font-mono mb-1">{label}</span>
    <span className="text-lg font-bold text-slate-100 font-mono">{value}</span>
  </div>
);

const MediaBadge: React.FC<{ label: string; url: string; color: string }> = ({
  label,
  url,
  color,
}) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className={`px-3 py-1.5 text-xs font-bold font-mono border rounded-xl min-h-[44px] flex items-center justify-center transition-opacity hover:opacity-80 ${color}`}
  >
    {label}
  </a>
);
