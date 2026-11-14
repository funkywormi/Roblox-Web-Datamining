import type { AnyRegistry, MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { getInternalPageName } from "../../utils/getInternalPageName";

export type AppShellHost = "nextjs" | "dotnet";

/**
 * Pages with their own `page` value on App Shell counters: the ones in a Next.js migration
 * experiment. Every other page is `other`, which keeps the label under the telemetry backend's
 * 10-value limit (it folds the rest into `__ALL_OTHERS__`).
 */
export const appShellPages = ["Messages", "Avatar"] as const;

const toAppShellPage = (internalPageName: string | undefined): string =>
  appShellPages.find(page => page === internalPageName) ?? "other";

type Publish = (name: string, dimensions?: Record<string, string>) => void;

type Obs<R extends AnyRegistry> = MakeObservabilityTypes<R>;

/** Takes every dimension but `host` and `page`, which the tracker adds. `page` can be overridden. */
export type TrackAppShellCounter<R extends AnyRegistry> = <N extends Obs<R>["CounterName"]>(
  name: N,
  dimensions: Record<Exclude<Obs<R>["DimensionsFor"][N], "host" | "page">, string> & {
    page?: string;
  },
) => void;

/**
 * Creates a tracker for `registry`'s counters that adds `host`, and `page` from the page's
 * internal page name when the counter has a `page` dimension and the caller didn't pass one.
 */
export const createAppShellTracker =
  <R extends AnyRegistry>(
    registry: R,
    publish: Publish,
    host: AppShellHost,
  ): TrackAppShellCounter<R> =>
  (name, dimensions) => {
    const hasPage = Object.values(registry.features).some(feature =>
      feature.counters?.some(
        counter =>
          typeof counter !== "string" &&
          counter.name === name &&
          counter.dimensions?.includes("page") === true,
      ),
    );
    publish(name, {
      ...(hasPage && dimensions.page == null
        ? { page: toAppShellPage(getInternalPageName()) }
        : {}),
      ...dimensions,
      host,
    });
  };
