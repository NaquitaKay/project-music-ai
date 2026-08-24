"use client";

import { Fragment, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { GeneratedProgression } from "~/lib/ai/generate-progressions";
import {
  getCachedProgressions,
  progressionsCacheKey,
  setCachedProgressions,
} from "~/lib/ai/progressions-cache";
import { GENRES, type Genre, MOODS, type Mood } from "~/lib/music/genre-mood";

type DiscoverState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; progressions: GeneratedProgression[] };

export function GenreMoodDiscover() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [state, setState] = useState<DiscoverState>({ status: "idle" });

  async function handleDiscover() {
    if (!genre || !mood) return;
    const key = progressionsCacheKey(genre, mood);
    const cached = getCachedProgressions(key);
    if (cached) {
      setState({ status: "loaded", progressions: cached });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch("/api/generate-progressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, mood }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as {
        progressions: GeneratedProgression[];
      };
      setCachedProgressions(key, data.progressions);
      setState({ status: "loaded", progressions: data.progressions });
    } catch {
      setState({ status: "error" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discover by genre &amp; mood</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Genre
          </p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <Badge
                key={g}
                asChild
                variant={genre === g ? "default" : "outline"}
              >
                <button type="button" onClick={() => setGenre(g)}>
                  {g}
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Mood
          </p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Badge
                key={m}
                asChild
                variant={mood === m ? "default" : "outline"}
              >
                <button type="button" onClick={() => setMood(m)}>
                  {m}
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleDiscover}
          disabled={!genre || !mood || state.status === "loading"}
          className="self-start"
        >
          {state.status === "loading" ? "Discovering…" : "Discover"}
        </Button>

        {state.status === "error" && (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t generate progressions right now. Try again.
          </p>
        )}

        {state.status === "loaded" && (
          <div className="flex flex-col gap-3">
            {state.progressions.map((progression, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: progressions have no stable id, and duplicate chord sequences are possible across results
                key={`${progression.chords.join("-")}-${i}`}
                className="flex flex-col gap-2 rounded-lg border border-border p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {progression.chords.map((chord, j) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: chord's position in the sequence is its identity here (the same chord can repeat at different steps)
                    <Fragment key={`${chord}-${j}`}>
                      {j > 0 && (
                        <span aria-hidden className="text-muted-foreground/50">
                          →
                        </span>
                      )}
                      <Badge variant="secondary">{chord}</Badge>
                    </Fragment>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {progression.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
