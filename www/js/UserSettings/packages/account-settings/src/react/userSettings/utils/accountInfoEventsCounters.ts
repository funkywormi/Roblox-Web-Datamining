import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

const accountSettingsCounter = createFireTelemetryCounter("AccountSettings");

// All counter names are sent as AccountSettings_{name} via web-telemetry
// For example, firePasskeyCreatedCounter sends AccountSettings_PasskeyCreated
export const accountInfoCounters = {
  passkeyPageLoad: "PasskeyPageLoad",
  passkeyCreated: "PasskeyCreated",
  passkeyCreationSource: "PasskeyCreationSource",
  ageCheckIdvDeeplink: "AgeCheckIdvDeeplink",
};

export const firePasskeyPageLoadCounter = (eligible: boolean, timeout?: boolean): void => {
  accountSettingsCounter(accountInfoCounters.passkeyPageLoad, {
    eligible,
    ...(timeout !== undefined && { timeout }),
  });
};

export const firePasskeyCreatedCounter = (state: string): void => {
  accountSettingsCounter(accountInfoCounters.passkeyCreated, { state });
};

export const firePasskeyCreationSourceCounter = (source: string): void => {
  accountSettingsCounter(accountInfoCounters.passkeyCreationSource, { source });
};

export const fireAgeCheckIdvDeeplinkCounter = (callSource: string): void => {
  accountSettingsCounter(accountInfoCounters.ageCheckIdvDeeplink, { callSource });
};
