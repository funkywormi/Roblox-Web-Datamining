import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

export const observabilityRegistry = {
  featureName: "SilentPasskeyUpgrade",
  team: "Account Auth",
  defaultTimeCompare: { mode: "offset", offset: "7d" },
  features: {
    health: {
      counters: [
        { name: "UpgradeFlagObserved", dimensions: ["source"] },
        { name: "UpgradeSucceeded", dimensions: ["source", "browserFamily"] },
        { name: "UpgradeFlagInvalid", dimensions: ["reason"] },
      ],
      errors: [
        {
          name: "UpgradeFailed",
          dimensions: ["source", "browserFamily", "stage", "reason"],
        },
      ],
    },
    silentUpgrade: {
      apiCalls: ["SilentUpgradeEligibility", "StartRegistration", "FinishRegistration"],
      counters: [
        { name: "EligibilityPassed", dimensions: ["source"] },
        { name: "StartRegistrationSucceeded", dimensions: ["source"] },
        {
          name: "CredentialCreateAttempt",
          dimensions: ["source", "browserFamily", "browserMajor"],
        },
        {
          name: "CredentialCreated",
          dimensions: ["source", "browserFamily", "browserMajor"],
        },
        { name: "UpgradeIneligible", dimensions: ["source"] },
        { name: "UpgradeAborted", dimensions: ["source", "reason"] },
        { name: "UpgradeFilteredByBrowser", dimensions: ["source", "browserFamily"] },
        {
          name: "AlreadyHasPasskey",
          dimensions: ["source", "browserFamily", "browserMajor"],
        },
        {
          name: "CredentialCreateExpectedRejection",
          dimensions: ["source", "browserFamily", "browserMajor", "reason"],
        },
      ],
      errors: [
        {
          name: "CredentialCreateFailed",
          dimensions: ["source", "browserFamily", "browserMajor", "reason"],
        },
      ],
      flows: [
        {
          id: "silent_upgrade",
          title: "Silent upgrade",
          steps: [
            { counter: "UpgradeFlagObserved", role: "start", title: "Flag observed" },
            { counter: "EligibilityPassed", role: "neutral", title: "Eligible" },
            { counter: "UpgradeSucceeded", role: "success", title: "Succeeded" },
            { counter: "UpgradeFailed", role: "error", title: "Upgrade failed" },
            { counter: "CredentialCreateFailed", role: "error", title: "Create failed" },
          ],
        },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
});
