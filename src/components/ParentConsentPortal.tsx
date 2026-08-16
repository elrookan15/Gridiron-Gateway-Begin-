import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, FileSignature, Loader2, Shield } from "lucide-react";

import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { bindConsentAthleteIdToSession } from "../lib/parentalConsentBind";
import {
  isParentalConsentPayloadValid,
  submitParentalConsent,
} from "../services/parentalConsentApi";
import type { GuardianRelationship } from "../types";

export interface ParentConsentPortalProps {
  athleteId: string;
  athleteName: string;
}

interface ConsentFormState {
  parentName: string;
  parentEmail: string;
  relationship: GuardianRelationship | "";
  coppaConsent: boolean;
  messagingConsent: boolean;
  biometricConsent: boolean;
  digitalSignature: string;
}

type ConsentToggleField = "coppaConsent" | "messagingConsent" | "biometricConsent";

export const ParentConsentPortal: React.FC<ParentConsentPortalProps> = ({
  athleteId,
  athleteName,
}) => {
  const [form, setForm] = useState<ConsentFormState>({
    parentName: "",
    parentEmail: "",
    relationship: "",
    coppaConsent: false,
    messagingConsent: false,
    biometricConsent: false,
    digitalSignature: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid =
    form.relationship !== "" &&
    isParentalConsentPayloadValid({
      athleteId,
      parentName: form.parentName,
      parentEmail: form.parentEmail,
      relationship: form.relationship,
      coppaConsent: form.coppaConsent,
      messagingConsent: form.messagingConsent,
      biometricConsent: form.biometricConsent,
      digitalSignature: form.digitalSignature,
    });

  const handleConsentToggle = (field: ConsentToggleField) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const submitConsent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || form.relationship === "") return;

    setIsSubmitting(true);
    setSubmitStatus("IDLE");
    setErrorMessage(null);

    if (!isSupabaseConfigured()) {
      setErrorMessage("Database connection missing. Cannot record legal consent.");
      setSubmitStatus("ERROR");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getUser();
      bindConsentAthleteIdToSession(athleteId, sessionData.user?.id);

      await submitParentalConsent({
        athleteId,
        parentName: form.parentName,
        parentEmail: form.parentEmail,
        relationship: form.relationship,
        coppaConsent: true,
        messagingConsent: true,
        biometricConsent: true,
        digitalSignature: form.digitalSignature,
      });
      setSubmitStatus("SUCCESS");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register consent. Please contact support.";
      setErrorMessage(message);
      setSubmitStatus("ERROR");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "SUCCESS") {
    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Authorization Verified</h2>
        <p className="text-sm text-slate-400 leading-relaxed font-mono">
          Legal consent for {athleteName} has been cryptographically logged. Collegiate coaching staffs may now
          initiate NCAA-compliant contact according to the active recruiting calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center gap-4">
        <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 shrink-0">
          <Shield className="w-6 h-6 text-amber-500" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight truncate">Minor Consent Portal</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Required for student-athletes under 18 years of age.
          </p>
        </div>
      </div>

      <form onSubmit={submitConsent} className="p-6 space-y-8">
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Guardian Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="parent-legal-name" className="text-xs font-bold text-slate-500 uppercase">
                Full Legal Name
              </label>
              <input
                id="parent-legal-name"
                type="text"
                value={form.parentName}
                onChange={(event) => setForm((prev) => ({ ...prev, parentName: event.target.value }))}
                className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="e.g. Jane Doe"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="parent-email" className="text-xs font-bold text-slate-500 uppercase">
                Email Address
              </label>
              <input
                id="parent-email"
                type="email"
                value={form.parentEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, parentEmail: event.target.value }))}
                className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="jane.doe@email.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="parent-relationship" className="text-xs font-bold text-slate-500 uppercase">
                Relationship to Athlete
              </label>
              <select
                id="parent-relationship"
                value={form.relationship}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    relationship: event.target.value as GuardianRelationship | "",
                  }))
                }
                className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 font-mono text-sm focus:border-cyan-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="" disabled>
                  Select Relationship...
                </option>
                <option value="MOTHER">Mother</option>
                <option value="FATHER">Father</option>
                <option value="LEGAL_GUARDIAN">Legal Guardian</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Required Authorizations
          </h3>
          <div className="space-y-3">
            <ConsentCheckbox
              label="COPPA Data Processing Acknowledgment"
              description="I consent to Gridiron Gateway collecting and storing the athlete's academic and athletic data."
              checked={form.coppaConsent}
              onClick={() => handleConsentToggle("coppaConsent")}
            />
            <ConsentCheckbox
              label="NCAA Direct Messaging Authorization"
              description="I authorize verified collegiate coaching staffs to contact the athlete via the platform's messaging portal."
              checked={form.messagingConsent}
              onClick={() => handleConsentToggle("messagingConsent")}
            />
            <ConsentCheckbox
              label="Biometric & Telemetry Release"
              description="I authorize the automated processing of TrueSpeed combine video and wearable telemetry data for scouting purposes."
              checked={form.biometricConsent}
              onClick={() => handleConsentToggle("biometricConsent")}
            />
          </div>
        </section>

        <section className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-mono leading-relaxed">
              By typing your full legal name below, you are executing a legally binding digital signature
              authorizing the release of a minor's information.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="parent-signature" className="text-xs font-bold text-slate-500 uppercase">
              Digital Signature (Must match Full Name exactly)
            </label>
            <div className="relative">
              <FileSignature className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              <input
                id="parent-signature"
                type="text"
                value={form.digitalSignature}
                onChange={(event) => setForm((prev) => ({ ...prev, digitalSignature: event.target.value }))}
                className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-3 text-emerald-400 font-mono text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="Type your name to sign..."
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        {submitStatus === "ERROR" && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-bold font-mono text-center">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full min-h-[44px] rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            isFormValid && !isSubmitting
              ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
          }`}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Execute Legal Consent"}
        </button>
      </form>
    </div>
  );
};

const ConsentCheckbox = ({
  label,
  description,
  checked,
  onClick,
}: {
  label: string;
  description: string;
  checked: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={checked}
    className="w-full text-left flex items-start gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 transition-colors min-h-[44px]"
  >
    <div
      className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
        checked ? "bg-emerald-500 border-emerald-500" : "bg-slate-900 border-slate-700"
      }`}
    >
      {checked && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
    </div>
    <div className="min-w-0">
      <p className={`text-sm font-bold ${checked ? "text-slate-200" : "text-slate-400"}`}>{label}</p>
      <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-relaxed">{description}</p>
    </div>
  </button>
);
