"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ProgressionStrip } from "~/components/marketing/progression-strip";
import {
  type ContinuationOptionKey,
  chordOf,
  DEMO_GENRES,
  DEMO_MOODS,
  type DemoGenre,
  type DemoMood,
  MOOD_CONTINUATIONS,
  voicedSymbol,
} from "~/lib/music/piano-roll-demo";
import { cn } from "~/lib/utils";

const BASE = [
  { symbol: "Cmaj7", roman: "I" },
  { symbol: "Am7", roman: "vi" },
  { symbol: "Fmaj7", roman: "IV" },
  { symbol: "G7", roman: "V" },
];

export function MoodDirections() {
  const [genre, setGenre] = useState<DemoGenre | null>(null);
  const [mood, setMood] = useState<DemoMood | null>(null);
  const [activeOption, setActiveOption] =
    useState<ContinuationOptionKey>("smooth");

  function handleSelectMood(m: DemoMood) {
    setMood(m);
    setActiveOption("smooth");
  }

  const options = mood ? MOOD_CONTINUATIONS[mood] : null;
  const activeOptionData = options?.find((o) => o.key === activeOption) ?? null;

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
            {DEMO_MOODS.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mood === m}
                onClick={() => handleSelectMood(m)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  mood === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 md:p-8">
        <ProgressionStrip chords={BASE} />
        <div className="flex flex-col gap-4 border-t border-border pt-5">
          {genre && mood && options && activeOptionData ? (
            <>
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Suggestion option"
              >
                {options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={activeOption === option.key}
                    onClick={() => setActiveOption(option.key)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                      activeOption === option.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <motion.div
                key={`${genre}-${mood}-${activeOption}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3"
              >
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {mood} direction
                </span>
                <ProgressionStrip
                  chords={activeOptionData.chordKeys.map((key) => ({
                    symbol: voicedSymbol(key, genre),
                    roman: chordOf(key).roman,
                  }))}
                  emphasis="muted"
                />
                <p className="text-sm text-muted-foreground">
                  {activeOptionData.note}
                </p>
              </motion.div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {genre ? "Choose a mood" : "Choose a genre"} to see suggested
              directions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
