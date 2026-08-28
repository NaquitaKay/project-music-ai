import { ChordSuggestions } from "~/components/chord-suggestions";
import { SaveProgressionForm } from "~/components/save-progression-form";
import type { HarmonizationResult } from "~/lib/music/types";

type HarmonizationPanelProps = {
  harmonization: HarmonizationResult | null;
  selectedDegrees: Record<number, number>;
  onSelectDegree: (measureIndex: number, degree: number) => void;
  onSave: (name: string) => void | Promise<void>;
  emptyMessage: string;
};

export function HarmonizationPanel({
  harmonization,
  selectedDegrees,
  onSelectDegree,
  onSave,
  emptyMessage,
}: HarmonizationPanelProps) {
  if (!harmonization) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Detected key:{" "}
        <span className="font-medium text-foreground">
          {harmonization.key.tonic} {harmonization.key.mode}
        </span>{" "}
        ({Math.round(harmonization.key.confidence * 100)}% confidence)
      </p>

      <ChordSuggestions
        harmonization={harmonization}
        selectedDegrees={selectedDegrees}
        onSelectDegree={onSelectDegree}
      />

      <SaveProgressionForm onSave={onSave} />
    </>
  );
}
