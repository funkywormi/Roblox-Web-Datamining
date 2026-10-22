import { document } from "@rbx/core-lib/browser";
import { parseInt } from "@rbx/core-lib/number";

export type EventData = {
  phase: number;
  red: string;
  yellow: string;
  green: string;
  teal: string;
  blue: string;
  purple: string;
};

let cachedEventData: EventData | null | undefined;

const readEventData = () => {
  const data = document?.querySelector<HTMLMetaElement>('meta[name="event-data"]')?.dataset;
  if (data == null) {
    return null;
  }
  const phase = data.phase == null ? null : parseInt(data.phase);
  if (phase == null) {
    return null;
  }
  return {
    phase,
    red: data.red ?? "",
    yellow: data.yellow ?? "",
    green: data.green ?? "",
    teal: data.teal ?? "",
    blue: data.blue ?? "",
    purple: data.purple ?? "",
  };
};

export const eventData = (): EventData | null => {
  if (cachedEventData === undefined) {
    cachedEventData = readEventData();
  }
  return cachedEventData;
};
