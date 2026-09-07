/**
 * AuthManager — email/password session gate for coach RLS testing.
 * Uses supabase-js v2 session persistence; JWTs auto-attach to PostgREST.
 */
import React, { useEffect, useId, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { KeyRound, Loader2, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";

interface TestCredential {
  label: string;
  email: string;
  password: string;
  school: string;
}

/** Dev-only coach accounts for RLS / Kanban scoping verification. */
const TEST_CREDENTIALS: readonly TestCredential[] = [
  {
    label: "Coach Saban",
    email: "saban@alabama.coach",
    password: "Gridiron2026!",
    school: "Alabama (fbs-alabama)",
  },
  {
    label: "Coach Sarkisian",
    email: "sarkisian@texas.coach",
    password: "Gridiron2026!",
    school: "Texas (fbs-texas)",
  },
] as const;

type AuthViewState = "checking" | "signed_out" | "signed_in" | "misconfigured";

export const AuthManager: React.FC = () => {
  const [viewState, setViewState] = useState<AuthViewState>("checking");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setViewState("misconfigured");
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        setErrorMessage(error.message);
        setSession(null);
        setUser(null);
        setViewState("signed_out");
        return;
      }
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setViewState(data.session ? "signed_in" : "signed_out");
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setViewState(nextSession ? "signed_in" : "signed_out");
      if (nextSession) {
        setErrorMessage(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleFillCredential = (cred: TestCredential) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setInfoMessage(`Filled ${cred.label} — ${cred.school}. Submit to sign in.`);
    setErrorMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Sign-out failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reserved min-height shell avoids CLS across auth state flips
  return (
    <section
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl min-h-[220px]"
      aria-label="Coach authentication"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Supabase Auth · JWT Session
          </div>
          <h2 className="text-lg font-extrabold text-white truncate">Coach Auth Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sign in so RecruitingPipeline queries carry a real JWT for RLS.
          </p>
        </div>
        <KeyRound className="w-5 h-5 text-cyan-400 shrink-0" aria-hidden />
      </div>

      {viewState === "checking" && (
        <div
          className="flex items-center justify-center gap-2 text-slate-400 text-sm min-h-[120px]"
          aria-busy="true"
          aria-live="polite"
        >
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400 shrink-0" />
          Checking session…
        </div>
      )}

      {viewState === "misconfigured" && (
        <div
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200 min-h-[120px] flex items-center"
          role="alert"
        >
          Set <code className="font-mono text-xs mx-1">VITE_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs mx-1">VITE_SUPABASE_ANON_KEY</code> to enable auth.
        </div>
      )}

      {viewState === "signed_in" && user && (
        <div className="space-y-4 min-h-[120px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <UserRound className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Logged in as
                </p>
                <p className="text-sm font-bold text-emerald-300 truncate">
                  {user.email ?? "Unknown email"}
                </p>
                {session?.expires_at != null && (
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    JWT expires {new Date(session.expires_at * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={submitting}
              className="min-h-[44px] px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <LogOut className="w-4 h-4 shrink-0" />
              )}
              Logout
            </button>
          </div>
          {errorMessage && (
            <p id={errorId} className="text-xs text-rose-400 font-mono" role="alert" aria-live="assertive">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {viewState === "signed_out" && (
        <div className="space-y-4">
          <form onSubmit={(e) => void handleSignIn(e)} className="space-y-3" noValidate={false}>
            <div>
              <label htmlFor={emailId} className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email
              </label>
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="coach@program.edu"
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? errorId : undefined}
              />
            </div>
            <div>
              <label htmlFor={passwordId} className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <input
                id={passwordId}
                type="password"
                name="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="••••••••"
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={errorMessage ? errorId : undefined}
              />
            </div>

            <div className="min-h-[20px]" aria-live="assertive">
              {errorMessage && (
                <p id={errorId} className="text-xs text-rose-400 font-mono" role="alert">
                  {errorMessage}
                </p>
              )}
              {!errorMessage && infoMessage && (
                <p className="text-xs text-cyan-300/90 font-mono" role="status">
                  {infoMessage}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <LogIn className="w-4 h-4 shrink-0" />
              )}
              Sign In
            </button>
          </form>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Test Credentials
            </p>
            <p className="text-xs text-slate-400">
              Use the Saban / Sarkisian coach accounts seeded in Supabase Auth to verify RLS on the Kanban board.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEST_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleFillCredential(cred)}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                >
                  <span className="block text-xs font-bold text-white truncate">{cred.label}</span>
                  <span className="block text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {cred.email}
                  </span>
                  <span className="block text-[10px] text-amber-400/80 truncate mt-0.5">
                    {cred.school}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AuthManager;
