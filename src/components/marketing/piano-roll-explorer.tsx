"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useState } from "react";
import { ChordChip } from "~/components/marketing/chord-chip";
import {
  CONTINUATION_CHORD_SPAN,
  CONTINUATION_COLUMN_COUNT,
  type ContinuationOptionKey,
  chordOf,
  DEMO_GENRES,
  DEMO_MOODS,
  type DemoGenre,
  type DemoMood,
  MELODY_ANALYSIS,
  MELODY_COLUMN_COUNT,
  MELODY_NOTES,
  MOOD_CONTINUATIONS,
  PIANO_ROLL_ROWS,
  TOTAL_COLUMN_COUNT,
  voicedSymbol,
} from "~/lib/music/piano-roll-demo";
import { cn } from "~/lib/utils";

type Phase = "idle" | "analyzing" | "revealed";

type Block = {
  id: string;
  rowIndex: number;
  colStart: number;
  span: number;
  kind: "melody" | "analysis" | "continuation";
};

function buildBaseBlocks(): Block[] {
  const blocks: Block[] = [];
  MELODY_NOTES.forEach((pitch, i) => {
    blocks.push({
      id: `melody-${i}`,
      rowIndex: PIANO_ROLL_ROWS.indexOf(pitch),
      colStart: i,
      span: 1,
      kind: "melody",
    });
  });

  let colOffset = 0;
  for (const seg of MELODY_ANALYSIS) {
    for (const pitch of seg.chord.pitches) {
      blocks.push({
        id: `analysis-${seg.chord.symbol}-${pitch}`,
        rowIndex: PIANO_ROLL_ROWS.indexOf(pitch),
        colStart: colOffset,
        span: seg.span,
        kind: "analysis",
      });
    }
    colOffset += seg.span;
  }
  return blocks;
}

const BASE_BLOCKS = buildBaseBlocks();

export function PianoRollExplorer() {
  const [genre, setGenre] = useState<DemoGenre | null>(null);
  const [mood, setMood] = useState<DemoMood | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeOption, setActiveOption] =
    useState<ContinuationOptionKey>("smooth");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!genre || !mood) {
      setPhase("idle");
      return;
    }
    setPhase("analyzing");
    setActiveOption("smooth");
    const delay = shouldReduceMotion ? 0 : 700;
    const timeout = setTimeout(() => setPhase("revealed"), delay);
    return () => clearTimeout(timeout);
  }, [genre, mood, shouldReduceMotion]);

  const options = mood ? MOOD_CONTINUATIONS[mood] : null;
  const activeOptionData = options?.find((o) => o.key === activeOption) ?? null;

  const continuationBlocks: Block[] = [];
  if (phase === "revealed" && activeOptionData) {
    let colOffset = MELODY_COLUMN_COUNT;
    for (const chordKey of activeOptionData.chordKeys) {
      const chord = chordOf(chordKey);
      for (const pitch of chord.pitches) {
        continuationBlocks.push({
          id: `continuation-${chordKey}-${pitch}`,
          rowIndex: PIANO_ROLL_ROWS.indexOf(pitch),
          colStart: colOffset,
          span: CONTINUATION_CHORD_SPAN,
          kind: "continuation",
        });
      }
      colOffset += CONTINUATION_CHORD_SPAN;
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Your melody → suggested continuation
      </p>

      {/* Piano roll */}
      <div className="overflow-x-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `40px repeat(${TOTAL_COLUMN_COUNT}, minmax(30px, 1fr))`,
            gridTemplateRows: `repeat(${PIANO_ROLL_ROWS.length}, 16px)`,
            minWidth: `${40 + TOTAL_COLUMN_COUNT * 30}px`,
          }}
        >
          {/* Row labels + stripes */}
          {PIANO_ROLL_ROWS.map((pitch, rowIndex) => (
            <Fragment key={`row-${pitch}`}>
              <div
                className="sticky left-0 z-10 flex items-center justify-end bg-background pr-2 text-[10px] text-muted-foreground"
                style={{ gridColumn: "1 / span 1", gridRow: rowIndex + 1 }}
              >
                {pitch}
              </div>
              <div
                className={cn(
                  "border-b border-b-border/40",
                  rowIndex % 2 === 0 && "bg-muted/20",
                )}
                style={{
                  gridColumn: `2 / span ${MELODY_COLUMN_COUNT}`,
                  gridRow: rowIndex + 1,
                }}
              />
              <div
                className={cn(
                  "border-b border-b-border/40 border-l-2 border-l-border/60",
                  rowIndex % 2 === 0 && "bg-muted/20",
                )}
                style={{
                  gridColumn: `${2 + MELODY_COLUMN_COUNT} / span ${CONTINUATION_COLUMN_COUNT}`,
                  gridRow: rowIndex + 1,
                }}
              />
            </Fragment>
          ))}

          {/* Existing melody + its chord analysis */}
          {BASE_BLOCKS.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.3 }}
              style={{
                gridColumn: `${block.colStart + 2} / span ${block.span}`,
                gridRow: block.rowIndex + 1,
              }}
              className={cn(
                "z-[1] m-[1px] rounded-sm",
                block.kind === "melody" ? "bg-foreground" : "bg-primary/60",
              )}
            />
          ))}

          {/* Suggested continuation */}
          {continuationBlocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                gridColumn: `${block.colStart + 2} / span ${block.span}`,
                gridRow: block.rowIndex + 1,
              }}
              className="z-[1] m-[1px] rounded-sm bg-primary ring-1 ring-inset ring-primary/50"
            />
          ))}

          {/* Ghost / analyzing overlay */}
          {phase !== "revealed" && (
            <div
              className={cn(
                "z-[2] flex items-center justify-center rounded-md border border-dashed border-border/60 px-2 text-center text-[11px] text-muted-foreground",
                phase === "analyzing" &&
                  "animate-pulse border-primary/50 text-primary",
              )}
              style={{
                gridColumn: `${2 + MELODY_COLUMN_COUNT} / span ${CONTINUATION_COLUMN_COUNT}`,
                gridRow: `1 / span ${PIANO_ROLL_ROWS.length}`,
              }}
            >
              {phase === "analyzing" ? "Analyzing…" : "Choose a genre & mood"}
            </div>
          )}
        </div>
      </div>

      {/* Genre picker */}
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
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
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

      {/* Mood picker */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Mood
        </p>
        <div
          role="tablist"
          aria-label="Mood"
          className={cn(
            "flex flex-wrap gap-2 transition-opacity",
            !genre && "pointer-events-none opacity-40",
          )}
        >
          {DEMO_MOODS.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mood === m}
              disabled={!genre}
              onClick={() => setMood(m)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                mood === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested directions */}
      {phase === "revealed" && options && activeOptionData && genre && (
        <div className="flex flex-col gap-4 border-t border-border pt-5">
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
            key={activeOption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              {activeOptionData.chordKeys.map((key, i) => (
                <Fragment key={key}>
                  {i > 0 && (
                    <span aria-hidden className="text-muted-foreground/50">
                      →
                    </span>
                  )}
                  <ChordChip
                    symbol={voicedSymbol(key, genre)}
                    roman={chordOf(key).roman}
                    emphasis="muted"
                  />
                </Fragment>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {activeOptionData.note}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
