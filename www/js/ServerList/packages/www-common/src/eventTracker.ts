import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";

// Next-clean drop-in for the legacy window.EventTracker global: same report-event counters and
// report-stats timings, same endpoints, for use on both .NET and Next.js.

// Parsed on first use, so importing this module never throws.
const getReportEventUrl = () =>
  Url.parse(environmentUrls.metricsApi).getOrThrow().withPath("/v1/games/report-event");

// report-stats lives on the asset/game host, not metrics.
const getReportStatsUrl = () =>
  Url.parse(`https://assetgame.${environmentUrls.domain}`)
    .getOrThrow()
    .withPath("/game/report-stats");

// Fire-and-forget: core-lib captures errors in the Result; keepalive survives a page transition.
// Never throws, like the legacy `window.EventTracker?.fireEvent`: callers fire counters during
// render and in catch blocks, so a bad host or a missing AbortSignal.timeout must not reach them.
const post = (getUrl: () => Url, name: string, extraParams?: Record<string, string>): void => {
  try {
    http.postUntyped(getUrl().withSearchParams({ name, ...extraParams }), "", {
      credentials: "include",
      keepalive: true,
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // A counter is never worth breaking the caller.
  }
};

export const fireEvent = (...names: string[]): void => {
  names.forEach(name => {
    post(getReportEventUrl, name);
  });
};

// Start times per sequence name, so a later end* can measure elapsed time.
const startTimes = new Map<string, number>();

export const start = (...statSequenceNames: string[]): void => {
  const now = Date.now();
  statSequenceNames.forEach(name => startTimes.set(name, now));
};

const end = (reason: "Success" | "Cancel" | "Failure", statSequenceNames: string[]): void => {
  const now = Date.now();
  statSequenceNames.forEach(name => {
    const startedAt = startTimes.get(name);
    // No matching start (or already ended) — no-op.
    if (startedAt === undefined) {
      return;
    }
    startTimes.delete(name);
    post(getReportStatsUrl, `${name}_${reason}`, { value: String(now - startedAt) });
  });
};

export const endSuccess = (...statSequenceNames: string[]): void => {
  end("Success", statSequenceNames);
};
export const endCancel = (...statSequenceNames: string[]): void => {
  end("Cancel", statSequenceNames);
};
export const endFailure = (...statSequenceNames: string[]): void => {
  end("Failure", statSequenceNames);
};
