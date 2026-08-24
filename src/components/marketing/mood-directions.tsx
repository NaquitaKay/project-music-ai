"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ProgressionStrip } from "~/components/marketing/progression-strip";
import {
  type ChordQuality,
  DEMO_GENRES,
  type DemoGenre,
  voiceChordSymbol,
} from "~/lib/music/piano-roll-demo";
import { cn } from "~/lib/utils";

const BASE = [
  { symbol: "Cmaj7", roman: "I" },
  { symbol: "Am7", roman: "vi" },
  { symbol: "Fmaj7", roman: "IV" },
  { symbol: "G7", roman: "V" },
];

type MoodChord = { root: string; quality: ChordQuality; roman: string };

// Illustrative example continuations, not live model output - the point is
// to show what the experience feels like, not to fake a real AI call here.
// Genre only changes how each chord is "dressed up" (triad, seventh,
// extended) — the underlying harmonic direction comes from the mood.
const MOODS: { name: string; continuation: MoodChord[]; note: string }[] = [
  {
    name: "Dreamy",
    continuation: [
      { root: "F", quality: "major", roman: "IV" },
      { root: "E", quality: "minor", roman: "iii" },
      { root: "D", quality: "minor", roman: "ii" },
    ],
    note: "Soft extensions and a gentle descent keep the resolution open-ended.",
  },
  {
    name: "Emotional",
    continuation: [
      { root: "D", quality: "minor", roman: "ii" },
      { root: "A", quality: "minor", roman: "vi" },
      { root: "F", quality: "major", roman: "IV" },
    ],
    note: "Leaning on the minor chords draws out the progression's introspective side.",
  },
  {
    name: "Dark",
    continuation: [
      { root: "F", quality: "minor", roman: "iv" },
      { root: "G", quality: "dominant", roman: "V" },
      { root: "C", quality: "minor", roman: "i" },
    ],
    note: "Borrowing the minor iv pulls the whole progression into a shadowed key.",
  },
  {
    name: "Cinematic",
    continuation: [
      { root: "D", quality: "minor", roman: "ii" },
      { root: "G", quality: "dominant", roman: "V" },
      { root: "C", quality: "major", roman: "I" },
    ],
    note: "A wider ii-V-I sweep gives the resolution some scale and air.",
  },
  {
    name: "Hopeful",
    continuation: [
      { root: "F", quality: "major", roman: "IV" },
      { root: "G", quality: "dominant", roman: "V" },
      { root: "C", quality: "major", roman: "I" },
    ],
    note: "A clean major resolution lifts the progression toward the tonic.",
  },
  {
    name: "Tense",
    continuation: [
      { root: "Ab", quality: "diminished", roman: "vii°/vi" },
      { root: "G", quality: "dominant", roman: "V" },
      { root: "A", quality: "minor", roman: "vi" },
    ],
    note: "A chromatic passing chord delays the resolution and raises the stakes.",
  },
];

export function MoodDirections() {
  const [genre, setGenre] = useState<DemoGenre | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const mood = active === null ? null : MOODS[active];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Genre
        </p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Genre">
          {DEMO_GENRES.map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={genre === g}
              onClick={() => setGenre(g)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                genre === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {genre && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-2"
        >
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Mood
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Mood direction"
          >
            {MOODS.map((m, i) => (
              <button
                key={m.name}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  i === active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 md:p-8">
        <ProgressionStrip chords={BASE} />
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          {mood && genre ? (
            <motion.div
              key={`${genre}-${mood.name}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {mood.name} direction
              </span>
              <ProgressionStrip
                chords={mood.continuation.map((c) => ({
                  symbol: voiceChordSymbol(c.root, c.quality, genre),
                  roman: c.roman,
                }))}
                emphasis="muted"
              />
              <p className="text-sm text-muted-foreground">{mood.note}</p>
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {genre ? "Choose a mood" : "Choose a genre"} to see a suggested
              direction.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
