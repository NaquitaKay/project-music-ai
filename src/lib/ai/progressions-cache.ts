import type { GeneratedProgression } from "~/lib/ai/generate-progressions";

// Session-lived only - avoids re-calling the AI provider when the user
// re-picks the same genre/mood combination later in the same visit.
const cache = new Map<string, GeneratedProgression[]>();

export function progressionsCacheKey(genre: string, mood: string): string {
  return `${genre}:${mood}`;
}

export function getCachedProgressions(
  key: string,
): GeneratedProgression[] | undefined {
  return cache.get(key);
}

export function setCachedProgressions(
  key: string,
  progressions: GeneratedProgression[],
): void {
  cache.set(key, progressions);
}
