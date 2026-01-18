"use client";
import { emitNoteOn, emitNoteOff } from "@/lib/synthEvents";
import { useEffect, useRef, useState } from "react";
import { Note, NoteName, Scale } from "tonal";
import * as Tone from "tone";

export default function Synth() {
  const chromatic: NoteName[] = Scale.get("C chromatic").notes; // ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const synthRef = useRef<Tone.Synth | null>(null);
  const [ready, setReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || window.innerWidth < 768);

  useEffect(() => {
    const synth = new Tone.Synth().toDestination();
    synthRef.current = synth;

    return () => {
      synth.dispose();
      synthRef.current = null;
    };
  }, []);

  const handleEnableAudio = () => {
    // Synchronously call Tone.start() - no await!
    Tone.start()
      .then(() => Tone.loaded())
      .then(() => {
        setReady(true);
        setAudioEnabled(true);
      })
      .catch((error) => {
        console.error('Failed to start audio context:', error);
        setError(error.message || 'Could not initialize audio');
      });
  };

  const playNote = (noteName: string) => {
    const synth = synthRef.current;
    if (!synth || !ready) return;

    const pitch = `${noteName}4`;
    const freq = Note.freq(pitch) ?? 0;
    const midi = Note.midi(pitch) ?? 0;

    emitNoteOn({ note: pitch, midi, freq, velocity: 1 });
    synth.triggerAttack(pitch);
  };

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
      "rounded-lg border-2 border-white cursor-pointer w-10";
    return (
      <div
        key={i}
        onPointerDown={() => playNote(c)}
        onPointerUp={() => endNote()}
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
    <>
      {!audioEnabled && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-black border-2 border-white rounded-xl p-8 text-center max-w-md">
            <h2 className="text-white text-2xl mb-4">Enable Audio</h2>
            {isMobile && (
              <p className="text-white/70 text-sm mb-4">
                Make sure your device is not in silent mode
              </p>
            )}
            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}
            <button
              onPointerDown={handleEnableAudio}
              className="bg-white text-black px-8 py-4 rounded-lg border-2 border-white cursor-pointer"
            >
              Tap to Enable Audio
            </button>
          </div>
        </div>
      )}
      <div className="relative  w-100 flex items-start border-2 p-4 rounded-xl">
        {chromatic.map((c, i) => renderNote(c, i))}
      </div>
    </>
  );
}
