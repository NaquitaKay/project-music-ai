import { NextResponse } from "next/server";
import { generateProgressions } from "~/lib/ai/generate-progressions";
import { isGenre, isMood } from "~/lib/music/genre-mood";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.genre !== "string" ||
    typeof body.mood !== "string" ||
    !isGenre(body.genre) ||
    !isMood(body.mood)
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const progressions = await generateProgressions(body.genre, body.mood);
    return NextResponse.json({ progressions });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate progressions" },
      { status: 502 },
    );
  }
}
