"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { measureCount } from "~/lib/music/melody";
import type { HarmonizationResult, Melody } from "~/lib/music/types";
import { STEPS_PER_MEASURE } from "~/lib/music/types";

// One step = one 8th note = 2 sixteenths; a measure (8 steps, 4/4) is
// exactly one bar, so step -> Transport "bar:beat:sixteenth" is a direct
// conversion with no fractional bars to worry about.
function stepToTransportTime(step: number): string {
  const bar = Math.floor(step / STEPS_PER_MEASURE);
  const sixteenthsInBar = (step % STEPS_PER_MEASURE) * 2;
  const beat = Math.floor(sixteenthsInBar / 4);
  const sixteenth = sixteenthsInBar % 4;
  return `${bar}:${beat}:${sixteenth}`;
}

type ScheduledEvent = {
  time: string;
  step: number;
  melodyPitch: string | null;
  chordNotes: string[] | null;
};

export function useChordPlayback(
  melody: Melody,
  harmonization: HarmonizationResult | null,
  selectedDegrees: Record<number, number>,
) {
  const melodySynthRef = useRef<Tone.Synth | null>(null);
  const chordSynthRef = useRef<Tone.PolySynth | null>(null);
  const partRef = useRef<Tone.Part<ScheduledEvent> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [bpm, setBpm] = useState(100);

  useEffect(() => {
    melodySynthRef.current = new Tone.Synth().toDestination();
    chordSynthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    return () => {
      partRef.current?.dispose();
      melodySynthRef.current?.dispose();
      chordSynthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    partRef.current?.dispose();
    partRef.current = null;
    if (!harmonization || melody.length === 0) return;

    const events: ScheduledEvent[] = melody.map((melodyStep, i) => {
      const measureIndex = Math.floor(i / STEPS_PER_MEASURE);
      const measure = harmonization.measures[measureIndex];
      const stepInMeasure = i % STEPS_PER_MEASURE;

      let chordNotes: string[] | null = null;
      if (measure && stepInMeasure === 0) {
        const selectedDegree = selectedDegrees[measureIndex];
        const suggestion =
          measure.suggestions.find((s) => s.degree === selectedDegree) ??
          measure.suggestions.find((s) => s.isRecommended) ??
          null;
        // Chord.get().notes returns bare pitch classes (e.g. "G") with no
        // octave - Tone needs a concrete pitch, so voice the chord an
        // octave below the melody's C3-B4 range.
        chordNotes = suggestion
          ? suggestion.notes.map((pitchClass) => `${pitchClass}2`)
          : null;
      }

      return {
        time: stepToTransportTime(i),
        step: i,
        melodyPitch: melodyStep.pitch,
        chordNotes,
      };
    });

    const part = new Tone.Part<ScheduledEvent>((time, event) => {
      if (event.melodyPitch) {
        melodySynthRef.current?.triggerAttackRelease(
          event.melodyPitch,
          "8n",
          time,
        );
      }
      if (event.chordNotes) {
        chordSynthRef.current?.triggerAttackRelease(
          event.chordNotes,
          "1n",
          time,
        );
      }
      Tone.getDraw().schedule(() => setCurrentStep(event.step), time);
    }, events);

    part.loop = true;
    part.loopEnd = `${measureCount(melody)}m`;
    part.start(0);
    partRef.current = part;
  }, [melody, harmonization, selectedDegrees]);

  const play = useCallback(async () => {
    await Tone.start();
    Tone.getTransport().start();
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    Tone.getTransport().stop();
    setIsPlaying(false);
    setCurrentStep(null);
  }, []);

  return { isPlaying, currentStep, bpm, setBpm, play, stop };
}
