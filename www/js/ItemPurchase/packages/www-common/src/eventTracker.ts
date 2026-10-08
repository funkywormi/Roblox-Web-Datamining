import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";

// Next-clean drop-in for the legacy window.EventTracker global: same report-event counters and
// report-stats timings, same endpoints, for use on both .NET and Next.js.

const metricsUrl = Url.parse(environmentUrls.metricsApi).getOrThrow();

// report-stats lives on the asset/game host, not metrics.
const reportStatsUrl = Url.parse(`https://assetgame.${environmentUrls.domain}`)
  .getOrThrow()
  .withPath("/game/report-stats");

// Fire-and-forget: core-lib captures errors in the Result; keepalive survives a page transition.
const post = (url: Url, name: string, extraParams?: Record<string, string>): void => {
  http.postUntyped(url.withSearchParams({ name, ...extraParams }), "", {
    credentials: "include",
    keepalive: true,
    signal: AbortSignal.timeout(30_000),
  });
};

export const fireEvent = (...names: string[]): void => {
  names.forEach(name => {
    post(metricsUrl.withPath("/v1/games/report-event"), name);
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
    post(reportStatsUrl, `${name}_${reason}`, { value: String(now - startedAt) });
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
