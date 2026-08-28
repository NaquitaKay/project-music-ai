import Link from "next/link";
import { redirect } from "next/navigation";
import { resetOnboarding } from "~/app/onboarding/actions";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/server";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center gap-10 px-6 py-12 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          What are you creating today?
        </h1>
        <p className="text-muted-foreground">Start with a melody.</p>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="flex-1">
            <Link href="/melody-to-chords">🎙 Record a melody</Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="flex-1"
            disabled
          >
            🎵 Upload audio
            <Badge variant="secondary" className="ml-1">
              Coming soon
            </Badge>
          </Button>
        </div>

        <span className="text-sm text-muted-foreground">— or —</span>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Link href="/chord-suggester">🎹 Enter notes manually</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Not sure where to start?
        </p>
        <button
          type="button"
          disabled
          className="text-sm text-muted-foreground/60 underline underline-offset-4"
        >
          Try an example melody → (coming soon)
        </button>
      </div>

      <form action={resetOnboarding}>
        <button
          type="submit"
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Restart onboarding
        </button>
      </form>
    </div>
  );
}
