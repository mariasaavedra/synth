"use client";
import { emitNote } from "@/lib/synthEvents";
import { useCallback, useEffect, useRef, useState } from "react";
import { Note, NoteName, Scale } from "tonal";
import * as Tone from "tone";

export default function Synth() {
  const chromatic: NoteName[] = Scale.get("C chromatic").notes; // ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const synthRef = useRef<Tone.Synth | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Create once on mount, dispose on unmount
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

      const pitch = `${noteName}3`;
      const freq = Note.freq(pitch) ?? 0;
      const midi = Note.midi(pitch) ?? 0;

      emitNote({ note: pitch, midi, freq, velocity: 1 });
      synth.triggerAttack(pitch);
    },
    [ensureAudio]
  );

  const endNote = () => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.triggerRelease();
  };

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
        onMouseDown={() => playNote(c)}
        onMouseUp={() => endNote()}
        className={`${styles} ${
          isBlackKey(note.name)
            ? "bg-black  text-black"
            : "bg-white  text-white"
        }`}
      >
        {c}
      </div>
    );
  }

  return (
    <div className="relative flex items-start border-2 p-4 rounded-xl">
      {chromatic.map((c, i) => renderNote(c, i))}
    </div>
  );
}
