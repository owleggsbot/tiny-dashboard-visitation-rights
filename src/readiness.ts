export type ReadinessStatus = "fresh" | "stale" | "unknown" | "failed";

export type ReadinessInput = {
  lastSuccessAt?: string; // ISO timestamp
  lastAttemptAt?: string; // ISO timestamp
  lastAttemptOk?: boolean;
  now?: string; // ISO timestamp (defaults to Date.now())
  config?: {
    freshUnderSeconds?: number; // default 86400
    staleUnderSeconds?: number; // default 259200
    failureGraceSeconds?: number; // default 0
  };
};

export type ReadinessDerived = {
  ageSeconds: number | null;
  status: ReadinessStatus;
};

export function deriveReadiness(input: ReadinessInput): ReadinessDerived {
  const freshUnder = input.config?.freshUnderSeconds ?? 86400;
  const staleUnder = input.config?.staleUnderSeconds ?? 259200;
  const failureGrace = input.config?.failureGraceSeconds ?? 0;

  const nowMs = input.now ? Date.parse(input.now) : Date.now();
  if (Number.isNaN(nowMs)) throw new Error("Invalid now timestamp");

  if (staleUnder < freshUnder) {
    throw new Error("staleUnderSeconds must be >= freshUnderSeconds");
  }

  // Validation: lastAttemptOk requires lastAttemptAt
  if (typeof input.lastAttemptOk === "boolean" && !input.lastAttemptAt) {
    throw new Error("lastAttemptAt is required when lastAttemptOk is provided");
  }

  const attemptMs = input.lastAttemptAt ? Date.parse(input.lastAttemptAt) : null;
  if (input.lastAttemptAt && Number.isNaN(attemptMs!)) {
    throw new Error("Invalid lastAttemptAt timestamp");
  }

  // Precedence: failed wins before freshness buckets
  if (input.lastAttemptOk === false && attemptMs !== null) {
    const sinceAttempt = Math.max(0, Math.floor((nowMs - attemptMs) / 1000));
    if (sinceAttempt >= failureGrace) return { ageSeconds: null, status: "failed" };
  }

  if (!input.lastSuccessAt) return { ageSeconds: null, status: "unknown" };

  const successMs = Date.parse(input.lastSuccessAt);
  if (Number.isNaN(successMs)) throw new Error("Invalid lastSuccessAt timestamp");

  const ageSeconds = Math.max(0, Math.floor((nowMs - successMs) / 1000));

  if (ageSeconds < freshUnder) return { ageSeconds, status: "fresh" };
  if (ageSeconds < staleUnder) return { ageSeconds, status: "stale" };
  return { ageSeconds, status: "unknown" };
}
