import Link from "next/link";
import { Fragment } from "react";
import { BranchingPaths } from "~/components/marketing/branching-paths";
import { HeroPreview } from "~/components/marketing/hero-preview";
import { MoodDirections } from "~/components/marketing/mood-directions";
import { ProgressionStrip } from "~/components/marketing/progression-strip";
import { Reveal } from "~/components/marketing/reveal";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

const MELODY_STEPS = [
  "Sing, hum, or enter notes",
  "Melody analysis",
  "Matching chords",
];

const MELODY_NOTES = ["C4", "E4", "G4", "B4"];

const MELODY_CHORDS = [{ symbol: "C" }, { symbol: "Am" }, { symbol: "F" }];

const DEMO_STEPS = [
  "Your progression",
  "Understand it",
  "Choose a direction",
  "Discover possibilities",
];

const UNDERSTAND_PROGRESSION = [
  { symbol: "C", roman: "I" },
  { symbol: "Am", roman: "vi" },
  { symbol: "F", roman: "IV" },
  { symbol: "G", roman: "V" },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid items-center gap-16 md:grid-cols-2 md:gap-12">
          <div className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground">
              Find the chords behind your melody. Discover what comes next.
            </p>
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Know your chords.
              <br />
              Discover what&apos;s next.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Understand the progression you&apos;re playing and explore new
              directions with AI-powered suggestions shaped around the mood you
              want.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/chord-suggester">Try it free</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>

          <Reveal delay={0.15}>
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      {/* How it works: (1) melody -> chord identification, (2) AI direction suggestions */}
      <section
        id="how-it-works"
        className="border-t border-border bg-muted/30 px-6 py-24 md:py-32"
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-20">
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              How it works
            </p>
            <h2 className="max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
              From what you&apos;re playing to where you could go
            </h2>
          </Reveal>

          {/* Step 1: melody to chord identification */}
          <div className="flex w-full flex-col items-center gap-10">
            <Reveal className="flex flex-col items-center gap-3 text-center">
              <span className="text-xs font-medium tracking-wide text-primary uppercase">
                Step 1
              </span>
              <h3 className="font-display text-2xl tracking-tight sm:text-3xl">
                Turn your melody into harmony
              </h3>
              <p className="max-w-lg text-muted-foreground">
                Sing, hum, or enter your notes, and discover the chords that fit
                your melody. Explore alternatives and understand why they work.
              </p>
            </Reveal>

            <Reveal
              delay={0.1}
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium"
            >
              {MELODY_STEPS.map((step, i) => (
                <Fragment key={step}>
                  {i > 0 && (
                    <span aria-hidden className="text-muted-foreground/40">
                      →
                    </span>
                  )}
                  <span
                    className={
                      i === MELODY_STEPS.length - 1
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {step}
                  </span>
                </Fragment>
              ))}
            </Reveal>

            <Reveal
              delay={0.15}
              className="w-full rounded-xl border border-border bg-card p-8"
            >
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                <div className="flex items-center gap-1.5">
                  {MELODY_NOTES.map((note) => (
                    <Badge
                      key={note}
                      variant="outline"
                      className="font-display"
                    >
                      {note}
                    </Badge>
                  ))}
                </div>
                <span aria-hidden className="text-muted-foreground/50">
                  →
                </span>
                <ProgressionStrip chords={MELODY_CHORDS} />
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="max-w-xl text-center text-sm text-muted-foreground">
                Built for a single melodic line — Lumos finds the chords that
                fit, offers alternatives to try, and explains why each one
                works.
              </p>
            </Reveal>
          </div>

          {/* Step 2: AI direction suggestions */}
          <div className="flex w-full flex-col items-center gap-10">
            <Reveal className="flex flex-col items-center gap-3 text-center">
              <span className="text-xs font-medium tracking-wide text-primary uppercase">
                Step 2
              </span>
              <h3 className="font-display text-2xl tracking-tight sm:text-3xl">
                Choose where it goes next
              </h3>
            </Reveal>

            <Reveal className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium">
              {DEMO_STEPS.map((step, i) => (
                <Fragment key={step}>
                  {i > 0 && (
                    <span aria-hidden className="text-muted-foreground/40">
                      →
                    </span>
                  )}
                  <span
                    className={
                      i === DEMO_STEPS.length - 1
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {step}
                  </span>
                </Fragment>
              ))}
            </Reveal>

            <Reveal delay={0.1} className="w-full">
              <div className="mb-6 text-center">
                <p className="font-display text-xl">
                  Where do you want to go next?
                </p>
              </div>
              <MoodDirections />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Understand your progression */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal className="flex flex-col gap-5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Understand your progression
            </p>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              It doesn&apos;t just give you chords. It tells you what
              you&apos;re playing.
            </h2>
            <p className="max-w-md text-muted-foreground">
              This is a classic I–vi–IV–V progression — one of the most familiar
              sequences in pop and rock. The vi chord borrows the tonic&apos;s
              relative minor for a touch of warmth before resolving home through
              the IV and V.
            </p>
          </Reveal>
          <Reveal
            delay={0.1}
            className="rounded-xl border border-border bg-card p-8"
          >
            <ProgressionStrip chords={UNDERSTAND_PROGRESSION} size="lg" />
          </Reveal>
        </div>
      </section>

      {/* Explore what comes next */}
      <section className="border-t border-border bg-muted/30 px-6 py-24 md:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-16">
          <Reveal className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Explore what comes next
            </p>
            <h2 className="max-w-lg font-display text-3xl tracking-tight sm:text-4xl">
              There isn&apos;t one correct next chord.
            </h2>
          </Reveal>

          <BranchingPaths />

          <Reveal>
            <p className="font-display text-xl text-muted-foreground">
              One progression. Many possibilities.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Made to inspire, not replace */}
      <section id="features" className="px-6 py-24 md:py-32">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Our philosophy
          </p>
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
            Made to inspire, not replace.
          </h2>
          <p className="text-lg text-muted-foreground">
            Lumos doesn&apos;t write your music for you. It shows you the theory
            behind what you&apos;re already playing, and opens doors to
            directions you might not have considered — moods, tensions,
            resolutions. The creative decision, the one that makes a song yours,
            stays with you.
          </p>
          <p className="text-muted-foreground">
            This isn&apos;t an AI songwriting tool. It&apos;s a way to see
            further into the music you&apos;re already making.
          </p>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-muted/30 px-6 py-24 md:py-32">
        <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
          <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
            Where will your music go next?
          </h2>
          <Button asChild size="lg">
            <Link href="/chord-suggester">Start exploring</Link>
          </Button>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span className="font-display text-base text-foreground">Lumos</span>
          <span>© {new Date().getFullYear()} Lumos. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
