export const SYNTH_NOTE_EVENT = "synth:note";

export function emitNote() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SYNTH_NOTE_EVENT));
}
