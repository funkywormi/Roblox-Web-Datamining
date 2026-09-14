/**
 * The wizard's eventstream contract. Mirrored 1:1 by the Lua client at
 * lua-apps/modules/account-identity/amp-v2-wizard/src/WizardEventNames.lua — change both.
 */

export const WIZARD_EVENT_CONTEXT = "ampV2Wizard";

export const WizardEventName = {
  FlowStart: "ampWizardFlowStart",
  NodeShown: "ampWizardNodeShown",
  NodeOutcome: "ampWizardNodeOutcome",
  ContinueFailed: "ampWizardContinueFailed",
  FlowExit: "ampWizardFlowExit",
} as const;

export type WizardEventName = (typeof WizardEventName)[keyof typeof WizardEventName];
