import type { AnyRegistry, MakeObservabilityTypes } from "@rbx/observability-framework/types";

export type AppShellHost = "nextjs" | "dotnet";

type Publish = (name: string, dimensions?: Record<string, string>) => void;

type Obs<R extends AnyRegistry> = MakeObservabilityTypes<R>;

/** Takes every dimension but `host`, which the tracker adds. */
export type TrackAppShellCounter<R extends AnyRegistry> = <N extends Obs<R>["CounterName"]>(
  name: N,
  dimensions: Record<Exclude<Obs<R>["DimensionsFor"][N], "host">, string>,
) => void;

/** Creates a tracker for `registry`'s counters that adds `host` to each one. */
export const createAppShellTracker =
  <R extends AnyRegistry>(
    _registry: R,
    publish: Publish,
    host: AppShellHost,
  ): TrackAppShellCounter<R> =>
  (name, dimensions) => {
    publish(name, { ...dimensions, host });
  };
