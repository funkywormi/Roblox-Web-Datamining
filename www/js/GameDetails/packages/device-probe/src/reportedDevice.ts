import { navigator } from "@rbx/core-lib/browser";
import type { ReportedDevice } from "./client/requiredSpec";

// Chrome's coarse RAM bucket in GiB. Firefox and Safari don't report it. Read without the ambient
// typing in globals.d.ts, which hosts that bundle the client don't load.
const deviceMemory = (): number | null => {
  const value: unknown = navigator == null ? undefined : Reflect.get(navigator, "deviceMemory");
  return typeof value === "number" && value > 0 ? value : null;
};

// What the browser reports about the device without measuring it.
export const reportedDevice = (): ReportedDevice => ({
  deviceMemoryGiB: deviceMemory(),
  // At least 1, even where the browser hides the count or reports 0.
  reportedCores: Math.max(navigator?.hardwareConcurrency ?? 1, 1),
});
