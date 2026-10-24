/**
 * Sends the VPC entry events for the Prologue and the remote parent request screens
 */

import { useMemo } from "react";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { userId } from "@rbx/core-scripts/meta/user";

import { AgeGroupKey, OdpEventButton, OdpEventName } from "./odpAnalyticsConstants";
import type { FlowAnalyticsStrings, NodeContext } from "../types";

export const VpcEntryEventContext = {
  WizardLaunch: "ampWizard",
  Prologue: "odpPrologue",
  RemoteParentRequest: "remoteParentEmailRequest",
} as const;

/** Whether the prologue offers asking in person (ODP), asking remote parent via email, or both */
export const PrologueType = {
  OdpAndRemote: "odpAndRemote",
  RemoteOnly: "remoteOnly",
  OdpOnly: "odpOnly",
} as const;

export type PrologueType = (typeof PrologueType)[keyof typeof PrologueType];

const Field = {
  AskParent: "askParent",
  EmailModal: "emailModal",
  Email: "email",
  ErrorMessage: "errorMessage",
  RequestSent: "requestSent",
} as const;

const Button = {
  Submit: "submit",
  Retry: "retry",
  Ok: "ok",
} as const;

const AssociatedText = {
  WizardLaunch: "AMP wizard launch",
  Prologue: "Ask your parent - You need parent approval to {takeChildAction}.",
  AskInPerson: "Ask in person",
  AskViaEmail: "Send an email",
  AskMyParent: "Ask my parent",
  Close: "X icon",
  EmailScreen:
    "Enter parent's email - Ask your parents to help you with this step. We'll send an email to your parent to verify their age and link them to your account. Parents, after linking, you'll get access to parental controls and insights on your child's screen time, spending, and more.",
  ParentEmail: "Parent's email",
  SendEmail: "Send Email",
  RequestSent: "Email sent",
  Ok: "Email sent > OK",
  Retry: "Something went wrong > Retry",
  Cancel: "Something went wrong > Cancel",
} as const;

type PrologueButton = { btn: string; associatedText: string };

const CloseButton: PrologueButton = {
  btn: OdpEventButton.Close,
  associatedText: AssociatedText.Close,
};

const AskMyParentButton: PrologueButton = {
  btn: OdpEventButton.AskParent,
  associatedText: AssociatedText.AskMyParent,
};

const PrologueButtons: Record<PrologueType, Record<string, PrologueButton>> = {
  [PrologueType.OdpAndRemote]: {
    ODP: { btn: OdpEventButton.AskInPerson, associatedText: AssociatedText.AskInPerson },
    Remote: { btn: OdpEventButton.EmailParent, associatedText: AssociatedText.AskViaEmail },
    Cancel: CloseButton,
  },
  [PrologueType.RemoteOnly]: { Remote: AskMyParentButton, Cancel: CloseButton },
  [PrologueType.OdpOnly]: { ODP: AskMyParentButton, Cancel: CloseButton },
};

export type VpcEntryAnalytics = {
  prologueShown: (prologueType: PrologueType) => void;
  prologueButtonClick: (outcome: string, prologueType: PrologueType) => void;
  remoteEmailShown: () => void;
  remoteEmailEntered: () => void;
  remoteEmailSubmit: () => void;
  remoteRequestSent: () => void;
  remoteRequestOk: () => void;
  remoteRequestError: (errorCode: string | undefined) => void;
  remoteRequestRetry: () => void;
  remoteRequestCancel: () => void;
  remoteRequestClose: () => void;
};

/**
 * Builds the `state` string (i.e. "<analyticsSessionId> <U13 / 13-17> childUserId <surface> [extras]").
 */
function buildState(
  analyticsSessionId: string | undefined,
  ageGroup: string | undefined,
  surface: string | undefined,
  ...extras: (string | undefined)[]
): string {
  const id = userId();
  return [analyticsSessionId, ageGroup, id == null ? undefined : String(id), surface, ...extras]
    .filter((token): token is string => token != null && token !== "")
    .join(" ");
}

/** Sent once per wizard run, alongside the run's first `ampWizardFlowStart`. */
export function sendWizardLaunchPageload(
  strings: FlowAnalyticsStrings | undefined,
  analyticsSessionId: string | undefined,
  surface: string,
  rootFlow: string | undefined,
  chosenFlow: string,
  entryNode: string | undefined,
): void {
  sendEventWithTarget(OdpEventName.Pageload, VpcEntryEventContext.WizardLaunch, {
    state: buildState(
      analyticsSessionId,
      strings?.[AgeGroupKey],
      surface,
      rootFlow,
      chosenFlow,
      entryNode,
    ),
    associatedText: AssociatedText.WizardLaunch,
  });
}

export function createVpcEntryAnalytics(
  strings: FlowAnalyticsStrings | undefined,
  analyticsSessionId: string | undefined,
  surface: string | undefined,
  requestType?: string,
): VpcEntryAnalytics {
  const ageGroup = strings?.[AgeGroupKey];
  const prologueState = (prologueType: PrologueType): string =>
    buildState(analyticsSessionId, ageGroup, surface, prologueType);
  const remoteState = buildState(analyticsSessionId, ageGroup, surface, requestType);
  const sendRemote = (eventName: string, params: Record<string, string>): void => {
    sendEventWithTarget(eventName, VpcEntryEventContext.RemoteParentRequest, {
      ...params,
      state: remoteState,
    });
  };

  return {
    prologueShown: prologueType => {
      sendEventWithTarget(OdpEventName.ModalShown, VpcEntryEventContext.Prologue, {
        field: Field.AskParent,
        state: prologueState(prologueType),
        associatedText: AssociatedText.Prologue,
      });
    },
    prologueButtonClick: (outcome, prologueType) => {
      const button = PrologueButtons[prologueType][outcome];
      if (button == null) {
        return;
      }
      sendEventWithTarget(OdpEventName.ButtonClick, VpcEntryEventContext.Prologue, {
        btn: button.btn,
        state: prologueState(prologueType),
        associatedText: button.associatedText,
      });
    },
    remoteEmailShown: () => {
      sendRemote(OdpEventName.ModalShown, {
        field: Field.EmailModal,
        associatedText: AssociatedText.EmailScreen,
      });
    },
    remoteEmailEntered: () => {
      sendRemote(OdpEventName.FormInteraction, {
        field: Field.Email,
        associatedText: AssociatedText.ParentEmail,
      });
    },
    remoteEmailSubmit: () => {
      sendRemote(OdpEventName.ButtonClick, {
        btn: Button.Submit,
        associatedText: AssociatedText.SendEmail,
      });
    },
    remoteRequestSent: () => {
      sendRemote(OdpEventName.MsgShown, {
        field: Field.RequestSent,
        associatedText: AssociatedText.RequestSent,
      });
    },
    remoteRequestOk: () => {
      sendRemote(OdpEventName.ButtonClick, { btn: Button.Ok, associatedText: AssociatedText.Ok });
    },
    remoteRequestError: errorCode => {
      sendRemote(OdpEventName.MsgShown, {
        field: Field.ErrorMessage,
        errorCode: errorCode ?? "unknown",
      });
    },
    remoteRequestRetry: () => {
      sendRemote(OdpEventName.ButtonClick, {
        btn: Button.Retry,
        associatedText: AssociatedText.Retry,
      });
    },
    remoteRequestCancel: () => {
      sendRemote(OdpEventName.ButtonClick, {
        btn: OdpEventButton.Cancel,
        associatedText: AssociatedText.Cancel,
      });
    },
    remoteRequestClose: () => {
      sendRemote(OdpEventName.ButtonClick, {
        btn: OdpEventButton.Close,
        associatedText: AssociatedText.Close,
      });
    },
  };
}

export function useVpcEntryAnalytics(
  ctx: Pick<NodeContext, "analytics" | "analyticsStrings" | "analyticsSessionId">,
  requestType?: string,
): VpcEntryAnalytics {
  const { surface } = ctx.analytics;
  return useMemo(
    () =>
      createVpcEntryAnalytics(ctx.analyticsStrings, ctx.analyticsSessionId, surface, requestType),
    [ctx.analyticsStrings, ctx.analyticsSessionId, surface, requestType],
  );
}
