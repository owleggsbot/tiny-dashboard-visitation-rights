export type ReadinessStatus = "fresh" | "stale" | "unknown" | "failed";

export type ReadinessDomain = {
  lastSuccessAt?: string; // ISO timestamp
  lastAttemptAt?: string; // ISO timestamp
  lastAttemptOk?: boolean;
};

export type ReadinessThresholds = {
  freshUnderSeconds?: number; // default 86400
  staleUnderSeconds?: number; // default 259200
  failureGraceSeconds?: number; // default 0
};

export type ReadinessInput = {
  /** Domain-first props: all “real world” timestamps live under domain. */
  domain: ReadinessDomain;

  now?: string; // ISO timestamp (defaults to Date.now())

  /** Knobs live under thresholds (not config). */
  thresholds?: ReadinessThresholds;
};

/**
 * Back-compat for pre-domain/thresholds call sites.
 *
 * Deprecated: prefer `ReadinessInput` with `{ domain, thresholds }`.
 */
export type ReadinessInputLegacy = ReadinessDomain & {
  now?: string;

  /** Legacy name for tuning knobs. */
  config?: ReadinessThresholds;

  /** Allow "thresholds" in legacy form too (a lot of call sites only moved one side). */
  thresholds?: ReadinessThresholds;
};

export type ReadinessDerived = {
  ageSeconds: number | null;
  status: ReadinessStatus;
};

function normalizeReadinessInput(input: ReadinessInput | ReadinessInputLegacy): ReadinessInput {
  if ("domain" in input) return input;

  return {
    now: input.now,
    thresholds: input.thresholds ?? input.config,
    domain: {
      lastSuccessAt: input.lastSuccessAt,
      lastAttemptAt: input.lastAttemptAt,
      lastAttemptOk: input.lastAttemptOk,
    },
  };
}

export function deriveReadiness(input: ReadinessInput | ReadinessInputLegacy): ReadinessDerived {
  const normalized = normalizeReadinessInput(input);

  const freshUnder = normalized.thresholds?.freshUnderSeconds ?? 86400;
  const staleUnder = normalized.thresholds?.staleUnderSeconds ?? 259200;
  const failureGrace = normalized.thresholds?.failureGraceSeconds ?? 0;

  const nowMs = normalized.now ? Date.parse(normalized.now) : Date.now();
  if (Number.isNaN(nowMs)) throw new Error("Invalid now timestamp");

  if (staleUnder < freshUnder) {
    throw new Error("staleUnderSeconds must be >= freshUnderSeconds");
  }

  const { lastAttemptAt, lastAttemptOk, lastSuccessAt } = normalized.domain;

  // Validation: lastAttemptOk requires lastAttemptAt
  if (typeof lastAttemptOk === "boolean" && !lastAttemptAt) {
    throw new Error("lastAttemptAt is required when lastAttemptOk is provided");
  }

  const attemptMs = lastAttemptAt ? Date.parse(lastAttemptAt) : null;
  if (lastAttemptAt && Number.isNaN(attemptMs!)) {
    throw new Error("Invalid lastAttemptAt timestamp");
  }

  // Precedence: failed wins before freshness buckets
  if (lastAttemptOk === false && attemptMs !== null) {
    const sinceAttempt = Math.max(0, Math.floor((nowMs - attemptMs) / 1000));
    if (sinceAttempt >= failureGrace) return { ageSeconds: null, status: "failed" };
  }

  if (!lastSuccessAt) return { ageSeconds: null, status: "unknown" };

  const successMs = Date.parse(lastSuccessAt);
  if (Number.isNaN(successMs)) throw new Error("Invalid lastSuccessAt timestamp");

  const ageSeconds = Math.max(0, Math.floor((nowMs - successMs) / 1000));

  if (ageSeconds < freshUnder) return { ageSeconds, status: "fresh" };
  if (ageSeconds < staleUnder) return { ageSeconds, status: "stale" };
  return { ageSeconds, status: "unknown" };
}
