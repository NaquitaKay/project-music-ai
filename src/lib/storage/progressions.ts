import type { HarmonizationResult, Melody } from "~/lib/music/types";

export type SavedProgression = {
  id: string;
  name: string;
  melody: Melody;
  harmonization: HarmonizationResult;
  createdAt: number;
};

const STORAGE_KEY = "lumos-chord-progressions";

export function loadProgressions(): SavedProgression[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedProgression[]) : [];
  } catch {
    return [];
  }
}

export function saveProgressions(progressions: SavedProgression[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progressions));
}

export function exportProgressionAsJson(progression: SavedProgression) {
  const blob = new Blob([JSON.stringify(progression, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${progression.name || "progression"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
