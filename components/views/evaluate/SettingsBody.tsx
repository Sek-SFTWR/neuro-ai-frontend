'use client';

import type { ReactNode } from 'react';
import { Inputs } from './Inputs';
import { InstructionInput } from './InstructionInput';
import { PersonaBar } from '@/components/ui/PersonaBar';
import type { ModeKey } from '@/lib/types';

/** A labelled block. The heading is the container's job, not each input's, so
    every section is titled the same way whatever it holds. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-text">{title}</h3>
      {/* Inputs returns a fragment for the compare modes, so the gap has to
          live here rather than being assumed of the caller. */}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

/**
 * One column, sized by its content.
 *
 * This was briefly two columns, on the theory that the persona picker made the
 * modal tall. It does — but the other half is a URL field and six pills, so the
 * split bought a tall empty rectangle rather than a shorter modal. The picker's
 * height is better handled by the card's own max-height and one scroller.
 *
 * What is left is the two things a run needs and nothing else: what to
 * evaluate, and who watches it. The 解析設定 block that used to sit between
 * them held the model and the splice interval — both standing preferences
 * rather than per-run choices, so they live on the settings screen now, and
 * the criteria drill-in moved down to the footer beside the run button.
 */
export function SettingsBody({ mode }: { mode: ModeKey }) {
  return (
    <>
      <Section title="動画">
        <Inputs mode={mode} />
      </Section>

      {/* After the video, before the personas: it describes how to watch what
          was just specified, and reads as a note to the people about to do it. */}
      <Section title="追加指示（任意）">
        <InstructionInput />
      </Section>

      <div className="border-t border-line pt-3">
        <PersonaBar />
      </div>
    </>
  );
}
