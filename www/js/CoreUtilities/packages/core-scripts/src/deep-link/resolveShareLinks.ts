import environmentUrls from "@rbx/environment-urls";
import { post } from "../http";
import {
  AvatarItemDetailsData,
  ContentPostData,
  ExperienceInviteData,
  FriendInviteData,
  PrivateServerLinkData,
  ProfileData,
  ScreenshotInviteData,
  ExperienceDetailsData,
  ExperienceAffiliateData,
  ExperienceEventData,
  ShareLinksType,
} from "./shareLinksTypes";

const ResolveShareLinksUrlConfig = {
  url: `${environmentUrls.shareLinksApi}/v1/resolve-link`,
  withCredentials: true,
};

const ResolveShareLinksUrlV2Config = {
  url: `${environmentUrls.shareLinksApiV2}/v2/resolve`,
  withCredentials: true,
};

export type ResolveShareLinksResponse = {
  avatarItemDetailsData?: AvatarItemDetailsData;
  contentPostData?: ContentPostData;
  experienceInviteData?: ExperienceInviteData;
  friendInviteData?: FriendInviteData;
  notificationExperienceInviteData?: ExperienceInviteData;
  profileLinkResolutionResponseData?: ProfileData;
  experienceAffiliateData?: ExperienceAffiliateData;
  screenshotInviteData?: ScreenshotInviteData;
  privateServerInviteData?: PrivateServerLinkData;
  experienceDetailsInviteData?: ExperienceDetailsData;
  experienceEventData?: ExperienceEventData;
};

export type ResolveShareLinksV2Response = {
  linkType: string;
  targetId: string;
  customData: string | null;
  status: "Valid" | "Invalid" | "Expired";
};

export const resolveShareLinks = (
  linkId: string,
  linkType: ShareLinksType,
): Promise<{ data: ResolveShareLinksResponse }> =>
  post<ResolveShareLinksResponse>(ResolveShareLinksUrlConfig, {
    linkId,
    linkType,
  });

export const resolveShareLinksV2 = (
  linkId: string,
): Promise<{ data: ResolveShareLinksV2Response }> =>
  post<ResolveShareLinksV2Response>(ResolveShareLinksUrlV2Config, {
    linkId,
  });
