"use client";

import type { Melody } from "~/lib/music/types";
import { cn } from "~/lib/utils";

const OCTAVE_PITCHES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

function buildPitchRows(): string[] {
  const rows: string[] = [];
  for (let octave = 4; octave >= 3; octave--) {
    for (let i = OCTAVE_PITCHES.length - 1; i >= 0; i--) {
      rows.push(`${OCTAVE_PITCHES[i]}${octave}`);
    }
  }
  return rows; // 24 rows, B4 down to C3
}

const PITCH_ROWS = buildPitchRows();

type NoteGridProps = {
  melody: Melody;
  onChange: (melody: Melody) => void;
  activeStep?: number | null;
};

export function NoteGrid({
  melody,
  onChange,
  activeStep = null,
}: NoteGridProps) {
  function toggleCell(stepIndex: number, pitch: string) {
    const next = melody.map((step, i) =>
      i === stepIndex ? { pitch: step.pitch === pitch ? null : pitch } : step,
    );
    onChange(next);
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="inline-flex flex-col">
        {PITCH_ROWS.map((pitch) => (
          <div key={pitch} className="flex">
            <div className="sticky left-0 z-10 flex w-12 shrink-0 items-center justify-end border-r border-border bg-background pr-2 text-xs text-muted-foreground">
              {pitch}
            </div>
            {melody.map((step, stepIndex) => {
              const isActive = step.pitch === pitch;
              const isMeasureStart = stepIndex % 8 === 0 && stepIndex !== 0;
              const isCurrentStep = activeStep === stepIndex;
              return (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: step index is the cell's actual identity in this fixed-size grid, not incidental list position
                  key={`${pitch}-${stepIndex}`}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`${pitch}, step ${stepIndex + 1}`}
                  onClick={() => toggleCell(stepIndex, pitch)}
                  className={cn(
                    "h-6 w-8 shrink-0 border-b border-r border-border/50 transition-colors",
                    isMeasureStart && "border-l-2 border-l-border",
                    isActive ? "bg-primary" : "hover:bg-accent",
                    isCurrentStep && "ring-2 ring-inset ring-ring",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
