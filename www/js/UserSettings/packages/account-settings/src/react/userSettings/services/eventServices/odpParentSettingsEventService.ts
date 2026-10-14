/**
 * Sends the `odpParentSettings` events for the page a parent in parent mode uses to manage their PIN
 * and parent email.
 */

import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { isUnder13, userId } from "@rbx/core-scripts/meta/user";
import { wrapEventServiceWithTryCatch } from "../../../../core/utils/eventUtils";
import type { TParentInfo } from "../../../../types/parentInfoTypes";

const EventName = {
  Pageload: "authPageload",
  ButtonClick: "authButtonClick",
} as const;

const CONTEXT = "odpParentSettings";

const Button = {
  UpdatePin: "updatePin",
  RemovePin: "removePin",
  UpdateEmail: "updateEmail",
  AddEmail: "addEmail",
} as const;

const AssociatedText = {
  ParentSettings: "Parent settings",
  UpdatePin: "Update parent PIN",
  RemovePin: "Remove parent PIN",
  UpdateEmail: "Update email address",
  AddEmail: "Add a parent email",
} as const;

const AgeGroup = {
  Under13: "U13",
  Age13to17: "13-17",
} as const;

const LinkedParentFlag = {
  PinEnabled: "pinEnabled",
  EmailLinked: "emailLinked",
} as const;

/**
 * Builds the `state` string (i.e. "<ageGroup> childUserId <pinEnabled> <emailLinked>").
 * A linked on-device parent always has a PIN, so `pinEnabled` follows `isOnDeviceParent`.
 */
const buildOdpParentSettingsState = (parents: TParentInfo[] | undefined): string => {
  const childUserId = userId();
  const ageGroup = isUnder13() ? AgeGroup.Under13 : AgeGroup.Age13to17;
  return [
    ageGroup,
    childUserId == null ? undefined : String(childUserId),
    parents?.some(parent => parent.isOnDeviceParent === true)
      ? LinkedParentFlag.PinEnabled
      : undefined,
    parents?.some(parent => parent.isRemoteParent === true)
      ? LinkedParentFlag.EmailLinked
      : undefined,
  ]
    .filter((token): token is string => token != null && token !== "")
    .join(" ");
};

const sendOdpParentSettingsButtonClick = (
  btn: string,
  associatedText: string,
  parents: TParentInfo[] | undefined,
): void => {
  sendEventWithTarget(EventName.ButtonClick, CONTEXT, {
    btn,
    state: buildOdpParentSettingsState(parents),
    associatedText,
  });
};

export const pageLoadOdpParentSettings = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendEventWithTarget(EventName.Pageload, CONTEXT, {
      state: buildOdpParentSettingsState(parents),
      associatedText: AssociatedText.ParentSettings,
    });
  },
);

export const btnClickOdpUpdatePin = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpParentSettingsButtonClick(Button.UpdatePin, AssociatedText.UpdatePin, parents);
  },
);

export const btnClickOdpRemovePin = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpParentSettingsButtonClick(Button.RemovePin, AssociatedText.RemovePin, parents);
  },
);

export const btnClickOdpUpdateEmail = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpParentSettingsButtonClick(Button.UpdateEmail, AssociatedText.UpdateEmail, parents);
  },
);

export const btnClickOdpAddEmail = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpParentSettingsButtonClick(Button.AddEmail, AssociatedText.AddEmail, parents);
  },
);
