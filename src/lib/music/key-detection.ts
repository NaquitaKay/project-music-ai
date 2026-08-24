import { Note } from "tonal";
import type { DetectedKey, Melody } from "~/lib/music/types";

const PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Krumhansl-Kessler key profiles: perceived stability of each pitch class
// relative to a tonic, used to correlate against a melody's pitch-class
// histogram and infer the most likely key.
const MAJOR_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
const MINOR_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

function buildChromaHistogram(melody: Melody): number[] {
  const histogram = new Array(12).fill(0);
  for (const step of melody) {
    if (!step.pitch) continue;
    const chroma = Note.get(step.pitch).chroma;
    if (chroma !== null && chroma !== undefined) {
      histogram[chroma] += 1;
    }
  }
  return histogram;
}

function rotate(profile: number[], tonic: number): number[] {
  const len = profile.length;
  return profile.map((_, i) => profile[(i - tonic + len) % len]);
}

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((sum, v) => sum + v, 0) / n;
  const meanB = b.reduce((sum, v) => sum + v, 0) / n;
  let numerator = 0;
  let denomA = 0;
  let denomB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    numerator += da * db;
    denomA += da * da;
    denomB += db * db;
  }
  const denom = Math.sqrt(denomA * denomB);
  return denom === 0 ? 0 : numerator / denom;
}

export function detectKey(melody: Melody): DetectedKey {
  const histogram = buildChromaHistogram(melody);
  const totalNotes = histogram.reduce((sum, v) => sum + v, 0);
  if (totalNotes === 0) {
    return { tonic: "C", mode: "major", confidence: 0 };
  }

  let bestTonic = 0;
  let bestMode: "major" | "minor" = "major";
  let bestCorrelation = Number.NEGATIVE_INFINITY;

  for (const mode of ["major", "minor"] as const) {
    const profile = mode === "major" ? MAJOR_PROFILE : MINOR_PROFILE;
    for (let tonic = 0; tonic < 12; tonic++) {
      const correlation = pearsonCorrelation(histogram, rotate(profile, tonic));
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestTonic = tonic;
        bestMode = mode;
      }
    }
  }

  return {
    tonic: PITCH_CLASSES[bestTonic],
    mode: bestMode,
    confidence: Math.max(0, Math.min(1, bestCorrelation)),
  };
}
