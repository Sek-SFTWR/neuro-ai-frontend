import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

const FIELD_BASE =
  'w-full bg-surface border border-line rounded-chip py-[11px] px-3.5 text-[13px] font-medium text-text transition-colors duration-180 placeholder:text-text-mute placeholder:font-normal hover:border-line-hover focus:border-accent focus:outline focus:outline-2 focus:outline-accent focus:-outline-offset-2';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...rest },
  ref,
) {
  return <input ref={ref} className={`${FIELD_BASE} ${className}`} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = '', ...rest },
  ref,
) {
  return <textarea ref={ref} className={`${FIELD_BASE} min-h-[110px] resize-y leading-[1.65] ${className}`} {...rest} />;
});

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-text-sub">{label}</span>
      {children}
    </label>
  );
}

/** Checkbox with the accent-filled checked state, ported from .check. */
export function Checkbox({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={`relative inline-flex w-4 h-4 shrink-0 ${className}`}>
      <input
        type="checkbox"
        className="peer appearance-none w-4 h-4 rounded-xs border-[1.5px] border-[#D4D4D8] bg-surface cursor-pointer transition-colors duration-180 hover:border-text-mute checked:bg-accent checked:border-accent"
        {...rest}
      />
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute inset-0 w-4 h-4 opacity-0 peer-checked:opacity-100"
        aria-hidden="true"
      >
        <path d="M4 8.2l2.6 2.6L12 5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
