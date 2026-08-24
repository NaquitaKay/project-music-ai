"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  explanationCacheKey,
  getCachedExplanation,
  setCachedExplanation,
} from "~/lib/ai/explanation-cache";
import type { ChordSuggestion, HarmonizationResult } from "~/lib/music/types";

type ChordSuggestionsProps = {
  harmonization: HarmonizationResult;
  selectedDegrees: Record<number, number>;
  onSelectDegree: (measureIndex: number, degree: number) => void;
};

type ExplanationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; text: string };

function selectedDegreeFor(
  measure: HarmonizationResult["measures"][number],
  selectedDegrees: Record<number, number>,
): number {
  return (
    selectedDegrees[measure.measureIndex] ??
    measure.suggestions.find((s) => s.isRecommended)?.degree ??
    measure.suggestions[0]?.degree
  );
}

export function ChordSuggestions({
  harmonization,
  selectedDegrees,
  onSelectDegree,
}: ChordSuggestionsProps) {
  const [explanations, setExplanations] = useState<
    Record<string, ExplanationState>
  >({});

  async function handleExplain(
    melodyPitches: string[],
    suggestion: ChordSuggestion,
  ) {
    const key = explanationCacheKey({
      tonic: harmonization.key.tonic,
      mode: harmonization.key.mode,
      roman: suggestion.roman,
      melodyPitches,
    });

    const cached = getCachedExplanation(key);
    if (cached) {
      setExplanations((prev) => ({
        ...prev,
        [key]: { status: "loaded", text: cached },
      }));
      return;
    }

    setExplanations((prev) => ({ ...prev, [key]: { status: "loading" } }));
    try {
      const res = await fetch("/api/explain-chord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tonic: harmonization.key.tonic,
          mode: harmonization.key.mode,
          roman: suggestion.roman,
          symbol: suggestion.symbol,
          chordNotes: suggestion.notes,
          melodyPitches,
          isRecommended: suggestion.isRecommended,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { explanation: string };
      setCachedExplanation(key, data.explanation);
      setExplanations((prev) => ({
        ...prev,
        [key]: { status: "loaded", text: data.explanation },
      }));
    } catch {
      setExplanations((prev) => ({ ...prev, [key]: { status: "error" } }));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {harmonization.measures.map((measure) => {
        const selectedDegree = selectedDegreeFor(measure, selectedDegrees);
        const selectedSuggestion = measure.suggestions.find(
          (s) => s.degree === selectedDegree,
        );
        const explanationKey = selectedSuggestion
          ? explanationCacheKey({
              tonic: harmonization.key.tonic,
              mode: harmonization.key.mode,
              roman: selectedSuggestion.roman,
              melodyPitches: measure.melodyPitches,
            })
          : null;
        const explanationState: ExplanationState = explanationKey
          ? (explanations[explanationKey] ?? { status: "idle" })
          : { status: "idle" };

        return (
          <Card key={measure.measureIndex}>
            <CardHeader>
              <CardTitle>Measure {measure.measureIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {measure.suggestions.map((suggestion) => (
                  <Badge
                    key={suggestion.degree}
                    asChild
                    variant={
                      suggestion.degree === selectedDegree
                        ? "default"
                        : "outline"
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onSelectDegree(measure.measureIndex, suggestion.degree)
                      }
                    >
                      {suggestion.symbol} ({suggestion.roman})
                      {suggestion.isRecommended ? " ★" : ""}
                    </button>
                  </Badge>
                ))}
              </div>

              {selectedSuggestion && (
                <div className="text-sm">
                  {explanationState.status === "idle" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleExplain(measure.melodyPitches, selectedSuggestion)
                      }
                    >
                      Explain why this works
                    </Button>
                  )}
                  {explanationState.status === "loading" && (
                    <p className="text-muted-foreground">Thinking…</p>
                  )}
                  {explanationState.status === "error" && (
                    <p className="text-muted-foreground">
                      Couldn't generate an explanation right now.
                    </p>
                  )}
                  {explanationState.status === "loaded" && (
                    <p className="text-muted-foreground">
                      {explanationState.text}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
