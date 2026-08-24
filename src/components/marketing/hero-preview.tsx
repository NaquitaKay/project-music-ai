"use client";

import { motion } from "framer-motion";
import { ChordChip } from "~/components/marketing/chord-chip";
import { ProgressionStrip } from "~/components/marketing/progression-strip";
import { Badge } from "~/components/ui/badge";
import { MELODY_ANALYSIS, MELODY_NOTES } from "~/lib/music/piano-roll-demo";

const MATCHING_CHORDS = MELODY_ANALYSIS.map(({ chord }) => ({
  symbol: chord.symbol,
  roman: chord.roman,
}));

const DIRECTIONS = [
  { mood: "Dreamy", next: "Fmaj7" },
  { mood: "Cinematic", next: "Dm7" },
  { mood: "Hopeful", next: "G" },
];

export function HeroPreview() {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Your melody
      </p>
      <div className="mt-4 flex items-center gap-1.5">
        {MELODY_NOTES.map((note, i) => (
          <Badge
            // biome-ignore lint/suspicious/noArrayIndexKey: position in the melody is the note's identity here (the same pitch repeats at different steps)
            key={`${note}-${i}`}
            variant="outline"
            className="font-display"
          >
            {note.replace(/\d+$/, "")}
          </Badge>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Matching chords
        </p>
        <div className="mt-4">
          <ProgressionStrip chords={MATCHING_CHORDS} />
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Explore progressions to continue
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
