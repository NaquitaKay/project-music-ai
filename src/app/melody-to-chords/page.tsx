"use client";

import { useEffect, useMemo, useState } from "react";
import { ChordSuggestions } from "~/components/chord-suggestions";
import { MelodyRecorder } from "~/components/melody-recorder";
import { NoteGrid } from "~/components/note-grid";
import { PlaybackControls } from "~/components/playback-controls";
import { SavedProgressions } from "~/components/saved-progressions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useChordPlayback } from "~/hooks/use-chord-playback";
import { useMelodyRecorder } from "~/hooks/use-melody-recorder";
import { useProgressions } from "~/hooks/use-progressions";
import { harmonize } from "~/lib/music/harmonize";
import { createEmptyMelody, isMelodyEmpty } from "~/lib/music/melody";
import type { Melody } from "~/lib/music/types";
import { STEPS_PER_MEASURE } from "~/lib/music/types";
import type { SavedProgression } from "~/lib/supabase/progressions";

const MIN_MEASURES = 1;
const MAX_MEASURES = 8;

export default function MelodyToChordsPage() {
  const [melody, setMelody] = useState<Melody>(() => createEmptyMelody(2));
  const [selectedDegrees, setSelectedDegrees] = useState<
    Record<number, number>
  >({});
  const [progressionName, setProgressionName] = useState("");

  const {
    progressions,
    error: progressionsError,
    save,
    remove,
  } = useProgressions("melody-to-chords");

  const recorder = useMelodyRecorder();

  // Mirror the recorder's melody onto the grid as it fills in, so notes
  // appear live while recording; the grid stays editable afterward.
  useEffect(() => {
    if (recorder.melody.length > 0) setMelody(recorder.melody);
  }, [recorder.melody]);

  function addMeasure() {
    setMelody((prev) => {
      const measures = prev.length / STEPS_PER_MEASURE;
      if (measures >= MAX_MEASURES) return prev;
      return [...prev, ...createEmptyMelody(1)];
    });
  }

  function removeMeasure() {
    setMelody((prev) => {
      const measures = prev.length / STEPS_PER_MEASURE;
      if (measures <= MIN_MEASURES) return prev;
      return prev.slice(0, prev.length - STEPS_PER_MEASURE);
    });
    setSelectedDegrees({});
  }

  function clearMelody() {
    setMelody((prev) => createEmptyMelody(prev.length / STEPS_PER_MEASURE));
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

  async function handleSave() {
    if (!harmonization) return;
    await save(
      progressionName.trim() || "Untitled progression",
      melody,
      harmonization,
    );
    setProgressionName("");
  }

  function handleLoad(progression: SavedProgression) {
    setMelody(progression.melody);
    setSelectedDegrees({});
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight">
          Melody to Chords
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sing or hum into your microphone, or click notes directly on the grid.
        </p>
      </div>

      <MelodyRecorder recorder={recorder} />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {melody.length / STEPS_PER_MEASURE} measures
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeMeasure}
            disabled={melody.length / STEPS_PER_MEASURE <= MIN_MEASURES}
          >
            - Remove measure
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMeasure}
            disabled={melody.length / STEPS_PER_MEASURE >= MAX_MEASURES}
          >
            + Add measure
          </Button>
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

      {harmonization ? (
        <>
          <p className="text-sm text-muted-foreground">
            Detected key:{" "}
            <span className="font-medium text-foreground">
              {harmonization.key.tonic} {harmonization.key.mode}
            </span>{" "}
            ({Math.round(harmonization.key.confidence * 100)}% confidence)
          </p>

          <ChordSuggestions
            harmonization={harmonization}
            selectedDegrees={selectedDegrees}
            onSelectDegree={handleSelectDegree}
          />

          <div className="flex items-center gap-2">
            <Input
              placeholder="Progression name"
              value={progressionName}
              onChange={(e) => setProgressionName(e.target.value)}
            />
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Record a melody or click on the grid above to see chord suggestions.
        </p>
      )}

      {progressionsError && (
        <p className="text-sm text-destructive">{progressionsError}</p>
      )}

      <SavedProgressions
        progressions={progressions}
        onLoad={handleLoad}
        onDelete={remove}
      />
    </div>
  );
}
