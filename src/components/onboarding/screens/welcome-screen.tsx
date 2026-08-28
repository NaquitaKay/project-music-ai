import { HeroPreview } from "~/components/marketing/hero-preview";

export function WelcomeScreen({
  headingRef,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="flex flex-col gap-4 text-center md:text-left">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-3xl tracking-tight outline-none sm:text-4xl"
        >
          Turn your melody into chords.
        </h1>
        <p className="text-muted-foreground">
          Start with an idea. Discover the harmony behind it and explore where
          your music could go next.
        </p>
      </div>
      <HeroPreview />
    </div>
  );
}
