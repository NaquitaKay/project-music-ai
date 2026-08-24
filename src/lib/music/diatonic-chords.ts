import { Chord, Key } from "tonal";
import type { DetectedKey } from "~/lib/music/types";

export type DiatonicChord = {
  degree: number;
  roman: string;
  symbol: string;
  notes: string[];
};

const ROMAN_BASE = ["I", "II", "III", "IV", "V", "VI", "VII"];

function romanNumeral(base: string, chordType: string): string {
  const type = chordType.toLowerCase();
  if (type.includes("dim")) return `${base.toLowerCase()}°`;
  if (type.includes("aug")) return `${base}+`;
  if (type.includes("minor")) return base.toLowerCase();
  return base;
}

// Minor keys use the harmonic minor's triads (not natural minor) so the
// diatonic pool includes a major V and a leading-tone vii° - without that,
// authentic V→i cadences (the strongest move in harmonize.ts's transition
// weights) wouldn't be available in minor keys at all.
export function getDiatonicChords(key: DetectedKey): DiatonicChord[] {
  const triads =
    key.mode === "major"
      ? Key.majorKey(key.tonic).triads
      : Key.minorKey(key.tonic).harmonic.triads;

  return triads.map((symbol, i) => {
    const chord = Chord.get(symbol);
    return {
      degree: i + 1,
      roman: romanNumeral(ROMAN_BASE[i], chord.type),
      symbol,
      notes: chord.notes,
    };
  });
}
