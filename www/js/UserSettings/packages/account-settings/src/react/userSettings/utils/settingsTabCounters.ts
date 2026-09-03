import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";
import RouterPath from "../../../enums/RouterPath";

const accountSettingsCounter = createFireTelemetryCounter("AccountSettings");

// All counter names are sent as AccountSettings_{name} via web-telemetry
// For example, fireTabViewCounter sends AccountSettings_TabView
export const settingsTabCounters = {
  tabView: "TabView",
};

// Realtime counterpart to the authPageload event
export const fireTabViewCounter = (tab: RouterPath, ageState: string): void => {
  accountSettingsCounter(settingsTabCounters.tabView, { tab, ageState });
};
