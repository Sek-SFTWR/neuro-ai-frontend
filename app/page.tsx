'use client';

import dynamic from 'next/dynamic';

/*
 * This app is a client-only mock UI — Chart.js touches the canvas/window
 * directly, the greeting uses the local time-of-day, and none of the state
 * is meant to be server-rendered (there is no backend yet). Loading the
 * shell with ssr:false sidesteps hydration mismatches from all three.
 */
const Shell = dynamic(() => import('@/components/shell/Shell').then((m) => m.Shell), { ssr: false });

export default function Home() {
  return <Shell />;
}
