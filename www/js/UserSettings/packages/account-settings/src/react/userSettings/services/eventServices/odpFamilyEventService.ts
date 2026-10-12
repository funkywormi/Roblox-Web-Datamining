/**
 * Sends the `odpFamily` events for the parent zone a parent sees in parent mode on the child's device.
 */

import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { isUnder13, userId } from "@rbx/core-scripts/meta/user";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";
import type { TParentInfo } from "../../../../types/parentInfoTypes";

const EventName = {
  Pageload: "authPageload",
  ButtonClick: "authButtonClick",
} as const;

const CONTEXT = "odpFamily";

const Button = {
  CreatePin: "createPin",
  CreateAccount: "createAccount",
  LinkedParents: "linkedParents",
  AddParent: "addParent",
  PendingRequests: "pendingRequests",
  ScreentimeInsights: "screentimeInsights",
  TopFriends: "topFriends",
  TopGames: "topGames",
  ParentSettings: "parentSettings",
} as const;

const AssociatedText = {
  ParentZone:
    "Parental controls - Family - Screen time 7-day average / Top friends / Top games / Managed by parent / Parent settings",
  CreatePin: "Ask a parent on this device",
  CreateAccount: "Create your own Roblox account > Continue",
  LinkedParents: "Linked parents",
  AddParent: "Add parent",
  PendingRequests: "Sent requests",
  ScreentimeInsights: "Screen time",
  TopFriends: "Top friends",
  TopGames: "Top games",
  ManagedByParent: "Managed by parent",
  ParentSettings: "Parent settings",
} as const;

const AgeGroup = {
  Under13: "U13",
  Age13to17: "13-17",
} as const;

const LinkedParentFlag = {
  PinEnabled: "pinEnabled",
  RemoteEnabled: "remoteEnabled",
} as const;

/**
 * Builds the `state` string (i.e. "<ageGroup> childUserId <pinEnabled> <remoteEnabled>").
 * A linked on-device parent always has a PIN, so `pinEnabled` follows `isOnDeviceParent`.
 */
const buildOdpFamilyState = (parents: TParentInfo[] | undefined): string => {
  const childUserId = userId();
  const ageGroup = isUnder13() ? AgeGroup.Under13 : AgeGroup.Age13to17;
  return [
    ageGroup,
    childUserId == null ? undefined : String(childUserId),
    parents?.some(parent => parent.isOnDeviceParent === true)
      ? LinkedParentFlag.PinEnabled
      : undefined,
    parents?.some(parent => parent.isRemoteParent === true)
      ? LinkedParentFlag.RemoteEnabled
      : undefined,
  ]
    .filter((token): token is string => token != null && token !== "")
    .join(" ");
};

const sendOdpFamilyButtonClick = (
  btn: string,
  associatedText: string,
  parents: TParentInfo[] | undefined,
): void => {
  sendEventWithTarget(EventName.ButtonClick, CONTEXT, {
    btn,
    state: buildOdpFamilyState(parents),
    associatedText,
  });
};

export const pageLoadOdpParentZoneLandingPage = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendEventWithTarget(EventName.Pageload, CONTEXT, {
      state: buildOdpFamilyState(parents),
      associatedText: AssociatedText.ParentZone,
    });
  },
);

export const btnClickCreatePin = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.CreatePin, AssociatedText.CreatePin, parents);
  },
);

export const btnClickOdpCreateAccount = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.CreateAccount, AssociatedText.CreateAccount, parents);
  },
);

export const btnClickLinkedParents = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.LinkedParents, AssociatedText.LinkedParents, parents);
  },
);

export const btnClickAddParent = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.AddParent, AssociatedText.AddParent, parents);
  },
);

export const btnClickPendingRequests = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.PendingRequests, AssociatedText.PendingRequests, parents);
  },
);

export const btnClickOdpScreentimeInsights = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.ScreentimeInsights, AssociatedText.ScreentimeInsights, parents);
  },
);

export const btnClickOdpTopFriends = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.TopFriends, AssociatedText.TopFriends, parents);
  },
);

export const btnClickOdpTopGames = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.TopGames, AssociatedText.TopGames, parents);
  },
);

export const btnClickOdpManagedSetting = wrapEventServiceWithTryCatch(
  (pageName: string, parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(pageName, AssociatedText.ManagedByParent, parents);
  },
);

export const btnClickOdpParentSettings = wrapEventServiceWithTryCatch(
  (parents: TParentInfo[] | undefined): void => {
    sendOdpFamilyButtonClick(Button.ParentSettings, AssociatedText.ParentSettings, parents);
  },
);
