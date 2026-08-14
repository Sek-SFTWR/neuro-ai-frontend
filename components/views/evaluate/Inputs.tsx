'use client';

import { useRef } from 'react';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VideoBadge } from '@/components/ui/VideoBadge';
import { useStore } from '@/lib/store';
import { fmtSize } from '@/lib/palette';
import type { ModeKey, PickedFile } from '@/lib/types';

const YT_PLACEHOLDER = 'https://www.youtube.com/watch?v=...';

function metaFrom(f: File): PickedFile {
  return { name: f.name, size: f.size, duration: 15 };
}

/** `offset` numbers rows past videos already listed elsewhere in the same
    form (e.g. mixcompare's file rows continue the count started by its URL
    rows), so the badge always matches the video's eventual position in the
    comparison output. */
function UrlRows({ urls, offset = 0, onChange }: { urls: string[]; offset?: number; onChange: (urls: string[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {urls.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <VideoBadge index={offset + i} />
            <Input
              type="url"
              placeholder={YT_PLACEHOLDER}
              value={v}
              aria-label={`YouTube URL ${i + 1}`}
              onChange={(e) => { const next = urls.slice(); next[i] = e.target.value; onChange(next); }}
            />
            <button
              type="button"
              aria-label="この行を削除"
              onClick={() => onChange(urls.length <= 1 ? [''] : urls.filter((_, idx) => idx !== i))}
              className="text-text-mute flex p-2 rounded-full shrink-0 transition-colors duration-180 hover:text-pri-high hover:bg-pri-high-bg"
            >
              <Icon name="x" size={15} />
            </button>
          </div>
        ))}
      </div>
      <Button size="sm" className="self-start" onClick={() => onChange([...urls, ''])}>
        <Icon name="plus" size={13} />URLを追加
      </Button>
    </div>
  );
}

function FileList({ files, offset = 0, onDelete }: { files: PickedFile[]; offset?: number; onDelete: (i: number) => void }) {
  if (!files.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-2 bg-surface border border-line rounded-chip py-2 px-3 text-[12.5px]">
          <VideoBadge index={offset + i} />
          <span className="truncate">{f.name}</span>
          <span className="text-text-mute text-[11.5px]">{fmtSize(f.size)}</span>
          <button type="button" aria-label="削除" onClick={() => onDelete(i)} className="ml-auto text-text-mute flex p-[3px] rounded-full transition-colors duration-180 hover:text-pri-high hover:bg-pri-high-bg">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* 評価基準を設定 used to live in here, but it configures the run rather than the
   video, so it now sits at the end of the 解析設定 row — which also gives the URL
   field the full width and puts the action in every mode, not just these two. */
export function Inputs({ mode }: { mode: ModeKey }) {
  const { state, update } = useStore();
  const inputs = state.inputs;
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickSingleFile(f: File) {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(v.src);
      update((s) => ({ ...s, inputs: { ...s.inputs, file: { file: { name: f.name, size: f.size, duration: Math.min(120, Math.floor(v.duration || 15)) } } } }));
    };
    v.onerror = () => {
      update((s) => ({ ...s, inputs: { ...s.inputs, file: { file: metaFrom(f) } } }));
    };
    v.src = URL.createObjectURL(f);
  }

  function pickMultiFiles(list: File[], target: 'filecompare' | 'mixcompare') {
    update((s) => {
      const existing = s.inputs[target].files;
      const seen = new Set(existing.map((f) => `${f.name}|${f.size}`));
      const next = existing.slice();
      list.forEach((f) => {
        const k = `${f.name}|${f.size}`;
        if (!seen.has(k)) { seen.add(k); next.push(metaFrom(f)); }
      });
      return { ...s, inputs: { ...s.inputs, [target]: { ...s.inputs[target], files: next } } };
    });
  }

  if (mode === 'youtube') {
    return (
      <Input
        type="url"
        placeholder={YT_PLACEHOLDER}
        aria-label="YouTube URL"
        value={inputs.youtube.url}
        onChange={(e) => update((s) => ({ ...s, inputs: { ...s.inputs, youtube: { url: e.target.value } } }))}
      />
    );
  }

  if (mode === 'file') {
    const f = inputs.file.file;
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="w-[76px] h-12 rounded-chip bg-fill flex items-center justify-center text-text-mute shrink-0"><Icon name="video" size={20} /></span>
        <span className="flex-1 min-w-[160px]">
          <span className="block text-[13px] font-medium">{f ? f.name : '動画ファイルを選択してください'}</span>
          {f && <span className="block text-xs text-text-sub">{fmtSize(f.size)} ・ {Math.floor(f.duration / 60)}:{String(f.duration % 60).padStart(2, '0')}</span>}
        </span>
        <Button onClick={() => fileInputRef.current?.click()}><Icon name="upload" size={15} />ファイルを選択</Button>
        <input ref={fileInputRef} type="file" accept="video/*" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) pickSingleFile(file); e.target.value = ''; }} />
      </div>
    );
  }

  if (mode === 'ytcompare') {
    return (
      <UrlRows urls={inputs.ytcompare.urls} onChange={(urls) => update((s) => ({ ...s, inputs: { ...s.inputs, ytcompare: { urls } } }))} />
    );
  }

  if (mode === 'filecompare') {
    const n = inputs.filecompare.files.length;
    return (
      <>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-[76px] h-12 rounded-chip bg-fill flex items-center justify-center text-text-mute shrink-0"><Icon name="video" size={20} /></span>
          <span className="flex-1 min-w-[160px]">
            <span className="block text-[13px] font-medium">{n ? `${n}本の動画を選択中（「ファイルを選択」で追加できます）` : '動画ファイルを複数選択してください'}</span>
          </span>
          <Button onClick={() => fileInputRef.current?.click()}><Icon name="upload" size={15} />ファイルを選択</Button>
          <input ref={fileInputRef} type="file" accept="video/*" multiple className="sr-only" onChange={(e) => { pickMultiFiles(Array.from(e.target.files || []), 'filecompare'); e.target.value = ''; }} />
        </div>
        <FileList files={inputs.filecompare.files} onDelete={(i) => update((s) => ({ ...s, inputs: { ...s.inputs, filecompare: { files: s.inputs.filecompare.files.filter((_, idx) => idx !== i) } } }))} />
      </>
    );
  }

  /* mixcompare */
  const mn = inputs.mixcompare.files.length;
  return (
    <>
      <span className="text-xs font-semibold text-text-sub">YouTube URL</span>
      <UrlRows urls={inputs.mixcompare.urls} onChange={(urls) => update((s) => ({ ...s, inputs: { ...s.inputs, mixcompare: { ...s.inputs.mixcompare, urls } } }))} />
      <span className="text-xs font-semibold text-text-sub mt-2">動画ファイル</span>
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={() => fileInputRef.current?.click()}><Icon name="upload" size={15} />ファイルを選択</Button>
        <span className="flex-1"><span className="block text-[13px] font-medium">{mn ? `${mn}本の動画ファイルを追加中` : '動画ファイルを追加（任意・複数可）'}</span></span>
        <input ref={fileInputRef} type="file" accept="video/*" multiple className="sr-only" onChange={(e) => { pickMultiFiles(Array.from(e.target.files || []), 'mixcompare'); e.target.value = ''; }} />
      </div>
      <FileList
        files={inputs.mixcompare.files}
        offset={inputs.mixcompare.urls.filter((u) => u.trim()).length}
        onDelete={(i) => update((s) => ({ ...s, inputs: { ...s.inputs, mixcompare: { ...s.inputs.mixcompare, files: s.inputs.mixcompare.files.filter((_, idx) => idx !== i) } } }))}
      />
    </>
  );
}
