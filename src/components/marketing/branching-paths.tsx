"use client";

import { ProgressionStrip } from "~/components/marketing/progression-strip";
import { Reveal } from "~/components/marketing/reveal";

const BASE = [
  { symbol: "C", roman: "I" },
  { symbol: "Am", roman: "vi" },
  { symbol: "F", roman: "IV" },
  { symbol: "G", roman: "V" },
];

const BRANCHES = [
  {
    mood: "Dreamy",
    continuation: [{ symbol: "Fmaj7" }, { symbol: "G" }, { symbol: "Em7" }],
  },
  {
    mood: "Emotional",
    continuation: [{ symbol: "Dm7" }, { symbol: "Am" }, { symbol: "F" }],
  },
  {
    mood: "Cinematic",
    continuation: [{ symbol: "Dm" }, { symbol: "G7" }, { symbol: "C" }],
  },
];

export function BranchingPaths() {
  return (
    <div className="flex flex-col items-center gap-10">
      <ProgressionStrip chords={BASE} size="lg" />
      <div className="grid w-full gap-8 md:grid-cols-3">
        {BRANCHES.map((branch, i) => (
          <Reveal key={branch.mood} delay={i * 0.1}>
            <div className="flex flex-col items-center gap-3 border-t border-border pt-6 text-center">
              <span className="text-xs font-medium tracking-wide text-primary uppercase">
                {branch.mood}
              </span>
              <span aria-hidden className="text-muted-foreground/50">
                ↓
              </span>
              <ProgressionStrip chords={branch.continuation} emphasis="muted" />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
