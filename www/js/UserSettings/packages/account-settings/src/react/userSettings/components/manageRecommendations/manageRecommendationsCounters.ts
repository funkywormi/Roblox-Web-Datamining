import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

const accountSettingsCounter = createFireTelemetryCounter("AccountSettings");

// Sent as AccountSettings_SettingsSurfaceIssue
export const settingsSurfaceCounters = {
  issue: "SettingsSurfaceIssue",
};

export type SettingsSurfaceIssue =
  /** The surface couldn't be loaded or rendered. */
  | "LoadFailed"
  /** `surface` came back null. */
  | "SurfaceNull"
  /** The surface has no title or intro. */
  | "SurfaceWithoutPresentation";

/** Counts a way the page couldn't render what the server sent. Should stay at zero. */
export const fireSettingsSurfaceIssueCounter = (
  surface: string,
  issue: SettingsSurfaceIssue,
  detail = "None",
): void => {
  accountSettingsCounter(settingsSurfaceCounters.issue, { surface, issue, detail });
};
