'use client';

import { useId, useState, type InputHTMLAttributes } from 'react';
import { Icon } from '@/components/Icon';
import { useT } from '@/lib/i18n';

/* The auth fields cannot reuse ui/Input directly: they need a per-field
   invalid state and, for passwords, a reveal button that has to reserve
   its own lane inside the border. Everything else — the radius, the 11px
   vertical rhythm, the accent focus ring — is the same recipe. */
const BASE =
  'w-full bg-surface border rounded-chip py-[11px] pl-3.5 text-[13px] font-medium text-text transition-colors duration-180 placeholder:text-text-mute placeholder:font-normal hover:border-line-hover focus:outline focus:outline-2 focus:-outline-offset-2';

const STATE = {
  normal: 'border-line focus:border-accent focus:outline-accent',
  invalid: 'border-pri-high focus:border-pri-high focus:outline-pri-high',
};

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  invalid?: boolean;
  error?: string;
  /** Renders the show/hide toggle and drives the type between text/password. */
  password?: boolean;
};

export function AuthField({ label, invalid, error, password, className = '', ...rest }: FieldProps) {
  const t = useT();
  const [reveal, setReveal] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const bad = invalid || !!error;

  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-text-sub">{label}</span>

      <span className="relative block mt-1.5">
        <input
          {...rest}
          type={password ? (reveal ? 'text' : 'password') : rest.type}
          aria-invalid={bad || undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${BASE} ${bad ? STATE.invalid : STATE.normal} ${password ? 'pr-11' : 'pr-3.5'}`}
        />
        {password && (
          /* The reveal toggle lives inside the field, so the control that acts
             on the value sits with the value. */
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={t(reveal ? 'login.hidePassword' : 'login.showPassword')}
            aria-pressed={reveal}
            title={t(reveal ? 'login.hidePassword' : 'login.showPassword')}
            className={`absolute top-1/2 right-1 -translate-y-1/2 w-8 h-8 rounded-sm flex items-center justify-center transition-colors duration-180 hover:bg-fill ${
              reveal ? 'text-accent' : 'text-text-mute hover:text-text-sub'
            }`}
          >
            <Icon name="eye" size={15} />
          </button>
        )}
      </span>

      {/* Field-level errors sit with their field; the form-level error stays at
          the foot of the card. */}
      {error && (
        <span id={errorId} role="alert" className="flex items-start gap-1.5 mt-1.5 text-xs font-medium text-pri-high leading-[1.5]">
          <Icon name="alert" size={12} className="mt-0.5" />
          {error}
        </span>
      )}
    </label>
  );
}
