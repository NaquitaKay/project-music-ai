"use client";

import { useMemo, useState } from "react";
import { GenreMoodDiscover } from "~/components/genre-mood-discover";
import { HarmonizationPanel } from "~/components/harmonization-panel";
import { NoteGrid } from "~/components/note-grid";
import { PlaybackControls } from "~/components/playback-controls";
import { SavedProgressions } from "~/components/saved-progressions";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useChordPlayback } from "~/hooks/use-chord-playback";
import { useProgressions } from "~/hooks/use-progressions";
import { harmonize } from "~/lib/music/harmonize";
import { createEmptyMelody, isMelodyEmpty } from "~/lib/music/melody";
import type { Melody } from "~/lib/music/types";
import { STEPS_PER_MEASURE } from "~/lib/music/types";
import type { SavedProgression } from "~/lib/supabase/progressions";

const MEASURE_OPTIONS = [2, 4];

export default function ChordSuggesterPage() {
  const [measures, setMeasures] = useState(2);
  const [melody, setMelody] = useState<Melody>(() => createEmptyMelody(2));
  const [selectedDegrees, setSelectedDegrees] = useState<
    Record<number, number>
  >({});

  const {
    progressions,
    error: progressionsError,
    save,
    remove,
  } = useProgressions("chord-suggester");

  function changeMeasures(next: number) {
    setMeasures(next);
    setMelody((prev) => {
      const targetLength = next * STEPS_PER_MEASURE;
      if (targetLength > prev.length) {
        return [...prev, ...createEmptyMelody(next).slice(prev.length)];
      }
      return prev.slice(0, targetLength);
    });
    setSelectedDegrees({});
  }

  function clearMelody() {
    setMelody(createEmptyMelody(measures));
    setSelectedDegrees({});
  }

  const harmonization = useMemo(() => {
    if (isMelodyEmpty(melody)) return null;
    return harmonize(melody);
  }, [melody]);

  const { isPlaying, currentStep, bpm, setBpm, play, stop } = useChordPlayback(
    melody,
    harmonization,
    selectedDegrees,
  );

  function handleSelectDegree(measureIndex: number, degree: number) {
    setSelectedDegrees((prev) => ({ ...prev, [measureIndex]: degree }));
  }

  async function handleSave(name: string) {
    if (!harmonization) return;
    await save(name, melody, harmonization);
  }

  function handleLoad(progression: SavedProgression) {
    setMelody(progression.melody);
    setMeasures(progression.melody.length / STEPS_PER_MEASURE);
    setSelectedDegrees({});
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-tight">
          Chord Suggester
        </h1>
        <div className="flex gap-2">
          {MEASURE_OPTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={measures === option ? "default" : "outline"}
              size="sm"
              onClick={() => changeMeasures(option)}
            >
              {option} measures
            </Button>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={clearMelody}>
            Clear
          </Button>
        </div>
      </div>

      <NoteGrid
        melody={melody}
        onChange={setMelody}
        activeStep={isPlaying ? currentStep : null}
      />

      <PlaybackControls
        isPlaying={isPlaying}
        bpm={bpm}
        onBpmChange={setBpm}
        onPlay={play}
        onStop={stop}
        disabled={!harmonization}
      />

      <HarmonizationPanel
        harmonization={harmonization}
        selectedDegrees={selectedDegrees}
        onSelectDegree={handleSelectDegree}
        onSave={handleSave}
        emptyMessage="Click on the grid above to enter a melody and see chord suggestions."
      />

      {progressionsError && (
        <p className="text-sm text-destructive">{progressionsError}</p>
      )}

      <SavedProgressions
        progressions={progressions}
        onLoad={handleLoad}
        onDelete={remove}
      />

      <Separator />

      <GenreMoodDiscover />
    </div>
  );
}
