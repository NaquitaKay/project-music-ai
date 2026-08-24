"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type PlaybackControlsProps = {
  isPlaying: boolean;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onPlay: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export function PlaybackControls({
  isPlaying,
  bpm,
  onBpmChange,
  onPlay,
  onStop,
  disabled,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        onClick={isPlaying ? onStop : onPlay}
        disabled={disabled}
      >
        {isPlaying ? "Stop" : "Play"}
      </Button>
      <div className="flex items-center gap-2">
        <Label htmlFor="bpm">BPM</Label>
        <Input
          id="bpm"
          type="number"
          min={40}
          max={220}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="w-20"
        />
      </div>
    </div>
  );
}
