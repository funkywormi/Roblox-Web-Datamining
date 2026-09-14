/**
 * Eventstream transport for wizard events. `flattenParams` must stay behaviourally identical to the
 * Lua client's copy in WizardAnalytics.lua.
 */

import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";

import { WIZARD_EVENT_CONTEXT } from "./wizardEventNames";
import type { EventParams, SendEventFn } from "../types";

export type FlatEventParams = Record<string, string | number | boolean>;

type SendEventWithTarget = (eventName: string, context: string, params: FlatEventParams) => void;

/**
 * Eventstream can't carry a nested object, so drop non-scalars here rather than downstream. Nodes pass
 * server-authored `details` through `logEvent`, so hitting this is expected
 */
export function flattenParams(params?: EventParams): FlatEventParams {
  const flat: FlatEventParams = {};
  if (params == null) {
    return flat;
  }
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      flat[key] = value;
    }
  });
  return flat;
}

export function createSendWizardEvent(send: SendEventWithTarget): SendEventFn {
  return (eventName, params) => {
    send(eventName, WIZARD_EVENT_CONTEXT, flattenParams(params));
  };
}

export const sendWizardEvent: SendEventFn = createSendWizardEvent(sendEventWithTarget);
