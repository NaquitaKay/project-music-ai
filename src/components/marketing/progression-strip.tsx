"use client";

import { motion, type Variants } from "framer-motion";
import { Fragment } from "react";
import { ChordChip } from "~/components/marketing/chord-chip";
import { cn } from "~/lib/utils";

type ProgressionChord = { symbol: string; roman?: string };

type ProgressionStripProps = {
  chords: ProgressionChord[];
  className?: string;
  size?: "default" | "lg";
  emphasis?: "default" | "muted";
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ProgressionStrip({
  chords,
  className,
  size = "default",
  emphasis = "default",
}: ProgressionStripProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {chords.map((chord, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: position in the progression is the chord's identity here (the same symbol can repeat at different steps)
        <Fragment key={`${chord.symbol}-${i}`}>
          {i > 0 && (
            <motion.span
              variants={item}
              className="text-muted-foreground/50"
              aria-hidden
            >
              →
            </motion.span>
          )}
          <motion.div variants={item}>
            <ChordChip
              symbol={chord.symbol}
              roman={chord.roman}
              emphasis={emphasis}
              className={size === "lg" ? "px-4 py-2.5 text-base" : undefined}
            />
          </motion.div>
        </Fragment>
      ))}
    </motion.div>
  );
}
