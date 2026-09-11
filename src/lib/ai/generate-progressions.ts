import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { Genre, Mood } from "~/lib/music/genre-mood";

// Same model as the chord explainer: fast/cheap is fine since this is a
// bounded, structured suggestion task, not open-ended reasoning.
const MODEL = "google/gemini-2.5-flash-lite";
const PROGRESSION_COUNT = 3;

const progressionSchema = z.object({
  chords: z
    .array(z.string())
    .length(4)
    .describe("Chord symbols in order, e.g. ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7']"),
  description: z
    .string()
    .describe(
      "One short sentence on why this progression fits the genre and mood.",
    ),
});

const resultSchema = z.object({
  progressions: z.array(progressionSchema).length(PROGRESSION_COUNT),
});

export type GeneratedProgression = z.infer<typeof progressionSchema>;

function buildPrompt(genre: Genre, mood: Mood): string {
  return `You are a music theory assistant helping a songwriter explore chord progression ideas. A songwriter wants chord progression ideas for:

Genre: ${genre}
Mood: ${mood}

Suggest exactly ${PROGRESSION_COUNT} distinct 4-chord progressions that stylistically fit this genre and mood. Use standard chord symbols (e.g. Cmaj7, Am7, F, G7, Dm). For each progression, write one short, concrete sentence explaining why it suits this genre and mood - reference the actual harmonic movement, not generic praise.`;
}

export async function generateProgressions(
  genre: Genre,
  mood: Mood,
): Promise<GeneratedProgression[]> {
  const { output } = await generateText({
    model: MODEL,
    maxOutputTokens: 1024,
    output: Output.object({ schema: resultSchema }),
    prompt: buildPrompt(genre, mood),
  });

  return output.progressions;
}
