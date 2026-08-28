"use client";

import { Button } from "~/components/ui/button";
import type { useMelodyRecorder } from "~/hooks/use-melody-recorder";

type MelodyRecorderProps = {
  recorder: ReturnType<typeof useMelodyRecorder>;
};

function statusLabel(
  status: ReturnType<typeof useMelodyRecorder>["status"],
  currentNote: string | null,
  isAtMaxLength: boolean,
) {
  switch (status) {
    case "requesting":
      return "Requesting microphone access…";
    case "recording":
      if (isAtMaxLength) return "Reached the maximum length";
      return currentNote ? `Hearing ${currentNote}` : "Listening…";
    case "error":
      return "Microphone unavailable";
    default:
      return "Sing or hum a melody to get started";
  }
}

export function MelodyRecorder({ recorder }: MelodyRecorderProps) {
  const {
    status,
    error,
    currentNote,
    level,
    isAtMaxLength,
    start,
    stop,
    reset,
  } = recorder;
  const isRecording = status === "recording";
  const hasRecording = !isRecording && recorder.melody.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stop : start}
          disabled={status === "requesting"}
        >
          {isRecording ? "Stop" : "Start listening"}
        </Button>

        <div className="min-w-48 flex-1">
          <p className="text-sm font-medium">
            {statusLabel(status, currentNote, isAtMaxLength)}
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width] duration-75"
              style={{ width: `${Math.min(level * 400, 100)}%` }}
            />
          </div>
        </div>

        {hasRecording && (
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Clear recording
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
