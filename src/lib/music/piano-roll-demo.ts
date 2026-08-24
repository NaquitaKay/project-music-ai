// Illustrative content for the landing-page "melody to chords" demo.
// Chords and voicings here are hand-picked to read well in a compact preview,
// not live model output — the real analysis happens in /chord-suggester.

export const DEMO_GENRES = [
  "Pop",
  "R&B",
  "Jazz",
  "Rock",
  "Indie",
  "Soul",
  "Cinematic",
] as const;

export const DEMO_MOODS = [
  "Dreamy",
  "Emotional",
  "Dark",
  "Hopeful",
  "Tense",
  "Uplifting",
] as const;

export type DemoGenre = (typeof DEMO_GENRES)[number];
export type DemoMood = (typeof DEMO_MOODS)[number];

type ChordQuality = "major" | "minor";

type DemoChordKey = "C" | "Am" | "F" | "G" | "Dm" | "Fm" | "Ab" | "Eb";

type DemoChord = {
  symbol: string;
  roman: string;
  quality: ChordQuality;
  notes: string[];
  /** Pitches (with octave) used to place this chord on the piano roll. */
  pitches: string[];
};

const CHORD_BANK: Record<DemoChordKey, DemoChord> = {
  C: {
    symbol: "C",
    roman: "I",
    quality: "major",
    notes: ["C", "E", "G"],
    pitches: ["C4", "E4", "G4"],
  },
  Am: {
    symbol: "Am",
    roman: "vi",
    quality: "minor",
    notes: ["A", "C", "E"],
    pitches: ["A3", "C4", "E4"],
  },
  F: {
    symbol: "F",
    roman: "IV",
    quality: "major",
    notes: ["F", "A", "C"],
    pitches: ["F3", "A3", "C4"],
  },
  G: {
    symbol: "G",
    roman: "V",
    quality: "major",
    notes: ["G", "B", "D"],
    pitches: ["G3", "B3", "D4"],
  },
  Dm: {
    symbol: "Dm",
    roman: "ii",
    quality: "minor",
    notes: ["D", "F", "A"],
    pitches: ["D4", "F4", "A4"],
  },
  Fm: {
    symbol: "Fm",
    roman: "iv",
    quality: "minor",
    notes: ["F", "Ab", "C"],
    pitches: ["F3", "G#3", "C4"],
  },
  Ab: {
    symbol: "Ab",
    roman: "bVI",
    quality: "major",
    notes: ["Ab", "C", "Eb"],
    pitches: ["G#3", "C4", "D#4"],
  },
  Eb: {
    symbol: "Eb",
    roman: "bIII",
    quality: "major",
    notes: ["Eb", "G", "Bb"],
    pitches: ["D#3", "G3", "A#3"],
  },
};

/** Genre changes how "dressed up" the suggested chords sound. */
const GENRE_VOICING_TIER: Record<DemoGenre, "plain" | "seventh" | "extended"> =
  {
    Pop: "plain",
    Rock: "plain",
    Indie: "plain",
    "R&B": "seventh",
    Soul: "seventh",
    Jazz: "extended",
    Cinematic: "extended",
  };

export function voicedSymbol(chordKey: DemoChordKey, genre: DemoGenre) {
  const chord = CHORD_BANK[chordKey];
  const tier = GENRE_VOICING_TIER[genre];
  if (tier === "plain") return chord.symbol;
  if (tier === "seventh") {
    return chord.quality === "major"
      ? `${chord.symbol}maj7`
      : `${chord.symbol}7`;
  }
  return chord.quality === "major" ? `${chord.symbol}maj9` : `${chord.symbol}9`;
}

export function chordOf(chordKey: DemoChordKey) {
  return CHORD_BANK[chordKey];
}

// The melody shown throughout the demo: C E G E D over two measures worth of
// beats, resolving from a I chord into its relative minor.
export const MELODY_NOTES = ["C4", "E4", "G4", "E4", "D4"];

export const MELODY_ANALYSIS = [
  { chord: CHORD_BANK.C, span: 3 },
  { chord: CHORD_BANK.Am, span: 2 },
] as const;

export const MELODY_ANALYSIS_EXPLANATION =
  "The first three notes — C, E, G — spell out a C major chord directly, so C major is the obvious harmonic home. The last two, E and D, still sit comfortably against A minor, C major's relative minor, giving the phrase a gentle lift before it settles.";

export type ContinuationOptionKey = "smooth" | "emotional" | "unexpected";

export type ContinuationOption = {
  key: ContinuationOptionKey;
  label: string;
  chordKeys: [DemoChordKey, DemoChordKey];
  note: string;
};

export const CONTINUATION_OPTION_LABELS: Record<ContinuationOptionKey, string> =
  {
    smooth: "Smooth continuation",
    emotional: "More emotional",
    unexpected: "More unexpected",
  };

export const MOOD_CONTINUATIONS: Record<DemoMood, ContinuationOption[]> = {
  Dreamy: [
    {
      key: "smooth",
      label: CONTINUATION_OPTION_LABELS.smooth,
      chordKeys: ["F", "C"],
      note: "A soft plagal cadence brings the phrase home without much tension.",
    },
    {
      key: "emotional",
      label: CONTINUATION_OPTION_LABELS.emotional,
      chordKeys: ["F", "Dm"],
      note: "Lingering on the ii chord keeps the ending feeling open and wistful.",
    },
    {
      key: "unexpected",
      label: CONTINUATION_OPTION_LABELS.unexpected,
      chordKeys: ["Ab", "G"],
      note: "Borrowing the bVI from the parallel minor adds a hazy color before settling on V.",
    },
  ],
  Emotional: [
    {
      key: "smooth",
      label: CONTINUATION_OPTION_LABELS.smooth,
      chordKeys: ["Dm", "G"],
      note: "A ii–V sets up gentle, familiar motion.",
    },
    {
      key: "emotional",
      label: CONTINUATION_OPTION_LABELS.emotional,
      chordKeys: ["Dm", "Am"],
      note: "Staying among the minor chords draws out the melody's introspective side.",
    },
    {
      key: "unexpected",
      label: CONTINUATION_OPTION_LABELS.unexpected,
      chordKeys: ["Eb", "F"],
      note: "The borrowed bIII adds a bittersweet ache before lifting into IV.",
    },
  ],
  Dark: [
    {
      key: "smooth",
      label: CONTINUATION_OPTION_LABELS.smooth,
      chordKeys: ["Fm", "G"],
      note: "Trading IV for the minor iv shadows the progression before it resolves.",
    },
    {
      key: "emotional",
      label: CONTINUATION_OPTION_LABELS.emotional,
      chordKeys: ["Fm", "Am"],
      note: "Two minor chords in a row deepen the sense of tension.",
    },
    {
      key: "unexpected",
      label: CONTINUATION_OPTION_LABELS.unexpected,
      chordKeys: ["Ab", "Fm"],
      note: "The borrowed bVI slides into iv for an unsettled, cinematic turn.",
    },
  ],
  Hopeful: [
    {
      key: "smooth",
      label: CONTINUATION_OPTION_LABELS.smooth,
      chordKeys: ["F", "G"],
      note: "A rising IV–V lifts the melody toward resolution.",
    },
    {
      key: "emotional",
      label: CONTINUATION_OPTION_LABELS.emotional,
      chordKeys: ["Dm", "G"],
      note: "Passing through ii makes the lift feel earned rather than sudden.",
    },
    {
      key: "unexpected",
      label: CONTINUATION_OPTION_LABELS.unexpected,
      chordKeys: ["Eb", "G"],
      note: "The borrowed bIII brightens the path unexpectedly before landing on V.",
    },
  ],
  Tense: [
    {
      key: "smooth",
      label: CONTINUATION_OPTION_LABELS.smooth,
      chordKeys: ["Dm", "G"],
      note: "The ii–V creates gentle forward pull toward resolution.",
    },
    {
      key: "emotional",
      label: CONTINUATION_OPTION_LABELS.emotional,
      chordKeys: ["Fm", "G"],
      note: "The minor iv over V raises the emotional stakes before the release.",
    },
    {
      key: "unexpected",
      label: CONTINUATION_OPTION_LABELS.unexpected,
      chordKeys: ["Ab", "G"],
      note: "A chromatic bVI–V creates real friction before it lets go.",
    },
  ],
  Uplifting: [
    {
      key: "smooth",
      label: CONTINUATION_OPTION_LABELS.smooth,
      chordKeys: ["F", "C"],
      note: "A clean IV–I keeps the lift bright and simple.",
    },
    {
      key: "emotional",
      label: CONTINUATION_OPTION_LABELS.emotional,
      chordKeys: ["Dm", "C"],
      note: "Passing through ii adds warmth on the way home.",
    },
    {
      key: "unexpected",
      label: CONTINUATION_OPTION_LABELS.unexpected,
      chordKeys: ["Eb", "C"],
      note: "The borrowed bIII adds a surprising brightness on the way back to I.",
    },
  ],
};

// Piano-roll pitch rows, highest to lowest — the exact set of pitches used
// anywhere in the demo above, so every chord and melody note has a home row.
export const PIANO_ROLL_ROWS = [
  "A4",
  "G4",
  "F4",
  "E4",
  "D#4",
  "D4",
  "C4",
  "B3",
  "A#3",
  "A3",
  "G#3",
  "G3",
  "F3",
  "D#3",
];

export const MELODY_COLUMN_COUNT = 5;
export const CONTINUATION_CHORD_SPAN = 2;
export const CONTINUATION_COLUMN_COUNT = CONTINUATION_CHORD_SPAN * 2;
export const TOTAL_COLUMN_COUNT =
  MELODY_COLUMN_COUNT + CONTINUATION_COLUMN_COUNT;
