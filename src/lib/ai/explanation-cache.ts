// Session-lived only (a plain module-level Map, cleared on page reload) -
// avoids re-calling the AI provider when the user re-clicks "Explain" on the
// same or an equivalent chord suggestion.
const cache = new Map<string, string>();

export type ExplanationCacheKeyInput = {
  tonic: string;
  mode: string;
  roman: string;
  melodyPitches: string[];
};

export function explanationCacheKey(input: ExplanationCacheKeyInput): string {
  const pitchClasses = [...new Set(input.melodyPitches)].sort().join(",");
  return `${input.tonic}:${input.mode}:${input.roman}:${pitchClasses}`;
}

export function getCachedExplanation(key: string): string | undefined {
  return cache.get(key);
}

export function setCachedExplanation(key: string, explanation: string): void {
  cache.set(key, explanation);
}
