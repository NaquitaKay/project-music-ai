"use client";

import { useEffect, useMemo, useState } from "react";
import { ChordSuggestions } from "~/components/chord-suggestions";
import { GenreMoodDiscover } from "~/components/genre-mood-discover";
import { NoteGrid } from "~/components/note-grid";
import { PlaybackControls } from "~/components/playback-controls";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useChordPlayback } from "~/hooks/use-chord-playback";
import { harmonize } from "~/lib/music/harmonize";
import { createEmptyMelody, isMelodyEmpty } from "~/lib/music/melody";
import type { Melody } from "~/lib/music/types";
import { STEPS_PER_MEASURE } from "~/lib/music/types";
import {
  exportProgressionAsJson,
  loadProgressions,
  type SavedProgression,
  saveProgressions,
} from "~/lib/storage/progressions";

const MEASURE_OPTIONS = [2, 4];

export default function ChordSuggesterPage() {
  const [measures, setMeasures] = useState(2);
  const [melody, setMelody] = useState<Melody>(() => createEmptyMelody(2));
  const [selectedDegrees, setSelectedDegrees] = useState<
    Record<number, number>
  >({});
  const [savedProgressions, setSavedProgressions] = useState<
    SavedProgression[]
  >([]);
  const [progressionName, setProgressionName] = useState("");

  useEffect(() => {
    setSavedProgressions(loadProgressions());
  }, []);

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

  function handleSave() {
    if (!harmonization) return;
    const progression: SavedProgression = {
      id: crypto.randomUUID(),
      name: progressionName.trim() || "Untitled progression",
      melody,
      harmonization,
      createdAt: Date.now(),
    };
    setSavedProgressions((prev) => {
      const next = [progression, ...prev];
      saveProgressions(next);
      return next;
    });
    setProgressionName("");
  }

  function handleDelete(id: string) {
    setSavedProgressions((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProgressions(next);
      return next;
    });
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
          Click on the grid above to enter a melody and see chord suggestions.
        </p>
      )}

      {savedProgressions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved progressions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {savedProgressions.map((progression) => (
              <div
                key={progression.id}
                className="flex items-center justify-between text-sm"
              >
                <button
                  type="button"
                  className="text-left hover:underline"
                  onClick={() => handleLoad(progression)}
                >
                  {progression.name}
                </button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => exportProgressionAsJson(progression)}
                  >
                    Export
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(progression.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />

      <GenreMoodDiscover />
    </div>
  );
}
