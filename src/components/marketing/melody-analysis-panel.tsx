"use client";

import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import {
  MELODY_ANALYSIS,
  MELODY_ANALYSIS_EXPLANATION,
  MELODY_NOTES,
} from "~/lib/music/piano-roll-demo";

const noteContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const noteItem: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.8 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const barContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.7 },
  },
};

const barSegment: Variants = {
  hidden: { opacity: 0, scaleX: 0.85 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export function MelodyAnalysisPanel() {
  const [showWhy, setShowWhy] = useState(false);
  const totalSpan = MELODY_ANALYSIS.reduce((sum, seg) => sum + seg.span, 0);

  return (
    <div className="w-full rounded-xl border border-border bg-card p-6 sm:p-8">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Melody analysis
      </p>

      {/* Melody notes */}
      <motion.div
        variants={noteContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-6 flex items-center justify-center gap-5 sm:gap-8"
      >
        {MELODY_NOTES.map((note, i) => (
          <motion.div
            // biome-ignore lint/suspicious/noArrayIndexKey: position in the melody is the note's identity here (the same pitch repeats at different steps)
            key={`${note}-${i}`}
            variants={noteItem}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-display text-sm text-muted-foreground">
              {note.replace(/\d+$/, "")}
            </span>
            <span
              aria-hidden
              className="size-3 rounded-full bg-foreground sm:size-3.5"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Chord segment bar */}
      <motion.div
        variants={barContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-6 flex overflow-hidden rounded-md border border-border"
      >
        {MELODY_ANALYSIS.map(({ chord, span }) => (
          <motion.div
            key={chord.symbol}
            variants={barSegment}
            style={{ flexBasis: `${(span / totalSpan) * 100}%` }}
            className="flex items-center justify-center border-r border-border bg-primary/10 py-3 font-display text-base last:border-r-0"
          >
            {chord.symbol}
          </motion.div>
        ))}
      </motion.div>

      {/* Chord detail */}
      <motion.div
        variants={barContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-5 grid grid-cols-2 gap-4 text-center"
      >
        {MELODY_ANALYSIS.map(({ chord }) => (
          <motion.div
            key={chord.symbol}
            variants={barSegment}
            className="flex flex-col gap-1"
          >
            <span className="text-sm font-medium text-foreground">
              {chord.symbol === "Am" ? "A minor" : "C major"}
            </span>
            <span className="text-xs text-muted-foreground">
              {chord.notes.join(" · ")}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-5">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          aria-expanded={showWhy}
          className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          Why does this work? {showWhy ? "↑" : "→"}
        </button>
        {showWhy && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-md text-center text-sm text-muted-foreground"
          >
            {MELODY_ANALYSIS_EXPLANATION}
          </motion.p>
        )}
      </div>
    </div>
  );
}
