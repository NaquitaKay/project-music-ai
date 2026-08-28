"use client";

import { useCallback, useEffect, useState } from "react";
import type { HarmonizationResult, Melody } from "~/lib/music/types";
import {
  deleteProgression,
  loadProgressions,
  type ProgressionSource,
  type SavedProgression,
  saveProgression,
} from "~/lib/supabase/progressions";

export function useProgressions(source: ProgressionSource) {
  const [progressions, setProgressions] = useState<SavedProgression[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setProgressions(await loadProgressions(source));
      setError(null);
    } catch {
      setError("Couldn't load your saved progressions.");
    } finally {
      setIsLoading(false);
    }
  }, [source]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (
      name: string,
      melody: Melody,
      harmonization: HarmonizationResult,
    ) => {
      try {
        const saved = await saveProgression({
          name,
          melody,
          harmonization,
          source,
        });
        setProgressions((prev) => [saved, ...prev]);
        setError(null);
      } catch {
        setError("Couldn't save this progression.");
      }
    },
    [source],
  );

  const remove = useCallback(async (id: string) => {
    try {
      await deleteProgression(id);
      setProgressions((prev) => prev.filter((p) => p.id !== id));
      setError(null);
    } catch {
      setError("Couldn't delete this progression.");
    }
  }, []);

  return { progressions, isLoading, error, save, remove };
}
