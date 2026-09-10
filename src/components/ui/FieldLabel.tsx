/**
 * FieldLabel — the accessible form-label atom of the Gridiron design system.
 * Drop-in replacement for the legacy UserProfileEditor local component;
 * adds an optional required indicator and hint text without changing any
 * existing call site.
 */
import * as React from "react";

export interface FieldLabelProps {
  htmlFor: string;
  /** Marks the field visually; real requiredness stays on the input
   *  (aria-required), the asterisk itself is aria-hidden. */
  required?: boolean;
  /** Optional helper text rendered under the label with a stable id
   *  (`<htmlFor>-hint`) so inputs can wire it via aria-describedby. */
  hint?: string;
  children: React.ReactNode;
}

export function FieldLabel({ htmlFor, required, hint, children }: FieldLabelProps) {
  return (
    <div className="mb-1">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
      >
        {children}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-rose-500">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${htmlFor}-hint`} className="text-[10px] text-slate-400 -mt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}

export default FieldLabel;
