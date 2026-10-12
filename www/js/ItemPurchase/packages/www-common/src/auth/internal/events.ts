import environmentUrls from "@rbx/environment-urls";
import { Configuration, Tracker } from "@rbx/event-stream";
import type { BatGenerationErrorInfo } from "./types";

// Sampling constant.
export const ONE_MILLION = 1_000_000;

const HBA_CONTEXT = "hba";

type EventProperties = Record<string, string>;

let tracker: Tracker | null = null;
const getTracker = (): Tracker => {
  tracker ??= new Tracker(
    new Configuration({ baseUrl: `https://ecsv2.${environmentUrls.domain}/www` }),
  );
  return tracker;
};

// Both .NET and Next.js send through @rbx/event-stream. Unlike .NET's EventStream global this omits
// the page's session/guest IDs, which aren't needed for these BAT signals.
const sendHbaEvent = (eventName: string, additionalProperties: EventProperties): void => {
  if (typeof window === "undefined") {
    return;
  }
  getTracker().sendEventViaImg({
    target: "www",
    localTime: new Date(),
    eventType: eventName,
    context: HBA_CONTEXT,
    additionalProperties,
  });
};

export const sendBATSuccessEvent = (url: string, sampleRatePerMillion: number): void => {
  const shouldSampleEvent = Math.random() * ONE_MILLION < sampleRatePerMillion;
  if (shouldSampleEvent) {
    sendHbaEvent("batCreated", { field: url });
  }
};

export const sendBATMissingEvent = (
  url: string,
  errorInfo: BatGenerationErrorInfo,
  sampleRatePerMillion: number,
): void => {
  const shouldSampleEvent = Math.random() * ONE_MILLION < sampleRatePerMillion;
  if (shouldSampleEvent) {
    sendHbaEvent("batMissing", { field: url, kind: errorInfo.kind, messageRaw: errorInfo.message });
  }
};
