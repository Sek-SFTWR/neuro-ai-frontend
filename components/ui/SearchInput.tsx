'use client';

import { Icon } from '@/components/Icon';

export function SearchInput({
  value, onChange, placeholder, className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={`relative flex-1 min-w-[180px] ${className}`}>
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none">
        <Icon name="search" size={14} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-line rounded-chip py-[9px] pl-9 pr-8 text-[13px] font-medium text-text transition-colors duration-180 placeholder:text-text-mute placeholder:font-normal hover:border-line-hover focus:border-accent focus:outline focus:outline-2 focus:outline-accent focus:-outline-offset-2"
      />
      {value && (
        <button
          type="button"
          aria-label="検索をクリア"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-mute p-0.5 rounded-full transition-colors duration-180 hover:text-text hover:bg-fill"
        >
          <Icon name="x" size={13} />
        </button>
      )}
    </div>
  );
}
