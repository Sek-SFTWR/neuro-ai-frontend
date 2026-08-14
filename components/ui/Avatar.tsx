import { initial } from '@/lib/palette';
import type { Persona } from '@/lib/types';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE: Record<AvatarSize, string> = {
  xs: 'w-[22px] h-[22px] text-[9px]',
  sm: 'w-[28px] h-[28px] text-[11px]',
  md: 'w-9 h-9 text-[13px]',
  lg: 'w-16 h-16 text-[22px]',
};

interface AvatarProps {
  persona?: Pick<Persona, 'name' | 'color' | 'photoUrl'> | null;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

/** One persona's initial-or-photo mark. */
export function Avatar({ persona, size = 'sm', ring, className = '' }: AvatarProps) {
  const p = persona || { name: '', color: '#6B7280', photoUrl: '' };
  const cls = `rounded-full flex items-center justify-center text-white font-semibold shrink-0 overflow-hidden ${SIZE[size]} ${
    ring ? 'border-2 border-surface' : ''
  } ${className}`;

  if (p.photoUrl) {
    return (
      <span className={cls} style={{ background: p.color || '#6B7280' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
      </span>
    );
  }

  return (
    <span className={cls} style={{ background: p.color || '#6B7280' }} title={p.name || ''}>
      {initial(p.name)}
    </span>
  );
}

export function AvatarGroup({ personas, size = 'xs', max = 4 }: { personas: Persona[]; size?: AvatarSize; max?: number }) {
  const shown = personas.slice(0, max);
  const rest = personas.length - shown.length;
  return (
    <span className="flex items-center [&>*+*]:-ml-1.5">
      {shown.map((p) => (
        <Avatar key={p.id} persona={p} size={size} ring />
      ))}
      {rest > 0 && (
        <span
          className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 border-2 border-surface ${SIZE[size]}`}
          style={{ background: '#9CA3AF' }}
        >
          +{rest}
        </span>
      )}
    </span>
  );
}
