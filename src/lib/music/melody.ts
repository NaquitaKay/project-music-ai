import type { Melody } from "~/lib/music/types";
import { STEPS_PER_MEASURE } from "~/lib/music/types";

export function createEmptyMelody(measures: number): Melody {
  return Array.from({ length: measures * STEPS_PER_MEASURE }, () => ({
    pitch: null,
  }));
}

export function measureCount(melody: Melody): number {
  return Math.ceil(melody.length / STEPS_PER_MEASURE);
}

export function getMeasureSteps(melody: Melody, measureIndex: number) {
  const start = measureIndex * STEPS_PER_MEASURE;
  return melody.slice(start, start + STEPS_PER_MEASURE);
}

export function isMelodyEmpty(melody: Melody): boolean {
  return melody.every((step) => step.pitch === null);
}
