"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  autoCorrelate,
  frequencyToGridNote,
} from "~/lib/audio/pitch-detection";
import type { Melody, MelodyStep } from "~/lib/music/types";
import { STEPS_PER_MEASURE } from "~/lib/music/types";

const STEP_DURATION_MS = 300;
const MAX_MEASURES = 8;
const MAX_STEPS = MAX_MEASURES * STEPS_PER_MEASURE;
const FFT_SIZE = 2048;

export type RecorderStatus = "idle" | "requesting" | "recording" | "error";

function mostCommon(values: string[]): string | null {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  let best: string | null = null;
  let bestCount = 0;
  for (const [note, count] of counts) {
    if (count > bestCount) {
      best = note;
      bestCount = count;
    }
  }
  return best;
}

function padToMeasure(steps: MelodyStep[]): Melody {
  if (steps.length === 0) return steps;
  const remainder = steps.length % STEPS_PER_MEASURE;
  if (remainder === 0) return steps;
  const padding = STEPS_PER_MEASURE - remainder;
  return [
    ...steps,
    ...Array.from({ length: padding }, () => ({ pitch: null })),
  ];
}

export function useMelodyRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<MelodyStep[]>([]);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const samplesRef = useRef<string[]>([]);
  const stepCountRef = useRef(0);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    rafRef.current = null;
    intervalRef.current = null;
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") {
      audioContext.close().catch(() => {});
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setLevel(0);
    setCurrentNote(null);
    setStatus((prev) => (prev === "error" ? prev : "idle"));
  }, [cleanup]);

  const start = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError("This browser doesn't support microphone access.");
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      samplesRef.current = [];
      stepCountRef.current = 0;
      setSteps([]);
      setStatus("recording");

      const detect = () => {
        analyser.getFloatTimeDomainData(buffer);
        const rms = Math.sqrt(
          buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length,
        );
        setLevel(rms);

        const frequency = autoCorrelate(buffer, audioContext.sampleRate);
        if (frequency > 0) {
          const note = frequencyToGridNote(frequency);
          if (note) {
            samplesRef.current.push(note);
            setCurrentNote(note);
          }
        } else {
          setCurrentNote(null);
        }

        rafRef.current = requestAnimationFrame(detect);
      };
      rafRef.current = requestAnimationFrame(detect);

      intervalRef.current = setInterval(() => {
        const votes = samplesRef.current;
        samplesRef.current = [];
        const pitch = mostCommon(votes);
        stepCountRef.current += 1;
        setSteps((prev) => [...prev, { pitch }]);
        if (stepCountRef.current >= MAX_STEPS) {
          stop();
        }
      }, STEP_DURATION_MS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not access the microphone.",
      );
      setStatus("error");
      cleanup();
    }
  }, [cleanup, stop]);

  const reset = useCallback(() => {
    stop();
    setSteps([]);
  }, [stop]);

  // Memoized so the reference only changes when `steps` actually does -
  // callers can safely depend on it (e.g. in a useEffect) without looping.
  const melody = useMemo(() => padToMeasure(steps), [steps]);

  return {
    status,
    error,
    melody,
    isAtMaxLength: steps.length >= MAX_STEPS,
    currentNote,
    level,
    start,
    stop,
    reset,
  };
}
