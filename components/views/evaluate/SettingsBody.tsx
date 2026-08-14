'use client';

import type { ReactNode } from 'react';
import { AnalysisOptions } from './AnalysisOptions';
import { Inputs } from './Inputs';
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
 * Nothing here declares a height, so a modal with a short roster is short.
 */
export function SettingsBody({ mode, onOpenCriteria }: { mode: ModeKey; onOpenCriteria: () => void }) {
  return (
    <>
      <Section title="動画">
        <Inputs mode={mode} />
      </Section>

      <Section title="解析設定">
        <AnalysisOptions onOpenCriteria={onOpenCriteria} />
      </Section>

      <div className="border-t border-line pt-3">
        <PersonaBar />
      </div>
    </>
  );
}
