import { Hl } from '@/components/ui/Hl';
import { Panel } from '@/components/ui/Panel';
import { VideoBadge } from '@/components/ui/VideoBadge';
import { overallScore } from '@/lib/mock-data';
import type { CompareResult } from '@/lib/types';

export function SummaryTab({ cmp }: { cmp: CompareResult }) {
  return (
    <div className="tab-body">
      <Panel
        title="比較サマリー"
        body={
          <>
            <div className="bg-fill rounded-chip p-3 text-[12.5px] leading-[1.75]">
              <Hl text={cmp.cmp.summary || '比較講評を生成できませんでした。'} />
            </div>
            <div className="grid grid-cols-1 min-[260px]:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
              {cmp.results.map((r, i) => {
                const pv = cmp.cmp.perVideo[i];
                const score = overallScore(r);
                return (
                  <div key={i} className="border border-line rounded-chip p-3 flex flex-col gap-2">
                    <div className="text-[12.5px] font-semibold flex items-center gap-1.5">
                      <VideoBadge index={i} />
                      <span className="truncate">{r.meta.title}</span>
                    </div>
                    <div className="flex items-baseline gap-1"><span className="text-2xl font-bold">{score}</span><span className="text-[13px] text-text-sub">/100</span></div>
                    {pv?.strengths && <div><span className="text-[11px] font-semibold text-text-sub">良い点</span><div className="text-xs leading-[1.7]">{pv.strengths}</div></div>}
                    {pv?.weaknesses && <div><span className="text-[11px] font-semibold text-text-sub">課題</span><div className="text-xs leading-[1.7]">{pv.weaknesses}</div></div>}
                  </div>
                );
              })}
            </div>
          </>
        }
      />
    </div>
  );
}
