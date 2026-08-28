"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { completeOnboarding } from "~/app/onboarding/actions";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { DirectionScreen } from "./screens/direction-screen";
import { MelodyInputScreen } from "./screens/melody-input-screen";
import { ReadyScreen } from "./screens/ready-screen";
import { WelcomeScreen } from "./screens/welcome-screen";

const STEP_COUNT = 4;

const PRIMARY_LABELS = [
  "Get started →",
  "Continue →",
  "Continue →",
  "Start creating →",
];

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const skip = useCallback(() => {
    startTransition(() => {
      completeOnboarding();
    });
  }, []);

  const goNext = useCallback(() => {
    if (step < STEP_COUNT - 1) {
      setStep(step + 1);
      return;
    }
    startTransition(() => {
      completeOnboarding();
    });
  }, [step]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goBack();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [skip, goNext, goBack]);

  // Re-focus the heading whenever the step changes - AnimatePresence
  // remounts a fresh <h1> per step (key={step}), and screen readers need
  // the cue even though `step` itself isn't read in the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: step drives which DOM node headingRef now points to
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div
          className="flex flex-1 gap-1.5"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEP_COUNT}
          aria-label={`Step ${step + 1} of ${STEP_COUNT}`}
        >
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: these are fixed positional progress segments (step 1..4), never reordered
              key={`progress-${i}`}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        {step < STEP_COUNT - 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={skip}
            disabled={isPending}
          >
            Skip
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={shouldReduceMotion ? undefined : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 && <WelcomeScreen headingRef={headingRef} />}
          {step === 1 && <MelodyInputScreen headingRef={headingRef} />}
          {step === 2 && <DirectionScreen headingRef={headingRef} />}
          {step === 3 && <ReadyScreen headingRef={headingRef} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        {step > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={isPending}
          >
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button type="button" onClick={goNext} disabled={isPending}>
          {PRIMARY_LABELS[step]}
        </Button>
      </div>
    </div>
  );
}
