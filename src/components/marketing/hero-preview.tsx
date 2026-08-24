"use client";

import { motion } from "framer-motion";
import { ChordChip } from "~/components/marketing/chord-chip";
import { ProgressionStrip } from "~/components/marketing/progression-strip";

const BASE = [
  { symbol: "Cmaj7", roman: "I" },
  { symbol: "Am7", roman: "vi" },
  { symbol: "Fmaj7", roman: "IV" },
  { symbol: "G7", roman: "V" },
];

const DIRECTIONS = [
  { mood: "Dreamy", next: "Fmaj7" },
  { mood: "Cinematic", next: "Dm7" },
  { mood: "Hopeful", next: "G" },
];

export function HeroPreview() {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Your progression
      </p>
      <div className="mt-4">
        <ProgressionStrip chords={BASE} />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          AI suggests
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {DIRECTIONS.map((d, i) => (
            <motion.div
              key={d.mood}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2.5"
            >
              <span className="text-sm text-muted-foreground">{d.mood}</span>
              <ChordChip
                symbol={d.next}
                emphasis="muted"
                className="px-2.5 py-1 text-xs"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
