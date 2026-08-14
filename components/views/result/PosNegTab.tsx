import { Avatar } from '@/components/ui/Avatar';
import { Hl } from '@/components/ui/Hl';
import { Panel } from '@/components/ui/Panel';
import { PersonaFilter } from '@/components/ui/PersonaFilter';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import type { EvaluationResult } from '@/lib/types';

function PosNegBody({ res }: { res: EvaluationResult }) {
  const { state } = useStore();
  const pn = res.posneg;

  if (!pn) {
    return (
      <div className="flex items-center gap-2.5 py-6 justify-center">
        <span className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin-fast" />
        <span className="text-xs text-text-sub">AIが各ペルソナ視点で生成しています…</span>
      </div>
    );
  }

  const rows = shownEvals(state, res).map((e) => {
    const p = personaById(state, e.personaId);
    const r = pn.rows.find((x) => x.personaId === e.personaId);
    return { p, r };
  });

  return (
    <>
      {pn.summary && (
        <div className="bg-fill rounded-chip p-3 text-[12.5px] leading-[1.75]">
          <span className="block text-[11px] font-semibold text-text-sub mb-1">統括の読み解き</span>
          <Hl text={pn.summary} />
        </div>
      )}
      <div className="table-wrap overflow-x-auto rounded-panel border border-line">
        <table className="table text-[13px] min-w-full">
          <thead>
            <tr>
              {['ペルソナ', '高評価な点', '改善してほしい点', '改善案'].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 whitespace-nowrap border-b border-line">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, r }, i) => p && (
              <tr key={i} className="transition-colors duration-180 hover:bg-surface-hover">
                <td className="py-3 px-3 border-b border-line align-top"><span className="flex items-center gap-2 font-medium whitespace-nowrap"><Avatar persona={p} size="xs" />{p.name}</span></td>
                <td className="py-3 px-3 border-b border-line align-top text-xs leading-[1.65] border-l-[3px] border-l-green bg-green-bg/45">{r?.good || '—'}</td>
                <td className="py-3 px-3 border-b border-line align-top text-xs leading-[1.65] border-l-[3px] border-l-orange bg-orange-bg/45">{r?.bad || '—'}</td>
                <td className="py-3 px-3 border-b border-line align-top text-xs leading-[1.65] border-l-[3px] border-l-blue bg-blue-bg/45">{r?.improve || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function PosNegTab({ res }: { res: EvaluationResult }) {
  return (
    <div className="tab-body flex flex-col gap-4">
      <PersonaFilter res={res} />
      <Panel title="ポジネガ（ペルソナ別FA）" sub="各ペルソナ本人の視点での自由回答です。" body={<PosNegBody res={res} />} />
    </div>
  );
}
