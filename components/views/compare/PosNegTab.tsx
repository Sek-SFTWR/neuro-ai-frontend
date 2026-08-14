import { Avatar } from '@/components/ui/Avatar';
import { Panel } from '@/components/ui/Panel';
import { VideoBadge } from '@/components/ui/VideoBadge';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import type { CompareResult, PosNegRow } from '@/lib/types';

const PN_COLS: { label: string; key: keyof PosNegRow; bg: string }[] = [
  { label: '高評価な点', key: 'good', bg: 'bg-green-bg' },
  { label: '改善してほしい点', key: 'bad', bg: 'bg-orange-bg' },
  { label: '改善案', key: 'improve', bg: 'bg-blue-bg' },
];

export function PosNegTab({ cmp }: { cmp: CompareResult }) {
  const { state } = useStore();
  const primary = cmp.results[0];

  return (
    <div className="tab-body flex flex-col gap-4">
      {PN_COLS.map((col) => (
        <Panel
          key={col.key}
          title={col.label}
          sub="表頭＝動画／行＝ペルソナ。動画間で同じ観点を横並びで比較できます。"
          body={
            <div className="table-wrap overflow-x-auto rounded-panel border border-line">
              <table className="matrix text-[13px] min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line">ペルソナ</th>
                    {cmp.results.map((r, i) => (
                      <th key={i} className="text-left text-xs font-semibold text-text-sub bg-fill py-[11px] px-3 border-b border-line">
                        <span className="flex items-center gap-1.5"><VideoBadge index={i} />{r.meta.title}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shownEvals(state, primary).map((pe) => {
                    const p = personaById(state, pe.personaId);
                    if (!p) return null;
                    return (
                      <tr key={pe.personaId} className="transition-colors duration-180 hover:bg-surface-hover">
                        <td className="py-3 px-3 border-b border-line align-top"><span className="flex items-center gap-2 font-medium whitespace-nowrap"><Avatar persona={p} size="xs" />{p.name}</span></td>
                        {cmp.results.map((r, i) => {
                          const row = r.posneg?.rows.find((x) => x.personaId === pe.personaId);
                          return <td key={i} className={`py-3 px-3 border-b border-line align-top text-xs leading-[1.65] ${col.bg}`}>{row ? row[col.key] : '—'}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          }
        />
      ))}
    </div>
  );
}
