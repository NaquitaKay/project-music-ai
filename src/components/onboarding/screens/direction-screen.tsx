"use client";

import { useState } from "react";
import { ChordChip } from "~/components/marketing/chord-chip";
import { ProgressionStrip } from "~/components/marketing/progression-strip";
import { cn } from "~/lib/utils";

const GENRES = ["Pop", "R&B", "Indie", "Rock", "Jazz", "Classical"] as const;
const MOODS = [
  "Dreamy",
  "Dark",
  "Nostalgic",
  "Hopeful",
  "Tense",
  "Energetic",
] as const;

type Genre = (typeof GENRES)[number];
type Mood = (typeof MOODS)[number];

// A small, self-contained preview mapping for this screen only - not the
// real AI-backed suggestion engine. Choices here are just illustrative and
// never persisted (per spec: these picks shouldn't affect the account).
const NEXT_CHORD_BY_MOOD: Record<Mood, { symbol: string; roman: string }> = {
  Dreamy: { symbol: "Fmaj7", roman: "IV" },
  Dark: { symbol: "Fm", roman: "iv" },
  Nostalgic: { symbol: "Am7", roman: "vi" },
  Hopeful: { symbol: "G", roman: "V" },
  Tense: { symbol: "Bdim", roman: "vii°" },
  Energetic: { symbol: "C", roman: "I" },
};

const BASE_PROGRESSION = [
  { symbol: "C", roman: "I" },
  { symbol: "Am", roman: "vi" },
];

function ChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={value === option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              value === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DirectionScreen({
  headingRef,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);

  const nextChord = mood ? NEXT_CHORD_BY_MOOD[mood] : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 text-center md:text-left">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl tracking-tight outline-none sm:text-4xl"
        >
          Find your sound
        </h1>
        <p className="text-muted-foreground">
          Choose a genre and mood to explore chord progressions and suggestions
          that match your direction.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <ChipRow
          label="Genre"
          options={GENRES}
          value={genre}
          onChange={setGenre}
        />
        <ChipRow label="Mood" options={MOODS} value={mood} onChange={setMood} />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <ProgressionStrip chords={BASE_PROGRESSION} />
        {nextChord ? (
          <div className="flex items-center gap-3 border-t border-border pt-4">
            <span className="text-muted-foreground/50" aria-hidden>
              →
            </span>
            <ChordChip symbol={nextChord.symbol} roman={nextChord.roman} />
            <span className="text-sm text-muted-foreground">
              {genre
                ? `A ${genre.toLowerCase()} take on a ${mood?.toLowerCase()} direction`
                : `A ${mood?.toLowerCase()} direction`}
            </span>
          </div>
        ) : (
          <p className="border-t border-border pt-4 text-sm text-muted-foreground">
            Choose a mood to preview a suggested next chord.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        You can change these anytime.
      </p>
    </div>
  );
}
