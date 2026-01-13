// lib/synthEvents.ts
export const SYNTH_NOTE_ON_EVENT = "synth:note_on";
export const SYNTH_NOTE_OFF_EVENT = "synth:note_off";

export type SynthNoteDetail = {
  note: string;   // "C#3"
  midi: number;
  freq: number;
  velocity?: number; // 0..1
};

export function emitNoteOn(detail: SynthNoteDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<SynthNoteDetail>(SYNTH_NOTE_ON_EVENT, { detail }));
}

export function emitNoteOff() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SYNTH_NOTE_OFF_EVENT));
}
