"use client";
import { Note, NoteName, Scale } from "tonal";

const chromatic: NoteName[] = Scale.get("C chromatic").notes; // ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

function isBlackKey(noteName: string): boolean {
  return Note.get(noteName).alt !== 0;
}

function renderNote(c: NoteName, i: number) {
  const note = Note.get(c);
  const styles =
    "rounded-lg border-2 border-white cursor-pointer h-50 w-10  mx-2";
  return (
    <div
      key={i}
      className={`${styles} ${
        isBlackKey(note.name) ? "bg-black  text-black" : "bg-white  text-white"}`}
    >
      {c}
    </div>
  );
}

export default function Synth() {
  return (
    <div className="relative flex items-start border-2 p-4 rounded-xl">
      {chromatic.map((c, i) => renderNote(c, i))}
    </div>
  );
}
