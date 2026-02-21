import { describe, expect, it } from "vitest";

import { deriveReadiness } from "./readiness";

const NOW = "2026-02-21T16:00:00Z";

type Case =
  | {
      name: string;
      input: Parameters<typeof deriveReadiness>[0];
      expect: ReturnType<typeof deriveReadiness>;
    }
  | {
      name: string;
      input: Parameters<typeof deriveReadiness>[0];
      throws: RegExp;
    };

const cases: Case[] = [
  {
    name: "failed precedence beats fresh",
    input: {
      now: NOW,
      domain: {
        lastSuccessAt: "2026-02-21T15:59:30Z", // fresh by age
        lastAttemptAt: "2026-02-21T15:59:50Z",
        lastAttemptOk: false,
      },
      thresholds: { freshUnderSeconds: 86400, staleUnderSeconds: 259200, failureGraceSeconds: 0 },
    },
    expect: { status: "failed", ageSeconds: null },
  },
  {
    name: "lastAttemptOk without lastAttemptAt throws",
    input: { now: NOW, domain: { lastSuccessAt: NOW, lastAttemptOk: true } },
    throws: /lastAttemptAt is required/,
  },
  {
    name: "boundary at freshUnderSeconds => stale",
    input: {
      now: NOW,
      domain: { lastSuccessAt: "2026-02-20T16:00:00Z" }, // 86400s old
      thresholds: { freshUnderSeconds: 86400, staleUnderSeconds: 259200 },
    },
    expect: { status: "stale", ageSeconds: 86400 },
  },
  {
    name: "boundary at staleUnderSeconds => unknown",
    input: {
      now: NOW,
      domain: { lastSuccessAt: "2026-02-18T16:00:00Z" }, // 259200s old
      thresholds: { freshUnderSeconds: 86400, staleUnderSeconds: 259200 },
    },
    expect: { status: "unknown", ageSeconds: 259200 },
  },
  {
    name: "invalid now throws",
    input: { now: "not-a-date", domain: { lastSuccessAt: NOW } },
    throws: /Invalid now timestamp/,
  },
  {
    name: "invalid lastSuccessAt throws",
    input: { now: NOW, domain: { lastSuccessAt: "not-a-date" } },
    throws: /Invalid lastSuccessAt timestamp/,
  },
  {
    name: "invalid lastAttemptAt throws",
    input: { now: NOW, domain: { lastSuccessAt: NOW, lastAttemptAt: "not-a-date", lastAttemptOk: false } },
    throws: /Invalid lastAttemptAt timestamp/,
  },
  {
    name: "staleUnderSeconds < freshUnderSeconds throws",
    input: {
      now: NOW,
      domain: { lastSuccessAt: NOW },
      thresholds: { freshUnderSeconds: 100, staleUnderSeconds: 99 },
    },
    throws: /staleUnderSeconds must be >= freshUnderSeconds/,
  },
];

describe("deriveReadiness", () => {
  for (const c of cases) {
    it(c.name, () => {
      if ("throws" in c) {
        expect(() => deriveReadiness(c.input)).toThrow(c.throws);
        return;
      }

      expect(deriveReadiness(c.input)).toEqual(c.expect);
    });
  }
});
