'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { PersonaFilter } from '@/components/ui/PersonaFilter';
import { Select } from '@/components/ui/Select';
import { Equalizer } from '@/components/charts/Equalizer';
import { useStore } from '@/lib/store';
import { personaById, shownEvals } from '@/lib/selectors';
import { clock } from '@/lib/palette';
import { grad } from '@/lib/resultDisplay';
import type { EvaluationResult } from '@/lib/types';

interface Bubble {
  sec: number;
  personaId: string;
  side: 'left' | 'right';
}

export function PlaybackTab({ res }: { res: EvaluationResult }) {
  const { state, patch } = useStore();
  const dur = res.meta.durationSec;
  const isYt = res.mode === 'youtube' && !!res.meta.watchUrl;

  const [sec, setSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const lastBubbleSec = useRef(-1);
  const bubblesEndRef = useRef<HTMLDivElement>(null);

  /* Reset local playback position whenever a different result is opened. */
  useEffect(() => {
    setSec(0);
    setPlaying(false);
    setBubbles([]);
    lastBubbleSec.current = -1;
  }, [res]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setSec((s) => (s + 1) % dur), 1000);
    return () => clearInterval(t);
  }, [playing, dur]);

  const shown = shownEvals(state, res);

  useEffect(() => {
    if (sec === lastBubbleSec.current) return;
    const wrapped = sec < lastBubbleSec.current;
    lastBubbleSec.current = sec;
    if (!shown.length) return;
    const e = shown[sec % shown.length];
    const side: Bubble['side'] = sec % 2 ? 'right' : 'left';
    setBubbles((bs) => (wrapped ? [] : bs).concat({ sec, personaId: e.personaId, side }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec]);

  useEffect(() => {
    bubblesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [bubbles]);

  const sc = res.scenes[sec];
  const findPersona = (id: string) => personaById(state, id);

  return (
    <div className="tab-body flex flex-col gap-4">
      <PersonaFilter res={res} />
      <Panel
        title="再生＆ペルソナ連動イコライザー"
        sub="動画のシーク位置（秒）に同期して、各ペルソナのスコアを1本の棒で表示します（0〜1秒＝1秒目）。"
        body={
          <>
            {isYt && (
              <div className="flex items-center gap-2 text-xs text-text-sub">
                表示:
                <Select
                  small
                  fullWidth={false}
                  value={state.playbackMode}
                  onChange={(e) => patch({ playbackMode: e.target.value as 'youtube' | 'gaze' })}
                  options={[
                    { value: 'youtube', label: 'YouTube動画' },
                    { value: 'gaze', label: '視線情報（タイムライン画像をパラパラ再生）' },
                  ]}
                />
              </div>
            )}

            <div className="grid grid-cols-1 min-[1001px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-4">
              <div>
                <div className="bg-[#0A0A0A] rounded-chip overflow-hidden relative flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  <div className="w-full h-full flex items-center justify-center text-white/85 text-[13px] text-center p-4" style={{ background: sc?.image ? '#000' : grad(sec) }}>
                    {sc?.label || ''}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    size="sm"
                    onClick={() => setPlaying((p) => !p)}
                  >
                    <Icon name={playing ? 'pauseCircle' : 'playCircle'} size={15} />{playing ? '一時停止' : '再生'}
                  </Button>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, dur - 1)}
                    value={sec}
                    aria-label="再生位置"
                    onChange={(e) => setSec(Number(e.target.value))}
                    className="ms-range flex-1 appearance-none h-1.5 rounded-full bg-track cursor-pointer"
                  />
                  <span className="text-xs text-text-sub whitespace-nowrap">{clock(sec)} / {clock(dur)}</span>
                </div>
              </div>

              <div className="bg-fill rounded-chip p-3 flex flex-col gap-2" style={{ minHeight: 320 }}>
                <div className="flex items-center gap-2 text-xs text-text-sub">
                  <span>{clock(sec)} / {clock(dur)}（{sec + 1}秒目）</span>
                  <Select
                    small
                    fullWidth={false}
                    value={state.eqView}
                    onChange={(e) => patch({ eqView: e.target.value as 'eq' | 'bubble' })}
                    className="ml-auto"
                    options={[
                      { value: 'eq', label: 'イコライザー' },
                      { value: 'bubble', label: '吹き出し' },
                    ]}
                  />
                </div>
                {state.eqView === 'eq' ? (
                  <Equalizer evs={shown} findPersona={findPersona} sec={sec} theme={state.theme} />
                ) : (
                  <div className="flex-1 min-h-[240px] max-h-[340px] overflow-y-auto flex flex-col gap-2.5 pr-1">
                    {!shown.length && <p className="text-xs text-text-sub">表示するペルソナがありません</p>}
                    {bubbles.map((b, i) => {
                      const p = personaById(state, b.personaId);
                      const t = res.evaluations.find((e) => e.personaId === b.personaId)?.timeline[b.sec];
                      if (!p) return null;
                      return (
                        <div key={i} className={`flex items-start gap-2 max-w-[88%] ${b.side === 'right' ? 'self-end flex-row-reverse' : ''}`}>
                          <Avatar persona={p} size="xs" />
                          <div>
                            <div className="text-[10.5px] text-text-mute mb-0.5">{p.name}・{clock(b.sec)}</div>
                            <div className="bg-surface rounded-chip py-2 px-3 text-xs leading-[1.6] shadow-card">{t ? t.comment : '（この秒のコメントはありません）'}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bubblesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </>
        }
      />
    </div>
  );
}
