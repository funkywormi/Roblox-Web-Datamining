/**
 * Sends analytic events for the ODP flow.
 */

import { useMemo } from "react";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { userId } from "@rbx/core-scripts/meta/user";

import {
  AgeGroupKey,
  AskCopyVariantKey,
  DefaultOdpIntroCopyVariant,
  OdpAssociatedText,
  OdpEventButton,
  OdpEventContext,
  OdpEventField,
  OdpEventName,
  OdpIntroCopyVariantKey,
  ParentSupervisionStateKey,
  PinPurposeKey,
  PinRevealState,
  ReverifyReasonKey,
  ReverifyVariants,
} from "./odpAnalyticsConstants";
import type { FlowAnalyticsStrings, NodeContext, OdpEventSurface } from "../types";

/** Analytics that ODP nodes can report. */
export type OdpAnalytics = {
  handoffShown: () => void;
  handoffContinue: () => void;
  handoffBack: () => void;
  prologueShown: () => void;
  prologueButtonClick: (outcome: string) => void;
  remoteRequestSent: () => void;
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
  pinEntryShown: () => void;
  pinEntryDigitsChanged: (digitCount: number) => void;
  pinEntryRevealToggled: (isRevealed: boolean) => void;
  pinEntryForgotPin: () => void;
  pinEntryIncorrect: () => void;
  reverifyShown: () => void;
  reverifyButtonClick: (outcome: string) => void;
  reverifyClose: () => void;
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

/**
 * Parental events are positional, so a missing analytics session id must not shift later tokens.
 */
function buildSurfaceState(
  surface: OdpEventSurface,
  analyticsSessionId: string | undefined,
  ageGroup: string | undefined,
  extras: (string | undefined)[],
): string | undefined {
  if (analyticsSessionId == null || analyticsSessionId === "") {
    return undefined;
  }
  const id = userId();
  const identity = [analyticsSessionId, ageGroup, id == null ? undefined : String(id)];
  const tokens =
    surface.type === "GameJoin"
      ? [...identity, surface.universeId, "odp", ...extras]
      : ["unlockSetting", surface.settingName, "odp", ...identity, ...extras];
  return tokens.filter((token): token is string => token != null && token !== "").join(" ");
}

export function createOdpAnalytics(
  strings?: FlowAnalyticsStrings,
  analyticsSessionId?: string,
  surface?: OdpEventSurface,
): OdpAnalytics {
  const ageGroup = strings?.[AgeGroupKey];
  const askCopyVariant = strings?.[AskCopyVariantKey];
  const parentSupervisionState = strings?.[ParentSupervisionStateKey];
  const configuredCopyVariant = strings?.[OdpIntroCopyVariantKey];
  const agreementState = (copyVariant?: string): string =>
    buildState(
      analyticsSessionId,
      ageGroup,
      copyVariant ?? configuredCopyVariant ?? DefaultOdpIntroCopyVariant,
    );

  const pinPurpose = strings?.[PinPurposeKey];
  const reverifyReason = strings?.[ReverifyReasonKey];
  const reverifyVariant = reverifyReason == null ? undefined : ReverifyVariants[reverifyReason];

  // Every PIN entry row puts the purpose right after the child user id, ahead of the row's own token.
  const pinEntryState = (extra?: string): string =>
    buildState(
      analyticsSessionId,
      ageGroup,
      [pinPurpose, extra].filter(token => token != null && token !== "").join(" "),
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
    prologueShown: () => {
      // The settings surface's view belongs to the locked settings page, outside this package.
      if (surface?.type !== "GameJoin") {
        return;
      }
      const state = buildSurfaceState(surface, analyticsSessionId, ageGroup, [askCopyVariant]);
      if (state == null) {
        return;
      }
      sendEventWithTarget(OdpEventName.ModalShown, OdpEventContext.GameJoinContentMaturityLock, {
        field: OdpEventField.AskParent,
        state,
        associatedText: OdpAssociatedText.Prologue,
      });
    },
    prologueButtonClick: outcome => {
      if (
        surface === undefined ||
        (outcome !== "ODP" && outcome !== "Remote" && outcome !== "Cancel")
      ) {
        return;
      }

      const isGameJoin = surface.type === "GameJoin";
      const isCancel = outcome === "Cancel";
      const btn = isCancel
        ? isGameJoin
          ? OdpEventButton.CancelAskParent
          : OdpEventButton.Cancel
        : outcome === "ODP"
          ? OdpEventButton.AskInPerson
          : isGameJoin
            ? OdpEventButton.AskParent
            : OdpEventButton.EmailParent;
      const associatedText = isCancel
        ? OdpAssociatedText.Cancel
        : outcome === "ODP"
          ? OdpAssociatedText.AskInPerson
          : OdpAssociatedText.AskViaEmail;
      const extras = isGameJoin
        ? [isCancel ? undefined : askCopyVariant]
        : [outcome === "ODP" ? parentSupervisionState : undefined];
      const state = buildSurfaceState(surface, analyticsSessionId, ageGroup, extras);
      if (state == null) {
        return;
      }

      sendEventWithTarget(
        OdpEventName.ButtonClick,
        isGameJoin
          ? OdpEventContext.GameJoinContentMaturityLock
          : OdpEventContext.ParentalEntrySettings,
        {
          btn,
          state,
          associatedText,
        },
      );
    },
    remoteRequestSent: () => {
      if (surface === undefined) {
        return;
      }
      const state = buildSurfaceState(surface, analyticsSessionId, ageGroup, []);
      if (state == null) {
        return;
      }
      sendEventWithTarget(
        OdpEventName.MsgShown,
        surface.type === "GameJoin"
          ? OdpEventContext.GameJoinContentMaturityLock
          : OdpEventContext.ParentalEntrySettings,
        {
          field: OdpEventField.RequestSentToast,
          state,
          associatedText: OdpAssociatedText.RequestSent,
        },
      );
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
    pinEntryShown: () => {
      sendEventWithTarget(OdpEventName.Pageload, OdpEventContext.PinEntry, {
        state: pinEntryState(),
        // Runs the parent started have no purpose, and their copy has no spec row.
        associatedText:
          pinPurpose != null && pinPurpose !== "" ? OdpAssociatedText.PinEntryShown : undefined,
      });
    },
    pinEntryDigitsChanged: digitCount => {
      sendEventWithTarget(OdpEventName.FormInteraction, OdpEventContext.PinEntry, {
        field: OdpEventField.PinEntry,
        state: pinEntryState(String(digitCount)),
        associatedText: OdpAssociatedText.PinEntry,
      });
    },
    pinEntryRevealToggled: isRevealed => {
      sendEventWithTarget(OdpEventName.FormInteraction, OdpEventContext.PinEntry, {
        field: OdpEventField.PinShowToggle,
        state: pinEntryState(isRevealed ? PinRevealState.Shown : PinRevealState.Hidden),
        // The label on the toggle when it was tapped.
        associatedText: isRevealed
          ? OdpAssociatedText.PinShowToggle
          : OdpAssociatedText.PinHideToggle,
      });
    },
    pinEntryForgotPin: () => {
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.PinEntry, {
        btn: OdpEventButton.ForgotPin,
        state: pinEntryState(),
        associatedText: OdpAssociatedText.ForgotPin,
      });
    },
    pinEntryIncorrect: () => {
      sendEventWithTarget(OdpEventName.MsgShown, OdpEventContext.PinEntry, {
        field: OdpEventField.PinIncorrect,
        state: pinEntryState(),
      });
    },
    reverifyShown: () => {
      if (reverifyVariant == null) {
        return;
      }
      sendEventWithTarget(OdpEventName.ModalShown, OdpEventContext.PinRecovery, {
        state: buildState(analyticsSessionId, ageGroup),
        field: reverifyVariant.field,
        associatedText: reverifyVariant.associatedText,
      });
    },
    reverifyButtonClick: outcome => {
      const button = reverifyVariant?.buttons[outcome];
      if (button == null) {
        return;
      }
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.PinRecovery, {
        btn: button.btn,
        state: buildState(analyticsSessionId, ageGroup),
        associatedText: button.associatedText,
      });
    },
    reverifyClose: () => {
      if (reverifyVariant == null) {
        return;
      }
      sendEventWithTarget(OdpEventName.ButtonClick, OdpEventContext.PinRecovery, {
        btn: OdpEventButton.Close,
        state: buildState(analyticsSessionId, ageGroup),
        associatedText: OdpAssociatedText.PinRecoveryClose,
      });
    },
  };
}

/**
 * Hook that returns the ODP analytic reporters.
 */
export function useOdpAnalytics(
  ctx: Pick<NodeContext, "analyticsStrings" | "analyticsSessionId" | "odpEventSurface">,
): OdpAnalytics {
  return useMemo(
    () => createOdpAnalytics(ctx.analyticsStrings, ctx.analyticsSessionId, ctx.odpEventSurface),
    [ctx.analyticsStrings, ctx.analyticsSessionId, ctx.odpEventSurface],
  );
}
