const INPUT_METHODS = [
  { icon: "🎙", label: "Record" },
  { icon: "🎵", label: "Upload" },
  { icon: "🎹", label: "Play" },
  { icon: "✏️", label: "Enter notes" },
];

export function MelodyInputScreen({
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
          Start with a melody
        </h1>
        <p className="text-muted-foreground">
          Sing it, play it, upload it, or enter your notes. Start with your
          idea, then discover the harmony behind it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INPUT_METHODS.map((method) => (
          <div
            key={method.label}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-5 text-center transition-colors hover:border-foreground/30"
          >
            <span className="text-2xl" aria-hidden>
              {method.icon}
            </span>
            <span className="text-sm font-medium">{method.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
