import { NextResponse } from "next/server";
import { explainChord } from "~/lib/ai/explain-chord";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.tonic !== "string" ||
    (body.mode !== "major" && body.mode !== "minor") ||
    typeof body.roman !== "string" ||
    typeof body.symbol !== "string" ||
    !Array.isArray(body.chordNotes) ||
    !Array.isArray(body.melodyPitches)
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const explanation = await explainChord({
      tonic: body.tonic,
      mode: body.mode,
      roman: body.roman,
      symbol: body.symbol,
      chordNotes: body.chordNotes,
      melodyPitches: body.melodyPitches,
      isRecommended: Boolean(body.isRecommended),
    });
    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 502 },
    );
  }
}
