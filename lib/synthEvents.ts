// lib/synthEvents.ts
export const SYNTH_NOTE_EVENT = "synth:note";

export type SynthNoteDetail = {
  note: string;     // e.g. "C#3"
  midi: number;     // e.g. 61
  freq: number;     // e.g. 277.18
  velocity?: number; // 0..1
};

export function emitNote(detail: SynthNoteDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SynthNoteDetail>(SYNTH_NOTE_EVENT, { detail }));
}
