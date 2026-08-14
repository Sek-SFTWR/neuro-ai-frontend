'use client';

import { Textarea } from '@/components/ui/Input';
import { useStore } from '@/lib/store';

export const INSTRUCTION_MAX = 1000;

/**
 * Extra wording appended to the analysis prompt for this run — the place to
 * say "focus on the first three seconds" or "judge it as a store-front ad"
 * without that becoming a new evaluation axis.
 *
 * It lives on the run rather than in settings: an instruction that made sense
 * for one video is rarely right for the next, and a standing one silently
 * shaping every future run is exactly the sort of thing nobody remembers
 * setting. The counter is there because a prompt fragment has a budget.
 */
export function InstructionInput() {
  const { state, patch } = useStore();
  const value = state.instruction;

  return (
    <div className="flex flex-col gap-1.5">
      <Textarea
        value={value}
        maxLength={INSTRUCTION_MAX}
        onChange={(e) => patch({ instruction: e.target.value })}
        placeholder="例：冒頭3秒のつかみを重点的に見てください。店頭で流す前提で評価してください。"
        className="min-h-[84px]"
      />
      <div className="flex items-center gap-3 text-[11px] text-text-mute">
        <span className="flex-1">評価プロンプトの末尾に追加されます。空欄の場合は既定のプロンプトのみを使用します。</span>
        <span className={`shrink-0 tabular-nums ${value.length >= INSTRUCTION_MAX ? 'text-pri-high font-medium' : ''}`}>
          {value.length}/{INSTRUCTION_MAX}
        </span>
      </div>
    </div>
  );
}
