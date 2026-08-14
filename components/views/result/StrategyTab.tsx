import { Icon, type IconName } from '@/components/Icon';
import { Hl } from '@/components/ui/Hl';
import { Panel } from '@/components/ui/Panel';
import type { EvaluationResult } from '@/lib/types';

const BREAKDOWN: { label: string; icon: IconName; key: 'target' | 'insight' | 'value' }[] = [
  { label: 'ターゲット', icon: 'target', key: 'target' },
  { label: 'インサイト', icon: 'brain', key: 'insight' },
  { label: '提供価値', icon: 'sparkles', key: 'value' },
];

export function StrategyTab({ res }: { res: EvaluationResult }) {
  const s = res.insights?.strategy;

  return (
    <div className="tab-body flex flex-col gap-4">
      <Panel
        title="戦略サマリー"
        shot={false}
        body={
          <>
            <div className="bg-fill rounded-chip p-4 flex flex-col gap-1.5 border border-accent">
              <span className="text-[11px] font-semibold text-accent tracking-[0.04em]">戦略 / STRATEGY</span>
              <span className="text-[15px] font-semibold leading-[1.6]"><Hl text={s?.oneLine} /></span>
            </div>
            <div className="grid grid-cols-1 min-[901px]:grid-cols-3 gap-3">
              {BREAKDOWN.map(({ label, icon, key }) => (
                <div key={key} className="bg-surface border border-line rounded-chip p-3 flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-text-sub">
                    <Icon name={icon} size={13} />{label}
                  </span>
                  <span className="text-[13px] leading-[1.75]"><Hl text={s?.[key]} /></span>
                </div>
              ))}
            </div>
          </>
        }
      />
      <Panel title="戦略詳細" shot={false} body={<p className="text-[12.5px] leading-[1.75] text-text"><Hl text={s?.detail} /></p>} />
    </div>
  );
}
