import AvatarItemDetailsStatus from "./enums/AvatarItemDetailsStatus";
import ContentPostStatus from "./enums/ContentPostStatus";
import ExperienceInviteStatus from "./enums/ExperienceInviteStatus";
import FriendInviteStatus from "./enums/FriendInviteStatus";
import ProfileShareStatus from "./enums/ProfileShareStatus";
import PrivateServerLinkStatus from "./enums/PrivateServerLinkStatus";
import ExperienceAffiliateStatus from "./enums/ExperienceAffiliateStatus";
import ExperienceEventStatus from "./enums/ExperienceEventStatus";
import ExperienceDetailsStatus from "./enums/ExperienceDetailsStatus";

export {
  type DeepLinkDeviceMeta,
  type DeepLinkHost,
  type DeepLinkNavigator,
  type LaunchGameEvent,
  type PlayGameProperties,
  type StudioLinkData,
  createDeepLinkNavigator,
  parseDeepLink,
} from "./navigator";
export { type DeepLink, type DeepLinkParams, ItemType, PathPart } from "./constants";
export {
  type ResolveShareLinksResponse,
  type ResolveShareLinksV2Response,
  ShareLinksType,
} from "./shareLinksTypes";

export const ShareLinks = {
  AvatarItemDetailsStatus,
  ContentPostStatus,
  ExperienceInviteStatus,
  FriendInviteStatus,
  ProfileShareStatus,
  PrivateServerLinkStatus,
  ExperienceAffiliateStatus,
  ExperienceEventStatus,
};

export {
  AvatarItemDetailsStatus,
  ContentPostStatus,
  ExperienceAffiliateStatus,
  ExperienceDetailsStatus,
  ExperienceEventStatus,
  ExperienceInviteStatus,
  FriendInviteStatus,
  PrivateServerLinkStatus,
  ProfileShareStatus,
};
