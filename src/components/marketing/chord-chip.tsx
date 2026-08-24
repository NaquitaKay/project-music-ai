import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type ChordChipProps = {
  symbol: string;
  roman?: string;
  emphasis?: "default" | "muted";
  className?: string;
};

export function ChordChip({
  symbol,
  roman,
  emphasis = "default",
  className,
}: ChordChipProps) {
  return (
    <Badge
      variant={emphasis === "muted" ? "outline" : "default"}
      className={cn("gap-1.5 px-3.5 py-2 text-sm font-medium", className)}
    >
      <span className="font-display text-base">{symbol}</span>
      {roman && <span className="font-sans text-xs opacity-70">{roman}</span>}
    </Badge>
  );
}
