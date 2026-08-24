export const GENRES = [
  "Pop",
  "R&B",
  "Jazz",
  "Rock",
  "Indie",
  "Soul",
  "Classical",
  "Cinematic",
  "Lo-fi",
  "Funk",
] as const;

export const MOODS = [
  "Dreamy",
  "Emotional",
  "Dark",
  "Hopeful",
  "Romantic",
  "Tense",
  "Uplifting",
  "Melancholic",
] as const;

export type Genre = (typeof GENRES)[number];
export type Mood = (typeof MOODS)[number];

export function isGenre(value: string): value is Genre {
  return (GENRES as readonly string[]).includes(value);
}

export function isMood(value: string): value is Mood {
  return (MOODS as readonly string[]).includes(value);
}
