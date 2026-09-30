/**
 * Sends analytic events for the ODP flow.
 */

import { useMemo } from "react";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { userId } from "@rbx/core-scripts/meta/user";

import {
  AgeGroupKey,
  DefaultOdpIntroCopyVariant,
  OdpAssociatedText,
  OdpEventButton,
  OdpEventContext,
  OdpEventField,
  OdpEventName,
  OdpIntroCopyVariantKey,
} from "./odpAnalyticsConstants";
import type { FlowAnalyticsStrings, NodeContext } from "../types";

/** Analytics that ODP nodes can report. */
export type OdpAnalytics = {
  handoffShown: () => void;
  handoffContinue: () => void;
  handoffBack: () => void;
  agreementShown: (copyVariant?: string) => void;
  agreementContinue: (copyVariant?: string) => void;
  agreementBack: (copyVariant?: string) => void;
  agreementTerms: (copyVariant?: string) => void;
  agreementPrivacy: (copyVariant?: string) => void;
  verificationMethodSelectorShown: (preselectedMethod?: string) => void;
  verificationMethodSelected: (methodId: string) => void;
  verificationMethodContinue: (methodId: string) => void;
  verificationMethodBack: () => void;
  verificationFailed: (methodId: string, errorCode: string | undefined) => void;
};

/**
 * Builds the `state` string attached to event (i.e "unlockSetting <settingName> odp <sessionUuid> <U13 / 13-17> childUserId")
 */
function buildState(analyticsSessionId?: string, ageGroup?: string, extra?: string): string {
  const id = userId();
  return [analyticsSessionId, ageGroup, id == null ? undefined : String(id), extra]
    .filter((token): token is string => token != null && token !== "")
    .join(" ");
}

export function createOdpAnalytics(
  strings?: FlowAnalyticsStrings,
  analyticsSessionId?: string,
): OdpAnalytics {
  const ageGroup = strings?.[AgeGroupKey];
  const configuredCopyVariant = strings?.[OdpIntroCopyVariantKey];
  const agreementState = (copyVariant?: string): string =>
    buildState(
      analyticsSessionId,
      ageGroup,
      copyVariant ?? configuredCopyVariant ?? DefaultOdpIntroCopyVariant,
    );

  return {
    handoffShown: () => {
      sendEventWithTarget(OdpEventName.Pageload, OdpEventContext.Handoff, {
        state: buildState(analyticsSessionId, ageGroup),
      });
    },
    handoffContinue: () => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.Handoff, {
        btn: OdpEventButton.ContinueAsParent,
        state: buildState(analyticsSessionId, ageGroup),
      });
    },
    handoffBack: () => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.Handoff, {
        btn: OdpEventButton.Back,
        state: buildState(analyticsSessionId, ageGroup),
      });
    },
    agreementShown: copyVariant => {
      sendEventWithTarget(OdpEventName.Pageload, OdpEventContext.Intro, {
        state: agreementState(copyVariant),
        associatedText: OdpAssociatedText.AgreementScreen,
      });
    },
    agreementContinue: copyVariant => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.Intro, {
        btn: OdpEventButton.Continue,
        state: agreementState(copyVariant),
        associatedText: OdpAssociatedText.AgreementContinue,
      });
    },
    agreementBack: copyVariant => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.Intro, {
        btn: OdpEventButton.Back,
        state: agreementState(copyVariant),
        associatedText: OdpAssociatedText.AgreementBack,
      });
    },
    agreementTerms: copyVariant => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.Intro, {
        btn: OdpEventButton.Terms,
        state: agreementState(copyVariant),
        associatedText: OdpAssociatedText.AgreementTerms,
      });
    },
    agreementPrivacy: copyVariant => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.Intro, {
        btn: OdpEventButton.Privacy,
        state: agreementState(copyVariant),
        associatedText: OdpAssociatedText.AgreementPrivacy,
      });
    },
    verificationMethodSelectorShown: preselectedMethod => {
      sendEventWithTarget(OdpEventName.Pageload, OdpEventContext.VerifyMethod, {
        state: buildState(analyticsSessionId, ageGroup),
        field: preselectedMethod,
        associatedText: OdpAssociatedText.VerificationMethodSelector,
      });
    },
    verificationMethodSelected: methodId => {
      sendEventWithTarget(OdpEventName.FormInteraction, OdpEventContext.VerifyMethod, {
        field: OdpEventField.VerifyMethod,
        state: buildState(analyticsSessionId, ageGroup, methodId),
        associatedText: OdpAssociatedText.VerificationMethodOptions,
      });
    },
    verificationMethodContinue: methodId => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.VerifyMethod, {
        btn: OdpEventButton.Continue,
        state: buildState(analyticsSessionId, ageGroup, methodId),
        associatedText: OdpAssociatedText.VerificationMethodContinue,
      });
    },
    verificationMethodBack: () => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.VerifyMethod, {
        btn: OdpEventButton.Back,
        state: buildState(analyticsSessionId, ageGroup),
        associatedText: OdpAssociatedText.VerificationMethodBack,
      });
    },
    verificationFailed: (methodId, errorCode) => {
      sendEventWithTarget(OdpEventName.ModalShown, OdpEventContext.VerifyMethod, {
        state: buildState(analyticsSessionId, ageGroup, methodId),
        field: OdpEventField.VerificationFailed,
        errorCode,
        associatedText: OdpAssociatedText.VerificationFailed,
      });
    },
  };
}

/**
 * Hook that returns the ODP analytic reporters.
 */
export function useOdpAnalytics(
  ctx: Pick<NodeContext, "analyticsStrings" | "analyticsSessionId">,
): OdpAnalytics {
  return useMemo(
    () => createOdpAnalytics(ctx.analyticsStrings, ctx.analyticsSessionId),
    [ctx.analyticsStrings, ctx.analyticsSessionId],
  );
}
