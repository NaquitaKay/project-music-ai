import { Note } from "tonal";
import { getDiatonicChords } from "~/lib/music/diatonic-chords";
import { detectKey } from "~/lib/music/key-detection";
import { getMeasureSteps, measureCount } from "~/lib/music/melody";
import type {
  ChordSuggestion,
  HarmonizationResult,
  MeasureHarmonization,
  Melody,
} from "~/lib/music/types";

// Scale-degree bigram weights encoding common-practice harmonic tendencies -
// this is what makes recommendations favor motion like V->I / ii-V-I over an
// arbitrary diatonic pick with equally-good consonance.
const TRANSITION_WEIGHTS: Record<string, number> = {
  "5-1": 1.0, // V -> I
  "7-1": 0.9, // vii° -> I
  "2-5": 0.8, // ii -> V
  "4-5": 0.7, // IV -> V
  "4-1": 0.5, // IV -> I
  "1-4": 0.4,
  "1-5": 0.4,
  "6-2": 0.3,
  "3-6": 0.3,
  "6-4": 0.3,
  "1-6": 0.2,
};
const DEFAULT_TRANSITION_WEIGHT = 0.15;
const REPEAT_WEIGHT = 0.1;
const CADENCE_BONUS = 0.3;

function transitionWeight(fromDegree: number, toDegree: number): number {
  if (fromDegree === toDegree) return REPEAT_WEIGHT;
  return (
    TRANSITION_WEIGHTS[`${fromDegree}-${toDegree}`] ?? DEFAULT_TRANSITION_WEIGHT
  );
}

function consonanceScore(
  chordNotes: string[],
  melodySteps: { pitch: string | null }[],
): number {
  const chordChromas = new Set(
    chordNotes
      .map((n) => Note.get(n).chroma)
      .filter((c): c is number => c !== null && c !== undefined),
  );

  let weightedTotal = 0;
  let weightSum = 0;
  melodySteps.forEach((step, i) => {
    if (!step.pitch) return;
    const weight = i === 0 ? 2 : 1; // beat-1 consonance matters most
    weightSum += weight;
    const chroma = Note.get(step.pitch).chroma;
    if (chroma !== null && chroma !== undefined && chordChromas.has(chroma)) {
      weightedTotal += weight;
    }
  });

  return weightSum === 0 ? 0 : weightedTotal / weightSum;
}

export function harmonize(melody: Melody): HarmonizationResult {
  const key = detectKey(melody);
  const diatonicChords = getDiatonicChords(key);
  const numMeasures = measureCount(melody);
  const numDegrees = diatonicChords.length;

  const measureData = Array.from({ length: numMeasures }, (_, m) => {
    const steps = getMeasureSteps(melody, m);
    const melodyPitches = steps
      .map((s) => s.pitch)
      .filter((p): p is string => p !== null);
    const scores = diatonicChords.map((c) => consonanceScore(c.notes, steps));
    return { melodyPitches, scores };
  });

  // Viterbi DP: pick the single best chord-degree path across measures,
  // trading off per-measure consonance (emission) against how natural the
  // move from the previous measure's chord is (transition).
  const dp: number[][] = [];
  const backpointer: number[][] = [];
  for (let m = 0; m < numMeasures; m++) {
    dp.push(new Array(numDegrees).fill(Number.NEGATIVE_INFINITY));
    backpointer.push(new Array(numDegrees).fill(-1));
    for (let d = 0; d < numDegrees; d++) {
      const emission = measureData[m].scores[d];
      if (m === 0) {
        dp[m][d] = emission;
        continue;
      }
      for (let prevD = 0; prevD < numDegrees; prevD++) {
        const candidate =
          dp[m - 1][prevD] + transitionWeight(prevD + 1, d + 1) + emission;
        if (candidate > dp[m][d]) {
          dp[m][d] = candidate;
          backpointer[m][d] = prevD;
        }
      }
    }
  }

  const lastMeasure = numMeasures - 1;
  if (lastMeasure >= 0) {
    dp[lastMeasure][0] += CADENCE_BONUS; // ending on I
    dp[lastMeasure][4] += CADENCE_BONUS; // ending on V
  }

  const path = new Array<number>(numMeasures).fill(0);
  if (lastMeasure >= 0) {
    let bestFinalDegree = 0;
    for (let d = 1; d < numDegrees; d++) {
      if (dp[lastMeasure][d] > dp[lastMeasure][bestFinalDegree]) {
        bestFinalDegree = d;
      }
    }
    path[lastMeasure] = bestFinalDegree;
    for (let m = lastMeasure; m > 0; m--) {
      path[m - 1] = backpointer[m][path[m]];
    }
  }

  const measures: MeasureHarmonization[] = measureData.map((data, i) => {
    const recommendedDegree = path[i] + 1;
    const ranked = diatonicChords
      .map((c, d) => ({ chord: c, score: data.scores[d] }))
      .sort((a, b) => b.score - a.score);

    const top = ranked.slice(0, 3);
    if (!top.some((t) => t.chord.degree === recommendedDegree)) {
      const recommended = ranked.find(
        (r) => r.chord.degree === recommendedDegree,
      );
      if (recommended) top[top.length - 1] = recommended;
    }

    const suggestions: ChordSuggestion[] = top.map(({ chord, score }) => ({
      roman: chord.roman,
      symbol: chord.symbol,
      notes: chord.notes,
      degree: chord.degree,
      score,
      isRecommended: chord.degree === recommendedDegree,
    }));

    return { measureIndex: i, melodyPitches: data.melodyPitches, suggestions };
  });

  return { key, measures };
}
