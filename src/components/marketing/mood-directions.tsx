"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ProgressionStrip } from "~/components/marketing/progression-strip";
import { cn } from "~/lib/utils";

const BASE = [
  { symbol: "Cmaj7", roman: "I" },
  { symbol: "Am7", roman: "vi" },
  { symbol: "Fmaj7", roman: "IV" },
  { symbol: "G7", roman: "V" },
];

// Illustrative example continuations, not live model output - the point is
// to show what the experience feels like, not to fake a real AI call here.
const MOODS = [
  {
    name: "Dreamy",
    continuation: [
      { symbol: "Fmaj7", roman: "IV" },
      { symbol: "Em7", roman: "iii" },
      { symbol: "Dm7", roman: "ii" },
    ],
    note: "Soft extensions and a gentle descent keep the resolution open-ended.",
  },
  {
    name: "Emotional",
    continuation: [
      { symbol: "Dm7", roman: "ii" },
      { symbol: "Am7", roman: "vi" },
      { symbol: "Fmaj7", roman: "IV" },
    ],
    note: "Leaning on the minor chords draws out the progression's introspective side.",
  },
  {
    name: "Dark",
    continuation: [
      { symbol: "Fm", roman: "iv" },
      { symbol: "G7", roman: "V" },
      { symbol: "Cm", roman: "i" },
    ],
    note: "Borrowing the minor iv pulls the whole progression into a shadowed key.",
  },
  {
    name: "Cinematic",
    continuation: [
      { symbol: "Dm7", roman: "ii" },
      { symbol: "G7", roman: "V" },
      { symbol: "Cmaj9", roman: "I" },
    ],
    note: "A wider ii-V-I sweep gives the resolution some scale and air.",
  },
  {
    name: "Hopeful",
    continuation: [
      { symbol: "Fmaj7", roman: "IV" },
      { symbol: "G", roman: "V" },
      { symbol: "C", roman: "I" },
    ],
    note: "A clean major resolution lifts the progression toward the tonic.",
  },
  {
    name: "Tense",
    continuation: [
      { symbol: "Abdim7", roman: "vii°/vi" },
      { symbol: "G7", roman: "V" },
      { symbol: "Am7", roman: "vi" },
    ],
    note: "A chromatic passing chord delays the resolution and raises the stakes.",
  },
];

export function MoodDirections() {
  const [active, setActive] = useState(0);
  const mood = MOODS[active];

  return (
    <div className="flex flex-col gap-8">
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

      <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 md:p-8">
        <ProgressionStrip chords={BASE} />
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {mood.name} direction
          </span>
          <AnimatePresence mode="wait">
            <motion.div
              key={mood.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3"
            >
              <ProgressionStrip chords={mood.continuation} emphasis="muted" />
              <p className="text-sm text-muted-foreground">{mood.note}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
