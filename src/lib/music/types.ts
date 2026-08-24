export const STEPS_PER_MEASURE = 8;

export type MelodyStep = { pitch: string | null };
export type Melody = MelodyStep[];

export type DetectedKey = {
  tonic: string;
  mode: "major" | "minor";
  confidence: number;
};

export type ChordSuggestion = {
  roman: string;
  symbol: string;
  notes: string[];
  degree: number;
  score: number;
  isRecommended: boolean;
};

export type MeasureHarmonization = {
  measureIndex: number;
  melodyPitches: string[];
  suggestions: ChordSuggestion[];
};

export type HarmonizationResult = {
  key: DetectedKey;
  measures: MeasureHarmonization[];
};
