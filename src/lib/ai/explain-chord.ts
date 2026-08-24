import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "~/env";

// Cheap/fast model: the explanation is a short, fully-grounded rewording of
// facts we already computed, not open-ended reasoning, so it doesn't need a
// larger model - keeps a per-click feature affordable at volume.
const MODEL = "claude-haiku-4-5-20251001";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

export type ExplainChordInput = {
  tonic: string;
  mode: "major" | "minor";
  roman: string;
  symbol: string;
  chordNotes: string[];
  melodyPitches: string[];
  isRecommended: boolean;
};

function buildPrompt(input: ExplainChordInput): string {
  const role = input.isRecommended
    ? "This is the top-recommended chord for this measure."
    : "This is a valid alternate option for this measure.";

  return `You are a friendly music theory tutor. Explain in 2-4 short sentences why this chord works to harmonize the given melody. Only use the facts listed below - do not invent additional theory, history, or facts not given here.

Key: ${input.tonic} ${input.mode}
Chord: ${input.symbol} (scale degree ${input.roman})
Chord tones: ${input.chordNotes.join(", ")}
Melody notes in this measure: ${input.melodyPitches.join(", ") || "(no notes - rest)"}
${role}

Keep the tone encouraging and easy for a beginner/intermediate musician to follow.`;
}

export async function explainChord(input: ExplainChordInput): Promise<string> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text.trim() : "";
}
