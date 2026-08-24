import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { env } from "~/env";
import type { Genre, Mood } from "~/lib/music/genre-mood";

// Same model as the chord explainer: fast/cheap is fine since this is a
// bounded, structured suggestion task, not open-ended reasoning.
const MODEL = "claude-haiku-4-5-20251001";
const PROGRESSION_COUNT = 3;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

const progressionSchema = z.object({
  chords: z.array(z.string()).min(3).max(6),
  description: z.string(),
});

const resultSchema = z.object({
  progressions: z.array(progressionSchema).min(1).max(PROGRESSION_COUNT),
});

export type GeneratedProgression = z.infer<typeof progressionSchema>;

const RETURN_PROGRESSIONS_TOOL: Anthropic.Tool = {
  name: "return_progressions",
  description:
    "Return chord progression suggestions matching the requested genre and mood.",
  input_schema: {
    type: "object",
    properties: {
      progressions: {
        type: "array",
        minItems: PROGRESSION_COUNT,
        maxItems: PROGRESSION_COUNT,
        items: {
          type: "object",
          properties: {
            chords: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: { type: "string" },
              description:
                "Chord symbols in order, e.g. ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7']",
            },
            description: {
              type: "string",
              description:
                "One short sentence on why this progression fits the genre and mood.",
            },
          },
          required: ["chords", "description"],
        },
      },
    },
    required: ["progressions"],
  },
};

function buildPrompt(genre: Genre, mood: Mood): string {
  return `You are a music theory assistant helping a songwriter explore chord progression ideas. A songwriter wants chord progression ideas for:

Genre: ${genre}
Mood: ${mood}

Suggest exactly ${PROGRESSION_COUNT} distinct 4-chord progressions that stylistically fit this genre and mood. Use standard chord symbols (e.g. Cmaj7, Am7, F, G7, Dm). For each progression, write one short, concrete sentence explaining why it suits this genre and mood - reference the actual harmonic movement, not generic praise.

Respond only by calling the return_progressions tool.`;
}

export async function generateProgressions(
  genre: Genre,
  mood: Mood,
): Promise<GeneratedProgression[]> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    tools: [RETURN_PROGRESSIONS_TOOL],
    tool_choice: { type: "tool", name: RETURN_PROGRESSIONS_TOOL.name },
    messages: [{ role: "user", content: buildPrompt(genre, mood) }],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return [];

  const parsed = resultSchema.safeParse(toolUse.input);
  return parsed.success ? parsed.data.progressions : [];
}
