import { videoColor } from '@/lib/palette';

/**
 * Compare screens identify a video by colour + shape (●▲■◆★✚) at ~13px —
 * legible for 2-3 videos, not for 6. A numbered pill scales to any count and
 * reads instantly without memorising a glyph-to-video mapping.
 */
export function VideoBadge({ index, size = 'sm' }: { index: number; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-[11px]';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold text-white shrink-0 ${dim}`}
      style={{ background: videoColor(index) }}
    >
      {index + 1}
    </span>
  );
}
