/**
 * Sends analytic events for the ODP flow.
 */

import { useMemo } from "react";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { userId } from "@rbx/core-scripts/meta/user";

import {
  AgeGroupKey,
  OdpAssociatedText,
  OdpEventButton,
  OdpEventContext,
  OdpEventField,
  OdpEventName,
} from "./odpAnalyticsConstants";
import type { FlowAnalyticsStrings, NodeContext } from "../types";

/** Analytics that ODP nodes can report. */
export type OdpAnalytics = {
  verificationMethodSelectorShown: (sessionId?: string, preselectedMethod?: string) => void;
  verificationMethodSelected: (sessionId: string | undefined, methodId: string) => void;
  verificationMethodContinue: (sessionId: string | undefined, methodId: string) => void;
};

/**
 * Builds the `state` string attached to event (i.e "unlockSetting <settingName> odp <sessionUuid> <U13 / 13-17> childUserId")
 */
function buildState(sessionId?: string, ageGroup?: string, extra?: string): string {
  const id = userId();
  return [sessionId, ageGroup, id == null ? undefined : String(id), extra]
    .filter((token): token is string => token != null && token !== "")
    .join(" ");
}

export function createOdpAnalytics(strings?: FlowAnalyticsStrings): OdpAnalytics {
  const ageGroup = strings?.[AgeGroupKey];

  return {
    verificationMethodSelectorShown: (sessionId, preselectedMethod) => {
      sendEventWithTarget(OdpEventName.ModalShown, OdpEventContext.VerifyMethod, {
        state: buildState(sessionId, ageGroup),
        field: preselectedMethod,
        associatedText: OdpAssociatedText.VerificationMethodSelector,
      });
    },
    verificationMethodSelected: (sessionId, methodId) => {
      sendEventWithTarget(OdpEventName.FormInteraction, OdpEventContext.VerifyMethod, {
        field: OdpEventField.VerifyMethod,
        state: buildState(sessionId, ageGroup, methodId),
        associatedText: OdpAssociatedText.VerificationMethodOptions,
      });
    },
    verificationMethodContinue: (sessionId, methodId) => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.VerifyMethod, {
        btn: OdpEventButton.Continue,
        state: buildState(sessionId, ageGroup, methodId),
        associatedText: OdpAssociatedText.VerificationMethodContinue,
      });
    },
  };
}

/**
 * Hook that returns the ODP analytic reporters.
 */
export function useOdpAnalytics(ctx: Pick<NodeContext, "analyticsStrings">): OdpAnalytics {
  return useMemo(() => createOdpAnalytics(ctx.analyticsStrings), [ctx.analyticsStrings]);
}
