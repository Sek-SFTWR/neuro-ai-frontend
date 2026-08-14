'use client';

import { useEffect, useRef } from 'react';
import { hexA } from '@/lib/palette';
import type { Evaluation, Persona } from '@/lib/types';

function roundTopRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

/** One rounded-top bar per shown persona, smoothed toward the current second's score. */
function drawEq(
  canvas: HTMLCanvasElement,
  evs: Evaluation[],
  findPersona: (id: string) => Persona | null,
  sec: number,
  smooth: Record<string, number>,
  theme: 'light' | 'dark',
) {
  const textSub = theme === 'dark' ? '#A1A1AA' : '#6B7280';
  const textMute = theme === 'dark' ? '#71717A' : '#9CA3AF';
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  if (!W || !H) return;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (!evs.length) {
    ctx.fillStyle = textMute;
    ctx.font = '12px Inter, "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('表示するペルソナがありません', W / 2, H / 2);
    return;
  }

  const padTop = 26;
  const padBottom = 30;
  const usable = H - padTop - padBottom;
  const slot = W / evs.length;
  const bw = Math.max(4, Math.min(38, slot * 0.56));
  const showName = slot >= 30;
  const showScore = slot >= 16;

  evs.forEach((e, i) => {
    const p = findPersona(e.personaId) || ({ color: '#6B7280', name: '' } as Persona);
    const point = e.timeline[sec];
    const target = (point ? point.score : 0) / 10;
    const key = e.personaId;
    smooth[key] = smooth[key] == null ? target : smooth[key] + (target - smooth[key]) * 0.3;
    const v = smooth[key];

    const h = Math.max(3, usable * v);
    const x = slot * i + (slot - bw) / 2;
    const y = padTop + (usable - h);

    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, hexA(p.color, 0.3 + 0.65 * v));
    g.addColorStop(1, hexA(p.color, 0.1 + 0.32 * v));
    ctx.fillStyle = g;
    roundTopRect(ctx, x, y, bw, h, 6);
    ctx.fill();

    if (showScore) {
      ctx.fillStyle = p.color;
      ctx.font = '600 11px Inter, "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(point ? point.score : 0), x + bw / 2, y - 7);
    }

    if (showName) {
      ctx.fillStyle = textSub;
      ctx.font = '10px Inter, "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      const nm = p.name.length > 6 ? p.name.slice(0, 6) + '…' : p.name;
      ctx.fillText(nm, x + bw / 2, H - 10);
    }
  });

  if (!showName) {
    ctx.fillStyle = textMute;
    ctx.font = '10px Inter, "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${evs.length}名（バーが細いため氏名は省略しています）`, W / 2, H - 8);
  }
}

interface EqualizerProps {
  evs: Evaluation[];
  findPersona: (id: string) => Persona | null;
  sec: number;
  theme: 'light' | 'dark';
}

/** Drives the equalizer at rAF continuously while mounted, smoothing bar
    heights toward the current second's score every frame. */
export function Equalizer({ evs, findPersona, sec, theme }: EqualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothRef = useRef<Record<string, number>>({});
  const evsRef = useRef(evs);
  const secRef = useRef(sec);
  const findRef = useRef(findPersona);
  const themeRef = useRef(theme);

  evsRef.current = evs;
  secRef.current = sec;
  findRef.current = findPersona;
  themeRef.current = theme;

  useEffect(() => {
    let raf = 0;
    function frame() {
      const canvas = canvasRef.current;
      if (canvas) drawEq(canvas, evsRef.current, findRef.current, secRef.current, smoothRef.current, themeRef.current);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="w-full flex-1 min-h-[240px]" />;
}
