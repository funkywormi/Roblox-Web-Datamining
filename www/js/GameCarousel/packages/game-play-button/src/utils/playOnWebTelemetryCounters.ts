import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

const playButtonCounter = createFireTelemetryCounter("PlayButton");

// Counter names are sent as PlayButton_{name} via web-telemetry
export const playOnWebTelemetryCounters = {
  impression: "PlayOnWebImpression",
  click: "PlayOnWebClick",
};

export const firePlayOnWebImpressionCounter = (): void => {
  playButtonCounter(playOnWebTelemetryCounters.impression);
};

export const firePlayOnWebClickCounter = (): void => {
  playButtonCounter(playOnWebTelemetryCounters.click);
};
