import { PianoRollExplorer } from "~/components/marketing/piano-roll-explorer";

export function ReadyScreen({
  headingRef,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 text-center md:text-left">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl tracking-tight outline-none sm:text-4xl"
        >
          Your next chord is waiting.
        </h1>
        <p className="text-muted-foreground">
          Add a melody, discover chords that fit, and explore new directions for
          your music.
        </p>
        <p className="text-sm text-muted-foreground">
          No music theory required.
        </p>
      </div>
      <PianoRollExplorer />
    </div>
  );
}
