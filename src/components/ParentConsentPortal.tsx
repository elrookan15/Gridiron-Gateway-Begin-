// src/components/ParentConsentPortal.tsx
import React, { useState } from 'react';
import { MinorSafetyStatus } from '../types';

export const ParentConsentPortal: React.FC = () => {
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [coppaWaived, setCoppaWaived] = useState(false);
  const [milestonesAgreed, setMilestonesAgreed] = useState(false);
  const [status, setStatus] = useState<MinorSafetyStatus>('PENDING_CONSENT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConsentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coppaWaived || !milestonesAgreed) {
      alert("You must agree to both terms before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // ⚠️ COMPLIANCE-SENSITIVE: This component submits to POST /api/v1/compliance/parent-consent. Both checkboxes are enforced in React (not relying on HTML required attribute which is not enforced in React form submit handlers). Review required before production deployment.
      const response = await fetch('/api/v1/compliance/parent-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guardianName, guardianEmail })
      });
      
      if (!response.ok) {
        throw new Error("Consent failed");
      }
      
      setStatus('CONSENT_GRANTED');
    } catch (err) {
      setStatus('CONSENT_DENIED');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-[500px] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 sm:p-8 shadow-2xl max-w-lg w-full">
        <h2 className="text-2xl font-bold font-jakarta text-slate-100 mb-2 uppercase tracking-wide">
          Parent & Guardian Portal
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Secure COPPA/FERPA compliance and RallySafe NIL escrow consent sign-off for minor student-athletes.
        </p>

        {status === 'CONSENT_GRANTED' ? (
          <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-6 text-center space-y-3 animate-fade-in">
            <span className="text-emerald-400 text-4xl block">🛡️</span>
            <h3 className="text-emerald-400 font-bold font-jakarta text-lg uppercase tracking-wide">Consent Verified</h3>
            <p className="text-slate-300 text-sm">
              Escrow milestone disclosures and direct communications have been securely authorized.
            </p>
          </div>
        ) : status === 'CONSENT_DENIED' ? (
          <div className="bg-rose-400/10 border border-rose-400/20 rounded-xl p-6 text-center space-y-3 animate-fade-in">
            <span className="text-rose-400 text-4xl block">⚠️</span>
            <h3 className="text-rose-400 font-bold font-jakarta text-lg uppercase tracking-wide">Consent Denied</h3>
            <p className="text-slate-300 text-sm">
              There was an error processing your consent. Please try again or contact support.
            </p>
            <button 
              onClick={() => setStatus('PENDING_CONSENT')}
              className="mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-4 rounded-xl"
            >
              Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleConsentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 font-bold uppercase">LEGAL GUARDIAN NAME</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 font-mono focus:border-purple-400 focus:outline-none transition-colors"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Derrick Vance Sr."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 font-bold uppercase">GUARDIAN EMAIL</label>
              <input 
                type="email" 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 font-mono focus:border-purple-400 focus:outline-none transition-colors"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="e.g. derrick.sr@example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-3 mt-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input type="checkbox" className="sr-only" required checked={coppaWaived} onChange={(e) => setCoppaWaived(e.target.checked)} disabled={isSubmitting} />
                  <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${coppaWaived ? 'bg-purple-500 border-purple-500' : 'bg-slate-950 border-slate-700 group-hover:border-purple-400'}`}>
                    {coppaWaived && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-slate-300 select-none">I acknowledge and grant COPPA/FERPA consent for direct coaching messaging and athletic telemetry collection.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input type="checkbox" className="sr-only" required checked={milestonesAgreed} onChange={(e) => setMilestonesAgreed(e.target.checked)} disabled={isSubmitting} />
                  <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${milestonesAgreed ? 'bg-amber-500 border-amber-500' : 'bg-slate-950 border-slate-700 group-hover:border-amber-400'}`}>
                    {milestonesAgreed && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-slate-300 select-none">I have reviewed and authorize the RallySafe NIL micro-campaign escrow conditions and milestone payouts.</span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-jakarta uppercase tracking-wide py-4 rounded-xl min-h-[44px] transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Sign & Authorize"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
