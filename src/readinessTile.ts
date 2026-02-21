import { deriveReadiness, type ReadinessInput, type ReadinessStatus } from "./readiness";

export type ReadinessTile = {
  kind: "readiness";
  title: string;
  status: ReadinessStatus;
  subtitle: string;
  ageSeconds: number | null;
};

function formatAge(ageSeconds: number): string {
  if (ageSeconds < 60) return `${ageSeconds}s`;
  const minutes = Math.floor(ageSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function deriveReadinessTile(input: ReadinessInput & { title?: string }): ReadinessTile {
  const { status, ageSeconds } = deriveReadiness(input);

  // Keep default tile readable fast: 1 short line + optional age.
  const subtitle =
    status === "fresh"
      ? `Fresh${typeof ageSeconds === "number" ? ` · ${formatAge(ageSeconds)}` : ""}`
      : status === "stale"
        ? `Stale${typeof ageSeconds === "number" ? ` · ${formatAge(ageSeconds)}` : ""}`
        : status === "failed"
          ? "Failed"
          : "Unknown";

  return {
    kind: "readiness",
    title: input.title ?? "Readiness",
    status,
    subtitle,
    ageSeconds,
  };
}
