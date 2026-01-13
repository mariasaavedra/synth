"use client";
import { emitNoteOn, emitNoteOff } from "@/lib/synthEvents";
import { useCallback, useEffect, useRef, useState } from "react";
import { Note, NoteName, Scale } from "tonal";
import * as Tone from "tone";

export default function Synth() {
  const chromatic: NoteName[] = Scale.get("C chromatic").notes; // ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const synthRef = useRef<Tone.Synth | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const synth = new Tone.Synth().toDestination();
    synthRef.current = synth;

    return () => {
      synth.dispose();
      synthRef.current = null;
    };
  }, []);

  const ensureAudio = useCallback(async () => {
    if (ready) return;
    // Must be called from a user gesture (click/tap)
    await Tone.start();
    await Tone.loaded();
    setReady(true);
  }, [ready]);

  const playNote = useCallback(
    async (noteName: string) => {
      await ensureAudio();

      const synth = synthRef.current;
      if (!synth) return;

      const pitch = `${noteName}4`;
      const freq = Note.freq(pitch) ?? 0;
      const midi = Note.midi(pitch) ?? 0;

      emitNoteOn({ note: pitch, midi, freq, velocity: 1 });
      synth.triggerAttack(pitch);
    },
    [ensureAudio]
  );

  const endNote = () => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.triggerRelease();
    emitNoteOff();
  };

  function isBlackKey(noteName: string): boolean {
    return Note.get(noteName).alt !== 0;
  }

  function renderNote(c: NoteName, i: number) {
    const note = Note.get(c);
    const styles =
      "rounded-lg border-2 border-white cursor-pointer w-10  touch-none";
    return (
      <div
        key={i}
        onPointerDown={(e) => {
          e.preventDefault(); // avoid scroll/zoom during press
          playNote(c);
        }}
        onPointerUp={(e) => {
          e.preventDefault(); // avoid scroll/zoom during press
          endNote();
        }}
        onMouseDown={() => playNote(c)}
        onMouseUp={() => endNote()}
        style={isBlackKey(c) ? { transform: `translateX(${i * 1.85}rem)` } : {}}
        className={`${styles} ${
          isBlackKey(note.name)
            ? `bg-black  text-black absolute h-25 top-2 z-10`
            : `bg-white  text-white h-45 mx-2 `
        }`}
      >
   
      </div>
    );
  }

  return (
    <div className="relative  w-100 flex items-start border-2 p-4 rounded-xl">
      {chromatic.map((c, i) => renderNote(c, i))}
    </div>
  );
}
