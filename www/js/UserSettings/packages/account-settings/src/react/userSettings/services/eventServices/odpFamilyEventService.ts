/**
 * Sends the `odpFamily` events for the parent zone a parent sees in parent mode on the child's device,
 * including its pages and the changes the parent asks for there (each change then goes through the
 * ODP wizard's PIN).
 */

import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { isUnder13, userId } from "@rbx/core-scripts/meta/user";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";
import type { TParentInfo } from "../../../../types/parentInfoTypes";
import { ManagementAction } from "../../../../types/parentConsentsTypes";

const EventName = {
  Pageload: "authPageload",
  ButtonClick: "authButtonClick",
  FormInteraction: "authFormInteraction",
  MsgShown: "authMsgShown",
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

const Field = {
  LoadError: "loadError",
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
  BlockExperience: "Block",
  UnblockExperience: "Unblock",
  ApproveExperience: "Allow",
  RevokeExperience: "Remove",
  BlockFriend: "Block",
  UnblockFriend: "Unblock",
  LoadError: "Something went wrong",
} as const;

const PageTitle: Record<string, string> = {
  ContentRestrictions: "Content restrictions",
  Communication: "Communication",
  Screentime: "Screen time",
  Spending: "Spending restrictions",
  VisibilityAndPrivateServers: "Visibility & private servers",
  FriendsAndContacts: "Friends & contacts",
  BlockedUsers: "Blocked users",
  TradingAndInventory: "Trading & inventory",
  ThirdPartyApplications: "Third-party applications",
  Notifications: "Notifications",
  AgeCheck: "Age check",
  ScreentimeManagement: "Screen time limit",
  FriendManagement: "Connections",
  TopGameDetails: "Game details",
  Robux: "Robux",
  TransferLimits: "Transfer limits",
  ContentMaturity: "Content maturity",
  BlockedExperiences: "Blocked experiences",
  SensitiveIssues: "Sensitive issues",
  PrivatePlaytest: "Preview games",
  ExperienceChat: "Experience chat",
  Party: "Party",
  PartyAndPartyChat: "Party and Party chat",
  VoiceDataUsage: "Voice data usage",
  StudioCollaboration: "Live collaboration in Studio",
  GameplayCoordination: "Gameplay coordination",
  AllowPurchases: "Allow purchases",
  MonthlySpendingLimit: "Monthly spending limit",
  SpendNotifications: "Spending notifications",
  Visibility: "Visibility",
  PrivateServerPrivacy: "Private servers",
};

const AgeGroup = {
  Under13: "U13",
  Age13to17: "13-17",
} as const;

const LinkedParentFlag = {
  PinEnabled: "pinEnabled",
  RemoteEnabled: "remoteEnabled",
} as const;

/**
 * Builds the `state` string (i.e. "<ageGroup> childUserId [pageTokens] <pinEnabled> <remoteEnabled>").
 * A linked on-device parent always has a PIN, so `pinEnabled` follows `isOnDeviceParent`.
 */
const buildOdpFamilyState = (
  parents: TParentInfo[] | undefined,
  ...pageTokens: (string | undefined)[]
): string => {
  const childUserId = userId();
  const ageGroup = isUnder13() ? AgeGroup.Under13 : AgeGroup.Age13to17;
  return [
    ageGroup,
    childUserId == null ? undefined : String(childUserId),
    ...pageTokens,
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

const valueToken = (value: unknown): string | undefined => {
  if (value == null || value === "") {
    return undefined;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
};

const experienceButton: Record<ManagementAction, { btn: string; text: string }> = {
  [ManagementAction.Block]: { btn: "blockExperience", text: AssociatedText.BlockExperience },
  [ManagementAction.Unblock]: { btn: "unblockExperience", text: AssociatedText.UnblockExperience },
  [ManagementAction.Approve]: { btn: "approveExperience", text: AssociatedText.ApproveExperience },
  [ManagementAction.RevokeApproval]: {
    btn: "revokeExperience",
    text: AssociatedText.RevokeExperience,
  },
};

const sendOdpFamilyButtonClick = (
  btn: string,
  associatedText: string,
  parents: TParentInfo[] | undefined,
  ...pageTokens: (string | undefined)[]
): void => {
  sendEventWithTarget(EventName.ButtonClick, CONTEXT, {
    btn,
    state: buildOdpFamilyState(parents, ...pageTokens),
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
  (parents: TParentInfo[] | undefined, layout?: string): void => {
    sendOdpFamilyButtonClick(Button.CreatePin, AssociatedText.CreatePin, parents, layout);
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

export const pageLoadOdpParentZonePage = wrapEventServiceWithTryCatch(
  (pageName: string, parents: TParentInfo[] | undefined, targetId?: number): void => {
    sendEventWithTarget(EventName.Pageload, CONTEXT, {
      state: buildOdpFamilyState(parents, pageName, valueToken(targetId)),
      associatedText: PageTitle[pageName] ?? pageName,
    });
  },
);

export const formInteractionOdpSetting = wrapEventServiceWithTryCatch(
  (
    pageName: string,
    settingName: string,
    value: unknown,
    parents: TParentInfo[] | undefined,
  ): void => {
    sendEventWithTarget(EventName.FormInteraction, CONTEXT, {
      field: settingName,
      state: buildOdpFamilyState(parents, pageName, valueToken(value)),
      associatedText: PageTitle[pageName] ?? pageName,
    });
  },
);

export const btnClickOdpManageExperience = wrapEventServiceWithTryCatch(
  (
    pageName: string,
    universeId: number,
    action: ManagementAction,
    parents: TParentInfo[] | undefined,
  ): void => {
    const { btn, text } = experienceButton[action];
    sendEventWithTarget(EventName.ButtonClick, CONTEXT, {
      btn,
      state: buildOdpFamilyState(parents, pageName, String(universeId)),
      associatedText: text,
    });
  },
);

export const btnClickOdpManageFriend = wrapEventServiceWithTryCatch(
  (
    pageName: string,
    friendUserId: number,
    action: ManagementAction.Block | ManagementAction.Unblock,
    parents: TParentInfo[] | undefined,
  ): void => {
    const isBlock = action === ManagementAction.Block;
    sendEventWithTarget(EventName.ButtonClick, CONTEXT, {
      btn: isBlock ? "blockFriend" : "unblockFriend",
      state: buildOdpFamilyState(parents, pageName, String(friendUserId)),
      associatedText: isBlock ? AssociatedText.BlockFriend : AssociatedText.UnblockFriend,
    });
  },
);

export const msgShownOdpParentZoneError = wrapEventServiceWithTryCatch(
  (pageName: string, parents: TParentInfo[] | undefined): void => {
    sendEventWithTarget(EventName.MsgShown, CONTEXT, {
      field: Field.LoadError,
      state: buildOdpFamilyState(parents, pageName),
      associatedText: AssociatedText.LoadError,
    });
  },
);
