import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'outline' | 'black' | 'ai' | 'accent' | 'danger';
type Size = 'md' | 'sm' | 'xs';

const VARIANT: Record<Variant, string> = {
  outline:
    'bg-surface border border-line text-text hover:bg-surface-hover hover:border-line-hover',
  black: 'bg-black-ms text-white font-semibold hover:bg-black-hover',
  ai: 'bg-[linear-gradient(180deg,#F76A32_0%,#F4581F_100%)] text-white font-semibold hover:bg-accent-hover',
  accent: 'bg-accent text-white font-semibold hover:bg-accent-hover',
  danger: 'bg-surface border border-line text-pri-high hover:bg-pri-high-bg',
};

const SIZE: Record<Size, string> = {
  md: 'h-(--btn-h) px-5 text-[13px]',
  sm: 'h-(--btn-h-sm) px-4 text-xs',
  xs: 'h-(--btn-h-xs) px-3 text-[11px] gap-1',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

/** Pills on the same scale as every other control: height is a token, never
    the sum of an ad-hoc vertical padding. */
export function Button({ variant = 'outline', size = 'md', disabled, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,color,border-color,transform] duration-180 active:scale-[0.97] ${SIZE[size]} ${
        disabled
          ? 'bg-fill! text-text-mute! border-transparent! shadow-none! pointer-events-none'
          : VARIANT[variant]
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** A Button squared off to its own height — the compact form of a labelled
    action for rows that have run out of width. The label it drops still has to
    reach the user, so `label` is required and becomes both the accessible name
    and the native tooltip. */
export function IconButton({
  label, variant = 'outline', size = 'sm', className = '', children, ...rest
}: ButtonProps & { label: string }) {
  const square = size === 'md' ? 'w-(--btn-h)' : size === 'sm' ? 'w-(--btn-h-sm)' : 'w-(--btn-h-xs)';
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      className={`px-0! ${square} ${className}`}
      {...rest}
    >
      {children}
    </Button>
  );
}

/** Text-only action link (btn-link). */
export function LinkButton({
  danger, className = '', children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      type="button"
      className={`text-xs font-medium px-1.5 py-1 rounded-sm transition-colors duration-180 ${
        danger ? 'text-pri-high hover:bg-pri-high-bg' : 'text-text-sub hover:text-text hover:bg-fill'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Three-dot overflow trigger (dots-btn). */
export function DotsButton({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="その他の操作"
      className={`text-text-mute p-0.5 rounded-sm flex shrink-0 transition-colors duration-180 hover:text-text hover:bg-fill ${className}`}
      {...rest}
    />
  );
}
