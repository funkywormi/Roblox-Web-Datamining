export const TrustedFriendsErrorModalKind = {
  Expired: "Expired",
  Invalid: "Invalid",
} as const;

export type TrustedFriendsErrorModalKindEnum =
  (typeof TrustedFriendsErrorModalKind)[keyof typeof TrustedFriendsErrorModalKind];

type TrustedFriendsErrorModalCopyEntry = {
  title: string;
  description: string;
};

export const trustedFriendsErrorModalKindToText: Record<
  TrustedFriendsErrorModalKindEnum,
  TrustedFriendsErrorModalCopyEntry
> = {
  [TrustedFriendsErrorModalKind.Expired]: {
    title: "Title.TrustedFriendsExpiredLink",
    description: "Description.TrustedFriendsExpiredLink",
  },
  [TrustedFriendsErrorModalKind.Invalid]: {
    title: "Title.TrustedFriendsInvalidLink",
    description: "Description.TrustedFriendsInvalidLink",
  },
};

export const TrustedConnectionStatus = {
  Invalid: "Invalid",
  NotFriends: "NotFriends",
  Friends: "Friends",
  TrustedFriends: "TrustedFriends",
  RequestSent: "RequestSent",
  RequestReceived: "RequestReceived",
  RequestIgnored: "RequestIgnored",
} as const;

export type TrustedConnectionStatusEnum =
  | "Invalid"
  | "NotFriends"
  | "Friends"
  | "TrustedFriends"
  | "RequestSent"
  | "RequestReceived"
  | "RequestIgnored";

export const TrustedFriendAction = {
  UnlockTrustedFriendByFAE: "UnlockTrustedFriendByFAE",
  RemoveTrustedConnection: "RemoveTrustedConnection",
  AddTrustedConnectionViaLink: "AddTrustedConnectionViaLink",
  AddTrustedFriendDoubleOptin: "AddTrustedFriendDoubleOptin",
  AddTrustedFriendWithVpc: "AddTrustedFriendWithVpc",
  AcceptTrustedFriendViaLinkWithVpcRecipient: "AcceptTrustedFriendViaLinkWithVpcRecipient",
  AcceptTrustedFriendWithVpcRecipient: "AcceptTrustedFriendWithVpcRecipient",
  AcceptTrustedFriendViaLink: "AcceptTrustedFriendViaLink",
  AcceptTrustedFriend: "AcceptTrustedFriend",
  PendingTrustedConnection: "PendingTrustedConnection",
  PendingIncomingTrustedConnection: "PendingIncomingTrustedConnection",
  AcceptTrustedFriendInvalid: "AcceptTrustedFriendInvalid",
} as const;

export type TrustedFriendActionEnum =
  (typeof TrustedFriendAction)[keyof typeof TrustedFriendAction];

export const trustedFriendsTranslationKeys = {
  connectedOneYear: "Label.ConnectedOneYear",
  connectedNumYears: "Label.ConnectedNumYears",
  connectedOneMonth: "Label.ConnectedOneMonth",
  connectedNumMonths: "Label.ConnectedNumMonths",
  connectedOneDay: "Label.ConnectedOneDay",
  connectedNumDays: "Label.ConnectedNumDays",
  newFriend: "Label.NewFriend",

  ageGroupLabel: "Label.AgeGroupV2",
  mutualFriends: "Label.MutualFriendsTitle",
  joinedInYear: "Label.JoinedInYear",
  notAFriend: "Description.NotAFriend",
  noMutualFriends: "Description.NoMutualFriends",

  friendRequestOriginPlayerSearch: "Label.FromSearch",
  friendRequestOriginQrCode: "Description.FromQrCode",
  friendRequestOriginPhoneContactImporter: "Description.FromContacts",

  learnMore: "LinkText.LearnMore",

  genericError: "Message.SomethingWentWrong",

  acceptedTrustedFriend: "Label.NowTrusted",
  trustedFriendRequestSent: "TrustedFriend.Toast.TrustedFriendRequestSent",
  trustedFriendLinkCopied: "TrustedFriend.Toast.LinkCopied",
} as const;

export const trustedFriendsModalVariants = {
  Friends: TrustedConnectionStatus.Friends,
  RequestReceived: TrustedConnectionStatus.RequestReceived,
  TrustedFriends: TrustedConnectionStatus.TrustedFriends,
  ShareLinkReceiver: "ShareLinkReceiver",
  NotFriends: TrustedConnectionStatus.NotFriends,
} as const;

export type TrustedFriendsModalVariant =
  (typeof trustedFriendsModalVariants)[keyof typeof trustedFriendsModalVariants];

export type MappedTrustedFriendAction = Exclude<
  TrustedFriendActionEnum,
  | typeof TrustedFriendAction.UnlockTrustedFriendByFAE
  | typeof TrustedFriendAction.AcceptTrustedFriendInvalid
>;

export const trustedFriendActionToModalVariant: Record<
  MappedTrustedFriendAction,
  TrustedFriendsModalVariant
> = {
  [TrustedFriendAction.RemoveTrustedConnection]: trustedFriendsModalVariants.TrustedFriends,
  [TrustedFriendAction.AddTrustedConnectionViaLink]: trustedFriendsModalVariants.NotFriends,
  [TrustedFriendAction.AddTrustedFriendDoubleOptin]: trustedFriendsModalVariants.Friends,
  [TrustedFriendAction.AddTrustedFriendWithVpc]: trustedFriendsModalVariants.Friends,
  [TrustedFriendAction.PendingTrustedConnection]: trustedFriendsModalVariants.Friends,
  [TrustedFriendAction.AcceptTrustedFriendViaLinkWithVpcRecipient]:
    trustedFriendsModalVariants.RequestReceived,
  [TrustedFriendAction.AcceptTrustedFriendWithVpcRecipient]:
    trustedFriendsModalVariants.RequestReceived,
  [TrustedFriendAction.AcceptTrustedFriendViaLink]: trustedFriendsModalVariants.RequestReceived,
  [TrustedFriendAction.AcceptTrustedFriend]: trustedFriendsModalVariants.RequestReceived,
  [TrustedFriendAction.PendingIncomingTrustedConnection]:
    trustedFriendsModalVariants.RequestReceived,
};

export type TrustedFriendButtonCopy = {
  textKey: string;
  showVpcIcon?: boolean;
  isDisabled?: boolean;
};

export type TrustedFriendActionButtons = {
  primary: TrustedFriendButtonCopy;
  secondary?: { textKey: string };
};

export const TrustedFriendPrimaryHandler = {
  trustedFriendsOk: "trustedFriendsOk",
  sendTrustedFriendRequest: "sendTrustedFriendRequest",
  acceptTrustedFriend: "acceptTrustedFriend",
  acceptTrustedFriendViaLink: "acceptTrustedFriendViaLink",
  vpcUpsell: "vpcUpsell",
  vpcLinkRecipientUpsell: "vpcLinkRecipientUpsell",
  noop: "noop",
  addViaLinkEmpty: "addViaLinkEmpty",
} as const;

export type TrustedFriendPrimaryHandlerEnum =
  (typeof TrustedFriendPrimaryHandler)[keyof typeof TrustedFriendPrimaryHandler];

type TrustedFriendActionButtonConfigEntry = {
  primary: TrustedFriendButtonCopy;
  secondary?: { textKey: string };
  handler: TrustedFriendPrimaryHandlerEnum;
};

export const trustedFriendActionButtonConfig: Record<
  MappedTrustedFriendAction,
  TrustedFriendActionButtonConfigEntry
> = {
  [TrustedFriendAction.RemoveTrustedConnection]: {
    primary: { textKey: "Action.OK" },
    handler: TrustedFriendPrimaryHandler.trustedFriendsOk,
  },
  [TrustedFriendAction.AddTrustedConnectionViaLink]: {
    primary: { textKey: "Button.AddViaLink" },
    secondary: { textKey: "Button.DontAdd" },
    handler: TrustedFriendPrimaryHandler.addViaLinkEmpty,
  },
  [TrustedFriendAction.AddTrustedFriendDoubleOptin]: {
    primary: { textKey: "Action.Add" },
    secondary: { textKey: "Button.DontAdd" },
    handler: TrustedFriendPrimaryHandler.sendTrustedFriendRequest,
  },
  [TrustedFriendAction.AddTrustedFriendWithVpc]: {
    primary: { textKey: "Action.Add", showVpcIcon: true },
    secondary: { textKey: "Button.DontAdd" },
    handler: TrustedFriendPrimaryHandler.vpcUpsell,
  },
  [TrustedFriendAction.AcceptTrustedFriendWithVpcRecipient]: {
    primary: { textKey: "Action.Accept", showVpcIcon: true },
    secondary: { textKey: "Action.DontAccept" },
    handler: TrustedFriendPrimaryHandler.vpcUpsell,
  },
  [TrustedFriendAction.AcceptTrustedFriendViaLink]: {
    primary: { textKey: "Action.Accept" },
    secondary: { textKey: "Action.DontAccept" },
    handler: TrustedFriendPrimaryHandler.acceptTrustedFriendViaLink,
  },
  [TrustedFriendAction.AcceptTrustedFriend]: {
    primary: { textKey: "Action.Accept" },
    secondary: { textKey: "Action.DontAccept" },
    handler: TrustedFriendPrimaryHandler.acceptTrustedFriend,
  },
  [TrustedFriendAction.AcceptTrustedFriendViaLinkWithVpcRecipient]: {
    primary: { textKey: "Action.Accept", showVpcIcon: true },
    secondary: { textKey: "Action.DontAccept" },
    handler: TrustedFriendPrimaryHandler.vpcLinkRecipientUpsell,
  },
  [TrustedFriendAction.PendingTrustedConnection]: {
    primary: { textKey: "Action.Add", isDisabled: true },
    secondary: { textKey: "Button.DontAdd" },
    handler: TrustedFriendPrimaryHandler.noop,
  },
  [TrustedFriendAction.PendingIncomingTrustedConnection]: {
    primary: { textKey: "Action.Accept", isDisabled: true },
    secondary: { textKey: "Action.DontAccept" },
    handler: TrustedFriendPrimaryHandler.noop,
  },
};

export function isMappedTrustedFriendAction(
  action: TrustedFriendActionEnum,
): action is MappedTrustedFriendAction {
  return action in trustedFriendActionToModalVariant;
}

type TrustedFriendsModalCopyEntry = {
  title: string;
  description: string;
};

export const TRUSTED_FRIENDS_HELP_ARTICLE_URL =
  "https://help.roblox.com/hc/articles/37725513985812" as const;

export const trustedFriendVpcModalVariantAmpFeatureName =
  "ShowTrustedFriendVPCModalVariant" as const;

export const triggerTrustedFriendVPCRecourseAmpFeatureName =
  "TriggerTrustedFriendVPCRecourse" as const;

export const connectionGraphCoreAmpNamespace = "connection_graph_core/ConnectionGraphCore" as const;

export const trustedFriendsModalVariantToText: Record<
  TrustedFriendsModalVariant,
  TrustedFriendsModalCopyEntry
> = {
  [trustedFriendsModalVariants.Friends]: {
    title: "TrustedFriend.Label.AddTrustedFriend",
    description: "Description.DoMoreWithTrustedFriends",
  },
  [trustedFriendsModalVariants.NotFriends]: {
    title: "TrustedFriend.Label.AddTrustedFriend",
    description: "Description.DoMoreWithTrustedFriends",
  },
  [trustedFriendsModalVariants.RequestReceived]: {
    title: "TrustedFriend.AddBack.Header",
    description: "TrustedFriends.InfoLabel.FriendsRename",
  },
  [trustedFriendsModalVariants.ShareLinkReceiver]: {
    title: "TrustedFriend.AddBack.Header",
    description: "TrustedFriends.InfoLabel.FriendsRename",
  },
  [trustedFriendsModalVariants.TrustedFriends]: {
    title: "TrustedFriend.Info.Modal.Header",
    description: "Description.YouCanDoMoreWithTrustedFriends",
  },
};
