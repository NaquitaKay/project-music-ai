"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  exportProgressionAsJson,
  type SavedProgression,
} from "~/lib/supabase/progressions";

type SavedProgressionsProps = {
  progressions: SavedProgression[];
  onLoad: (progression: SavedProgression) => void;
  onDelete: (id: string) => void;
};

export function SavedProgressions({
  progressions,
  onLoad,
  onDelete,
}: SavedProgressionsProps) {
  if (progressions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved progressions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {progressions.map((progression) => (
          <div
            key={progression.id}
            className="flex items-center justify-between text-sm"
          >
            <button
              type="button"
              className="text-left hover:underline"
              onClick={() => onLoad(progression)}
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
                onClick={() => onDelete(progression.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
