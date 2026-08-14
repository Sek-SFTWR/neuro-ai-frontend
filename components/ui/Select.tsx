import type { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  small?: boolean;
  /** Fill the row (default) vs. size to content — for a compact inline
      dropdown next to a label. Passing `className="w-auto"` doesn't work
      here: Tailwind's generated CSS order, not the className string order,
      decides which same-specificity width utility wins, and w-full (below)
      consistently wins over an appended w-auto. Setting this prop instead
      lets the component pick the right class internally, with no cascade
      fight. */
  fullWidth?: boolean;
}

/** Fields are white with a hairline, exactly like every other control — never a grey box. */
export function Select({ options, small, fullWidth = true, className = '', ...rest }: SelectProps) {
  return (
    <select
      className={`ms-select ${fullWidth ? 'w-full' : 'w-auto'} bg-surface border border-line rounded-chip text-text font-medium appearance-none cursor-pointer transition-colors duration-180 hover:border-line-hover focus:border-accent focus:outline focus:outline-2 focus:outline-accent focus:-outline-offset-2 bg-no-repeat ${
        small
          ? 'py-[7px] pl-3 pr-[30px] text-xs bg-[right_10px_center]'
          : 'py-[11px] px-3.5 pr-[34px] text-[13px] bg-[right_12px_center]'
      } ${className}`}
      {...rest}
    >
      {options.map((op) => (
        <option key={op.value} value={op.value}>
          {op.label}
        </option>
      ))}
    </select>
  );
}
