import type { HarmonizationResult, Melody } from "~/lib/music/types";
import { createClient } from "~/lib/supabase/client";

export type ProgressionSource = "chord-suggester" | "melody-to-chords";

export type SavedProgression = {
  id: string;
  name: string;
  melody: Melody;
  harmonization: HarmonizationResult;
  source: ProgressionSource;
  createdAt: number;
};

type ProgressionRow = {
  id: string;
  name: string;
  melody: Melody;
  harmonization: HarmonizationResult;
  source: ProgressionSource;
  created_at: string;
};

function fromRow(row: ProgressionRow): SavedProgression {
  return {
    id: row.id,
    name: row.name,
    melody: row.melody,
    harmonization: row.harmonization,
    source: row.source,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function loadProgressions(
  source: ProgressionSource,
): Promise<SavedProgression[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("progressions")
    .select("id, name, melody, harmonization, source, created_at")
    .eq("source", source)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ProgressionRow[]).map(fromRow);
}

export async function saveProgression(input: {
  name: string;
  melody: Melody;
  harmonization: HarmonizationResult;
  source: ProgressionSource;
}): Promise<SavedProgression> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You need to be signed in to save a progression.");

  const { data, error } = await supabase
    .from("progressions")
    .insert({
      user_id: user.id,
      name: input.name,
      melody: input.melody,
      harmonization: input.harmonization,
      source: input.source,
    })
    .select("id, name, melody, harmonization, source, created_at")
    .single();

  if (error) throw error;
  return fromRow(data as ProgressionRow);
}

export async function deleteProgression(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("progressions").delete().eq("id", id);
  if (error) throw error;
}

export function exportProgressionAsJson(progression: SavedProgression) {
  const blob = new Blob([JSON.stringify(progression, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${progression.name || "progression"}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
