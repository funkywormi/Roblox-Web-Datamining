import * as json from "@rbx/core-lib/json";
import { parseFloat, parseInt } from "@rbx/core-lib/number";
import { stringToBase64 } from "@rbx/core-lib/string";
import { UrlSearchParams } from "@rbx/core-lib/url";
import {
  buildDeepLinkLaunchGameEvent,
  buildResolveLinkEvent,
  CounterEvents,
  DeepLink,
  DeepLinkNavigationMap,
  PathPart,
  ItemTypePathMap,
  UrlPart,
  DeepLinkParams,
  AmpFeatureName,
  AmpNamespace,
} from "./constants";
import {
  ProfileShareFriendshipSourceType,
  ShareLinksType,
  ShareLinksTypeV2,
  ExperienceJoinData,
  ResolveShareLinksResponse,
  ResolveShareLinksV2Response,
} from "./shareLinksTypes";
import ExperienceInviteStatus from "./enums/ExperienceInviteStatus";
import FriendInviteStatus from "./enums/FriendInviteStatus";
import ProfileShareStatus from "./enums/ProfileShareStatus";
import ScreenshotInviteStatus from "./enums/ScreenshotInviteStatus";
import PrivateServerLinkStatus from "./enums/PrivateServerLinkStatus";
import ExperienceDetailsStatus from "./enums/ExperienceDetailsStatus";
import ExternalWebUrlDomains from "./enums/ExternalWebUrlDomains";
import AvatarItemDetailsStatus from "./enums/AvatarItemDetailsStatus";
import ExperienceAffiliateStatus from "./enums/ExperienceAffiliateStatus";
import ContentPostStatus from "./enums/ContentPostStatus";
import ExperienceEventStatus from "./enums/ExperienceEventStatus";
import ExperienceAffiliateDeepLinkFallbackType from "./enums/ExperienceAffiliateDeepLinkFallbackType";

export type PlayGameProperties = {
  rootPlaceId?: string;
  placeId?: string;
  gameInstanceId?: string;
  playerId?: string;
  privateServerLinkCode?: string;
  referredByPlayerId?: string;
  joinData?: { launchData?: string; eventId?: string };
};

export type LaunchGameEvent = {
  eventName: string;
  ctx: string;
  gamePlayIntentEventCtx: string;
  properties: Record<string, string | number | undefined>;
};

export type StudioLinkData = {
  placeId: string;
  universeId: string;
  startTeamTest: boolean;
  instanceId?: string;
  annotationId?: string;
};

export type DeepLinkDeviceMeta = {
  isIosApp?: boolean;
  isInApp?: boolean;
  isDesktop?: boolean;
};

type ZendeskParams = {
  articleId?: string;
  domain: string;
  locale?: string;
  type?: string;
};

export type DeepLinkHost = {
  getDeviceMeta: () => DeepLinkDeviceMeta | null | undefined;
  // Undefined where the page has no Hybrid bridge.
  navigateToHybridFeature?: (feature: Record<string, string>) => void;
  sendEvent: (type: string, context: string, params: Record<string, string>) => void;
  fireCounter: (name: string) => void;
  resolveShareLinks: (
    linkId: string,
    linkType: ShareLinksType,
  ) => Promise<{ data: ResolveShareLinksResponse }>;
  resolveShareLinksV2: (linkId: string) => Promise<{ data: ResolveShareLinksV2Response }>;
  getPlaceIdFromUniverseId: (universeId: string) => Promise<number>;
  getUniverseIdFromPlaceId: (placeId: string) => Promise<number>;
  launchGame: (properties: PlayGameProperties, event: LaunchGameEvent) => void;
  joinMultiplayerGame: (placeId: number) => void;
  startGameWithDeepLinkUrl: (deepLinkUrl: string, placeId: number) => void;
  // Returns false when the page cannot start the flow, so the caller falls back to a redirect.
  startDeepLinkFlow: (deepLinkUrl: string) => boolean;
  openStudio: (data: StudioLinkData) => void;
  // Returns null when the upsell service is not on the page.
  startAccessManagementUpsell: (params: {
    featureName: string;
    namespace: string;
  }) => Promise<unknown> | null;
  startChat: (userId: string) => void;
  getQueryParam: (name: string) => unknown;
  getHelpDeskUrl: (locale?: string, articleId?: string) => string;
};

const buildPlayGameProperties = (
  rootPlaceId?: string,
  placeId?: string,
  gameInstanceId?: string,
  playerId?: string,
  privateServerLinkCode?: string,
  referredByPlayerId?: string,
  joinData?: PlayGameProperties["joinData"],
): PlayGameProperties => ({
  rootPlaceId,
  placeId,
  gameInstanceId,
  playerId,
  privateServerLinkCode,
  referredByPlayerId,
  joinData,
});

const isItemDeeplink = (navigateSubPath: string, params: DeepLinkParams) =>
  navigateSubPath === PathPart.ItemDetails.valueOf() && params.itemType && params.itemId;

const getFriendshipSourceType = (source: string | undefined): ProfileShareFriendshipSourceType => {
  switch (source?.toLowerCase()) {
    case ProfileShareFriendshipSourceType.PROFILE_SHARE.toLowerCase():
      return ProfileShareFriendshipSourceType.PROFILE_SHARE;
    case ProfileShareFriendshipSourceType.QR_CODE.toLowerCase():
      return ProfileShareFriendshipSourceType.QR_CODE;
    case undefined:
    default:
      return ProfileShareFriendshipSourceType.QR_CODE;
  }
};

const buildRedirectUrlWithJoinData = (url: string, joinData: ExperienceJoinData): string => {
  const [baseUrl, queryString] = url.split("?");
  // eslint-disable-next-line no-restricted-globals -- core-lib UrlSearchParams serializes differently
  const searchParams = new URLSearchParams(queryString);
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (joinData) {
    if (joinData.launchData && joinData.launchData !== "") {
      searchParams.append("launchData", joinData.launchData);
    }
    if (joinData.experienceEventId && joinData.experienceEventId !== "") {
      searchParams.append("eventId", joinData.experienceEventId);
    }
  }
  return `${baseUrl}?${searchParams.toString()}`;
};

const deepLinkNavigate = (host: DeepLinkHost, target: DeepLink): Promise<boolean> => {
  const { path, params } = target;
  let urlTarget: string | undefined;

  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const navigateSubPath = path[1]!;
  if (DeepLinkNavigationMap[navigateSubPath]) {
    urlTarget = DeepLinkNavigationMap[navigateSubPath];
    // For simple mapping of deepLink parameters to url parameters
    // More complex deepLink handling defined below
    for (const [key, value] of Object.entries(params)) {
      urlTarget = urlTarget.replace(`{${key}}`, value);
    }
  } else if (isItemDeeplink(navigateSubPath, params)) {
    // This branch is for parsing
    // roblox://navigation/item_details?itemType=<itemType>&itemId=<itemId>
    // @ts-expect-error TODO: old, migrated code
    urlTarget = `${ItemTypePathMap[params.itemType]}/${params.itemId}`;
  } else if (navigateSubPath === PathPart.GameDetails && params.gameId) {
    // roblox://navigation/game_details?gameId=<universeId>
    // navigate to game page. Deeplink provides a universe id, but we need a
    // placeId for the url - so we call the game info endpoint first
    return host
      .getPlaceIdFromUniverseId(params.gameId)
      .then((rootPlaceId: number) => {
        if (rootPlaceId) {
          window.location.href = `${UrlPart.Games}/${rootPlaceId}`;
          return true;
        }
        return false;
      })
      .catch(() => false);
  } else if (navigateSubPath === PathPart.Profile || navigateSubPath === PathPart.ProfileCard) {
    if (params.userId) {
      // roblox://navigation/profile?userId=<userId>
      // Navigate to user profile
      urlTarget = `${UrlPart.Users}/${params.userId}${UrlPart.Profile}`;
    } else if (params.groupId) {
      // roblox://navigation/profile?groupId=<groupId>
      // Navigate to group profile
      urlTarget = `${UrlPart.Groups}/${params.groupId}`;
    }
  } else if (navigateSubPath === PathPart.GiftCards) {
    // roblox://navigation/gift_cards
    // Navigate to gift cards page
    urlTarget = UrlPart.GiftCards;
  } else if (navigateSubPath === PathPart.ShareLinks) {
    // roblox://navigation/share_links?code=<linkId>&v=v2
    if (params.v === "v2" && params.code !== undefined) {
      const code = params.code || "";
      return host
        .resolveShareLinksV2(params.code)
        .then(response => {
          if (response.data.linkType === "Referral") {
            const referralStatus = response.data.status;
            const referralEvent = buildResolveLinkEvent(
              referralStatus,
              code,
              ShareLinksTypeV2.REFERRAL,
            );
            host.sendEvent(referralEvent.type, referralEvent.context, referralEvent.params);

            if (referralStatus !== "Valid") {
              host.fireCounter(CounterEvents.RobloxPlusReferralResolutionFailed);
            }

            const referrerParam = response.data.targetId
              ? `&referrerId=${response.data.targetId}`
              : "";
            const referralQuery =
              referralStatus === "Valid"
                ? `referralCode=${code}${referrerParam}`
                : `referralStatus=${referralStatus}`;
            // Recipients subscribe on web, so never hand off to the desktop client — that would
            // leave `/share-links` spinning. The Plus page reads the referral params and opens the
            // referral sheet inline, so the recipient lands directly on the subscribe surface.
            window.location.href = `${UrlPart.Plus}?ctx=plus_referral&${referralQuery}`;
            return true;
          }
          if (response.data.status === "Invalid") {
            return false;
          }
          const resolveLinkEvent = buildResolveLinkEvent(
            response.data.status,
            code,
            ShareLinksTypeV2.EXPERIENCE_V2,
          );
          host.sendEvent(resolveLinkEvent.type, resolveLinkEvent.context, resolveLinkEvent.params);
          if (response.data.linkType === "Experience" && response.data.targetId) {
            window.location.href = `${UrlPart.Games}/${response.data.targetId}`;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const launchData = response.data.customData || "{}";
            host.launchGame(
              buildPlayGameProperties(
                response.data.targetId,
                response.data.targetId,
                undefined, // instanceId
                undefined, // playerId
                undefined, // privateServerLinkCode
                undefined, // inviterId
                { launchData },
              ),
              buildDeepLinkLaunchGameEvent(response.data.targetId, code, response.data.status),
            );
          } else if (
            (response.data.linkType === "StudioEdit" ||
              response.data.linkType === "StudioTeamTest") &&
            response.data.targetId
          ) {
            return host
              .getUniverseIdFromPlaceId(response.data.targetId)
              .then((id: number) => {
                const universeId = id.toString();
                if (!universeId) {
                  return false;
                }

                const startTeamTest = response.data.linkType === "StudioTeamTest";

                const additionalParams: { instanceId?: string; annotationId?: string } = {};
                if (response.data.linkType === "StudioEdit") {
                  if (params.instanceId) {
                    additionalParams.instanceId = params.instanceId;
                  }
                  if (params.annotationId) {
                    additionalParams.annotationId = params.annotationId;
                  }
                }

                host.openStudio({
                  placeId: response.data.targetId,
                  universeId,
                  startTeamTest,
                  instanceId: additionalParams.instanceId,
                  annotationId: additionalParams.annotationId,
                });
                return true;
              })
              .catch(() => false);
          } else if (
            (response.data.linkType === "UserTrustedConnection" ||
              response.data.linkType === "StudioTrustedConnection") &&
            response.data.targetId
          ) {
            if (!parseInt(response.data.targetId)) {
              return false;
            }

            const linkTypeV2 =
              response.data.linkType === "UserTrustedConnection"
                ? ShareLinksTypeV2.USER_TRUSTED_CONNECTION
                : ShareLinksTypeV2.STUDIO_TRUSTED_CONNECTION;
            const resolveLinkEvent = buildResolveLinkEvent(response.data.status, code, linkTypeV2);
            host.sendEvent(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params,
            );

            if (linkTypeV2 === ShareLinksTypeV2.USER_TRUSTED_CONNECTION) {
              window.location.href = target.url;
            }

            window.location.href = `${UrlPart.Users}/${response.data.targetId}${UrlPart.Profile}?trustedFriendLinkCode=${code}`;
          } else if (response.data.linkType === "Moments" && response.data.targetId) {
            const resolveMomentsEvent = buildResolveLinkEvent(
              response.data.status,
              code,
              ShareLinksTypeV2.MOMENTS,
            );
            host.sendEvent(
              resolveMomentsEvent.type,
              resolveMomentsEvent.context,
              resolveMomentsEvent.params,
            );

            window.location.href = target.url;
            // Fall back to the platform Moments tab if the specific post cannot be opened.
            window.location.href = "roblox://navigation/moments";
          } else if (response.data.linkType === "SchoolInvite") {
            const resolveSchoolInviteEvent = buildResolveLinkEvent(
              response.data.status,
              code,
              ShareLinksTypeV2.SCHOOL_INVITE,
            );
            host.sendEvent(
              resolveSchoolInviteEvent.type,
              resolveSchoolInviteEvent.context,
              resolveSchoolInviteEvent.params,
            );

            if (response.data.status !== "Valid") {
              host.fireCounter(CounterEvents.SchoolInviteResolutionFailed);
              return false;
            }

            if (!host.startDeepLinkFlow(target.url)) {
              window.location.href = target.url;
            }
          }
          return true;
        })
        .catch(() => false);
    }
    // roblox://navigation/share_links?code=<linkId>&type=<linkType>
    switch (params.type) {
      case ShareLinksType.EXPERIENCE_INVITE: {
        if (params.code != null) {
          const { code } = params;
          return host
            .resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.experienceInviteData;
              if (data?.placeId == null) {
                return false;
              }

              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.EXPERIENCE_INVITE,
              );
              host.sendEvent(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );
              if (data.status === ExperienceInviteStatus.VALID && data.instanceId) {
                window.location.href = `${UrlPart.Games}/${data.placeId}`;
                host.launchGame(
                  buildPlayGameProperties(
                    // @ts-expect-error TODO: old, migrated code
                    data.placeId,
                    data.placeId,
                    data.instanceId,
                    undefined, // playerId
                    undefined, // privateServerLinkCode
                    data.inviterId,
                  ),
                  buildDeepLinkLaunchGameEvent(data.placeId.toString(), code, data.status),
                );
                return true;
              }
              if (
                data.status === ExperienceInviteStatus.EXPIRED ||
                data.status === ExperienceInviteStatus.INVITER_NOT_IN_EXPERIENCE
              ) {
                // eslint-disable-next-line no-restricted-properties -- core-lib setItem would JSON-encode the base64 value
                window.localStorage.setItem(
                  "ref_info",
                  stringToBase64(
                    json.serialize({ [data.placeId.toString()]: data.inviterId.toString() }).value,
                  ),
                );
                window.location.href = `${UrlPart.Games}/${data.placeId}?experienceInviteLinkId=${params.code}&experienceInviteStatus=${data.status}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              host.fireCounter(CounterEvents.InviteResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.NOTIFICATION_EXPERIENCE_INVITE: {
        if (params.code) {
          return host
            .resolveShareLinks(params.code, ShareLinksType.NOTIFICATION_EXPERIENCE_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.notificationExperienceInviteData;
              if (data?.placeId) {
                const includeInstanceId =
                  data.instanceId && data.status === ExperienceInviteStatus.VALID;
                const launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}${
                  data.launchData
                    ? `&launchData=${encodeURIComponent(encodeURIComponent(data.launchData))}`
                    : ""
                }${includeInstanceId ? `&gameInstanceId=${data.instanceId}` : ""}${
                  data.inviterId ? `&referredByPlayerId=${data.inviterId}` : ""
                }`;
                host.startGameWithDeepLinkUrl(launchLink, data.placeId);
                return true;
              }
              return false;
            })
            .catch(() => {
              host.fireCounter(CounterEvents.NotificationInviteResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.FRIEND_INVITE: {
        if (params.code) {
          const { code } = params;
          return host
            .resolveShareLinks(params.code, ShareLinksType.FRIEND_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.friendInviteData;
              if (data?.senderUserId == null) {
                return false;
              }
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.FRIEND_INVITE,
              );
              host.sendEvent(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );
              if (
                data.status === FriendInviteStatus.VALID ||
                data.status === FriendInviteStatus.CONSUMED ||
                data.status === FriendInviteStatus.EXPIRED
              ) {
                window.location.href = `${UrlPart.Users}/${data.senderUserId}${UrlPart.Profile}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              host.fireCounter(CounterEvents.FriendRequestResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.PROFILE: {
        if (params.code) {
          const { code } = params;
          return host
            .resolveShareLinks(params.code, ShareLinksType.PROFILE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.profileLinkResolutionResponseData;
              if (data?.userId == null) {
                return false;
              }
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.PROFILE,
              );
              host.sendEvent(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );
              if (data.status === ProfileShareStatus.VALID) {
                // TODO: old, migrated code
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                const profileShareSource = host.getQueryParam("source") as string;
                const friendshipSourceType = getFriendshipSourceType(profileShareSource);
                window.location.href = `${UrlPart.Users}/${data.userId}${UrlPart.Profile}?friendshipSourceType=${friendshipSourceType}`;
                return true;
              }
              return false;
            })
            .catch(() => {
              host.fireCounter(CounterEvents.ProfileShareResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.SCREENSHOT_INVITE: {
        if (params.code) {
          const { code } = params;
          return host
            .resolveShareLinks(params.code, ShareLinksType.SCREENSHOT_INVITE)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.screenshotInviteData;
              if (
                data?.placeId == null ||
                ![
                  ScreenshotInviteStatus.EXPIRED,
                  ScreenshotInviteStatus.INVITER_NOT_IN_EXPERIENCE,
                  ScreenshotInviteStatus.VALID,
                ].includes(data.status)
              ) {
                return false;
              }

              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.SCREENSHOT_INVITE,
              );
              host.sendEvent(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );

              if (
                data.status === ScreenshotInviteStatus.EXPIRED ||
                data.status === ScreenshotInviteStatus.INVITER_NOT_IN_EXPERIENCE
              ) {
                window.location.href = `${UrlPart.Games}/${data.placeId}?experienceInviteLinkId=${params.code}&experienceInviteStatus=${data.status}`;
                return true;
              }

              let launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}`;
              if (data.launchData) {
                launchLink += `&launchData=${encodeURIComponent(
                  encodeURIComponent(data.launchData),
                )}`;
              }
              if (data.instanceId) {
                launchLink += `&gameInstanceId=${data.instanceId}`;
              }
              host.startGameWithDeepLinkUrl(launchLink, data.placeId);
              return true;
            })
            .catch(() => {
              host.fireCounter(CounterEvents.ScreenshotInviteShareResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.SERVER: {
        if (params.code) {
          const { code } = params;
          return host
            .resolveShareLinks(params.code, ShareLinksType.SERVER)
            .then(response => {
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const data = response?.data?.privateServerInviteData;

              if (
                data?.universeId == null ||
                ![PrivateServerLinkStatus.VALID, PrivateServerLinkStatus.EXPIRED].includes(
                  data.status,
                )
              ) {
                return false;
              }

              host
                .getPlaceIdFromUniverseId(data.universeId.toString())
                .then((rootPlaceId: number) => {
                  if (!rootPlaceId) {
                    return false;
                  }

                  const resolveLinkEvent = buildResolveLinkEvent(
                    data.status,
                    code,
                    ShareLinksType.SERVER,
                  );

                  host.sendEvent(
                    resolveLinkEvent.type,
                    resolveLinkEvent.context,
                    resolveLinkEvent.params,
                  );

                  window.location.href = `${UrlPart.Games}/${rootPlaceId}?privateServerLinkCode=${data.linkCode}`;
                  return true;
                })
                .catch(() => false);

              return true;
            })
            .catch(() => {
              host.fireCounter(CounterEvents.PrivateServerLinkResolutionFailed);
              return false;
            });
        }
        break;
      }
      case ShareLinksType.EXPERIENCE_AFFILIATE: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return host
          .resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_AFFILIATE)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.experienceAffiliateData;
            if (data?.status !== ExperienceAffiliateStatus.VALID) {
              return false;
            }
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (data?.universeId == null) {
              const resolveLinkEvent = buildResolveLinkEvent(
                data.status,
                code,
                ShareLinksType.EXPERIENCE_AFFILIATE,
              );
              host.sendEvent(
                resolveLinkEvent.type,
                resolveLinkEvent.context,
                resolveLinkEvent.params,
              );

              // There is no universeId, check if it was resolved to fallback to profile
              if (
                data.fallbackType === ExperienceAffiliateDeepLinkFallbackType.PROFILE &&
                data.fallbackId
              ) {
                // Redirect to the profile page
                window.location.href = `${UrlPart.Users}/${data.fallbackId}${UrlPart.Profile}`;
              } else {
                const referralUrl = `${window.location.protocol}/${window.location.hostname}${window.location.pathname}?type=${ShareLinksType.EXPERIENCE_AFFILIATE}&code=${params.code}`;
                window.location.href = `/?referralUrl=${encodeURIComponent(referralUrl)}`;
              }

              return true;
            }

            return host
              .getPlaceIdFromUniverseId(data.universeId.toString())
              .then((rootPlaceId: number) => {
                if (!rootPlaceId) {
                  return false;
                }

                const resolveLinkEvent = buildResolveLinkEvent(
                  data.status,
                  code,
                  ShareLinksType.EXPERIENCE_AFFILIATE,
                );
                host.sendEvent(
                  resolveLinkEvent.type,
                  resolveLinkEvent.context,
                  resolveLinkEvent.params,
                );

                const referralUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}?type=${ShareLinksType.EXPERIENCE_AFFILIATE}&code=${params.code}`;
                let redirectUrl = `${UrlPart.Games}/${rootPlaceId}?shareLinkSourceType=${
                  ShareLinksType.EXPERIENCE_AFFILIATE
                }&referralUrl=${encodeURIComponent(referralUrl)}`;
                // TODO: old, migrated code
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                redirectUrl = buildRedirectUrlWithJoinData(redirectUrl, data.joinData!);
                window.location.href = redirectUrl;
                return true;
              })
              .catch(() => false);
          })
          .catch(() => {
            host.fireCounter(CounterEvents.ExperienceDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.EXPERIENCE_DETAILS: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return host
          .resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_DETAILS)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.experienceDetailsInviteData;

            if (data?.universeId == null || data.status !== ExperienceDetailsStatus.VALID) {
              return false;
            }

            return host
              .getPlaceIdFromUniverseId(data.universeId.toString())
              .then((rootPlaceId: number) => {
                if (!rootPlaceId) {
                  return false;
                }

                const resolveLinkEvent = buildResolveLinkEvent(
                  data.status,
                  code,
                  ShareLinksType.EXPERIENCE_DETAILS,
                );
                host.sendEvent(
                  resolveLinkEvent.type,
                  resolveLinkEvent.context,
                  resolveLinkEvent.params,
                );

                window.location.href = `${UrlPart.Games}/${rootPlaceId}?shareLinkSourceType=${ShareLinksType.EXPERIENCE_DETAILS}`;
                return true;
              })
              .catch(() => false);
          })
          .catch(() => {
            host.fireCounter(CounterEvents.ExperienceDetailsResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.AVATAR_ITEM_DETAILS:
      case ShareLinksType.AVATAR_ITEM_AFFILIATE: {
        if (!params.code) {
          break;
        }

        const { code } = params;
        const linkType =
          params.type === ShareLinksType.AVATAR_ITEM_AFFILIATE
            ? ShareLinksType.AVATAR_ITEM_AFFILIATE
            : ShareLinksType.AVATAR_ITEM_DETAILS;

        return host
          .resolveShareLinks(params.code, linkType)
          .then(response => {
            //
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.avatarItemDetailsData;

            if (
              data?.itemId == null ||
              data.itemId === "" ||
              data.itemId === "0" ||
              !(data.itemType in UrlPart) ||
              data.status !== AvatarItemDetailsStatus.VALID
            ) {
              return false;
            }

            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const itemType = data.itemType as "Asset" | "Bundle" | "Look";
            const resolveLinkEvent = buildResolveLinkEvent(data.status, code, linkType);
            host.sendEvent(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params,
            );

            window.location.href = `${UrlPart[itemType]}/${data.itemId}?pid=share&is_retargeting=false&deep_link_value=${params.code}`;
            return true;
          })
          .catch(() => {
            host.fireCounter(
              linkType === ShareLinksType.AVATAR_ITEM_AFFILIATE
                ? CounterEvents.AvatarItemAffiliateResolutionFailed
                : CounterEvents.AvatarItemDetailsResolutionFailed,
            );
            return false;
          });
      }
      case ShareLinksType.CONTENT_POST: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return host
          .resolveShareLinks(params.code, ShareLinksType.CONTENT_POST)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.contentPostData;

            if (!data || data.status !== ContentPostStatus.VALID) {
              return false;
            }

            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              code,
              ShareLinksType.CONTENT_POST,
            );
            host.sendEvent(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params,
            );

            window.location.href = `${UrlPart.AppLauncher}${UrlPart.ContentPost}?userId=${data.postCreatorId}&postId=${data.postId}`;
            window.location.href = `${UrlPart.Users}/${data.postCreatorId}${UrlPart.Profile}`;
            return true;
          })
          .catch(() => {
            host.fireCounter(CounterEvents.ContentPostResolutionFailed);
            return false;
          });
      }
      case ShareLinksType.EXPERIENCE_EVENT: {
        if (!params.code) {
          break;
        }

        const { code } = params;

        return host
          .resolveShareLinks(params.code, ShareLinksType.EXPERIENCE_EVENT)
          .then(response => {
            // TODO: old, migrated code
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const data = response?.data?.experienceEventData;

            if (
              data?.universeId == null ||
              !data.placeId ||
              data.status !== ExperienceEventStatus.VALID
            ) {
              return false;
            }

            const resolveLinkEvent = buildResolveLinkEvent(
              data.status,
              code,
              ShareLinksType.EXPERIENCE_EVENT,
            );
            host.sendEvent(
              resolveLinkEvent.type,
              resolveLinkEvent.context,
              resolveLinkEvent.params,
            );

            // TODO (xueyinwang): Support redirection with a separate Status when product needs come
            let launchLink = `${UrlPart.ExperienceLauncher}placeId=${data.placeId}`;
            launchLink = buildRedirectUrlWithJoinData(launchLink, data.joinData);
            host.startGameWithDeepLinkUrl(launchLink, data.placeId);
            return true;
          })
          .catch(() => {
            host.fireCounter(CounterEvents.ExperienceEventResolutionFailed);
            return false;
          });
      }
      case undefined:
      default: {
        break;
      }
    }
  } else if (navigateSubPath === PathPart.Chat && params.userId) {
    host.startChat(params.userId);
    return Promise.resolve(true);
  } else if (navigateSubPath === PathPart.ExternalWebUrl) {
    // roblox://navigation/external_web_link?domain=zendesk&locale=ko&articleId=1234&type=policy_update
    let zendeskUrl;
    if (params.domain === ExternalWebUrlDomains.Zendesk) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const { articleId, locale } = params as ZendeskParams;
      zendeskUrl = host.getHelpDeskUrl(locale, articleId);
      if (zendeskUrl) {
        // eslint-disable-next-line no-restricted-properties -- opens the help center in a new tab
        window.open(zendeskUrl, "_blank");
      }
    }
    return Promise.resolve(Boolean(zendeskUrl));
  } else if (navigateSubPath === PathPart.Avatar) {
    // roblox://navigation/avatar
    if (!Object.keys(params).length) {
      // roblox://navigation/avatar
      // Navigate to my avatar page
      urlTarget = UrlPart.Avatar;
    } else {
      // roblox://navigation/avatar?itemId=<itemId>&itemType=<itemType>
      // Navigate to avatar details UA
      urlTarget = target.url;
    }
  } else if (navigateSubPath === PathPart.Group) {
    if (params.groupId) {
      if (params.forumCategoryId && params.forumPostId && params.forumCommentId) {
        // roblox://navigation/group?groupId=<groupId>&forumCategoryId=<forumCategoryId>&forumPostId=<forumPostId>&forumCommentId=<forumCommentId>
        // We don't know the Category name or Post title here so we just use dummy values in the URL
        urlTarget = `${UrlPart.Groups}/${params.groupId}#!/forums/category-${params.forumCategoryId}/post/post-${params.forumPostId}/comment/${params.forumCommentId}`;
      } else {
        // roblox://navigation/group?groupId=<groupId>
        urlTarget = `${UrlPart.Groups}/${params.groupId}`;
      }
    }
  } else if (navigateSubPath === PathPart.SupportCenter) {
    // roblox://navigation/support_center
    // roblox://navigation/support_center?universeId=<universeId>&ticketId=<ticketId> → support-center#!/tickets/...
    if (params.universeId && params.ticketId) {
      urlTarget = `${UrlPart.SupportCenter}#!/tickets/${params.universeId}/${params.ticketId}`;
    } else {
      urlTarget = UrlPart.SupportCenter;
    }
  } else if (navigateSubPath === PathPart.SecurityAlert) {
    // roblox://navigation/security_alert?payload={payload}&username={username}
    // Navigate to security alert page
    if (params.payload && params.username) {
      urlTarget = `${UrlPart.SecurityAlert}?payload=${params.payload}&username=${params.username}`;
    } else {
      urlTarget = `${UrlPart.SecurityAlert}?payload=null&username=`;
    }
  } else if (navigateSubPath === PathPart.Fae) {
    // roblox://navigation/fae
    // Navigate to fae upsell page
    const upsell = host.startAccessManagementUpsell({
      featureName: AmpFeatureName.Fae,
      namespace: AmpNamespace.Fae,
    });
    if (upsell) {
      return upsell.then(() => true).catch(() => false);
    }
    return Promise.resolve(false);
  } else if (navigateSubPath === PathPart.CurrencyTransfer) {
    // Pass through roblox:// unchanged for protocol / in-app handling (urlTarget = target.url).
    // Receive: roblox://navigation/currency_transfer?direction=receive&transferrequestid=RXT-...
    // Send: roblox://navigation/currency_transfer?direction=send&userid={id}&transferorigination=buyRobux
    const transferRequestId =
      params.transferrequestid ?? params.transferRequestId ?? params.transferrequestId;
    const direction = (params.direction ?? params.Direction)?.toLowerCase();
    const userId = params.userid ?? params.userId;
    const transferOrigination = params.transferorigination ?? params.transferOrigination;
    const isReceiveFlow = Boolean(transferRequestId);
    const isSendFlow = direction === "send" && Boolean(userId) && Boolean(transferOrigination);
    if (isReceiveFlow || isSendFlow) {
      const deviceMeta = host.getDeviceMeta();
      if (deviceMeta?.isDesktop && host.startDeepLinkFlow(target.url)) {
        return Promise.resolve(true);
      }
      urlTarget = target.url;
    }
  } else if (navigateSubPath === PathPart.AcceptGift) {
    // Pass through roblox:// unchanged for protocol / in-app handling (urlTarget = target.url).
    // There is no web page for accepting a gift, so this mirrors currency_transfer.
    // roblox://navigation/accept_gift?giftId={guid}
    if (params.giftId) {
      const deviceMeta = host.getDeviceMeta();
      if (deviceMeta?.isDesktop && host.startDeepLinkFlow(target.url)) {
        return Promise.resolve(true);
      }
      urlTarget = target.url;
    }
  } else if (navigateSubPath === PathPart.AmpWizard) {
    // Pass through roblox:// unchanged for protocol / in-app handling.
    // amp_wizard deeplinking is mobile-only, so no desktop fallback is needed here.
    // roblox://navigation/amp_wizard?feature_name=...&namespace=...&entry_point=...&returnpage=...
    urlTarget = target.url;
  } else if (navigateSubPath === PathPart.PlusUpsell) {
    // Pass through roblox:// unchanged for protocol / in-app handling.
    // roblox://navigation/plus_upsell
    urlTarget = target.url;
  } else if (navigateSubPath === PathPart.PlusReferralDashboard) {
    // Pass through roblox:// unchanged for protocol / in-app handling.
    // roblox://navigation/plus_referral_dashboard
    urlTarget = target.url;
  } else if (navigateSubPath === PathPart.PlusSubscribe) {
    // roblox://navigation/plus_subscribe?surface=PlusReferralLandingSheet&referrer_id=123
    const plusParams = UrlSearchParams.new([
      ...(params.surface === "PlusReferralLandingSheet" ? [["ctx", "plus_referral"] as const] : []),
      ...(params.referrer_id ? [["referrerId", params.referrer_id] as const] : []),
    ]);
    const plusQuery = plusParams.toString();
    urlTarget = plusQuery ? `${UrlPart.Plus}?${plusQuery}` : UrlPart.Plus;
  }

  if (urlTarget) {
    window.location.href = urlTarget;
  } else {
    host.fireCounter(CounterEvents.NavigationFailed);
  }
  return Promise.resolve(Boolean(urlTarget));
};

const deepLinkGameJoin = (host: DeepLinkHost, target: DeepLink): Promise<boolean> => {
  const { params } = target;
  if (!params.placeId) {
    return Promise.resolve(false);
  }

  if (params.linkCode) {
    window.location.href = `${UrlPart.Games}/${params.placeId}?privateServerLinkCode=${params.linkCode}`;
  } else if (params.accessCode) {
    window.location.href = `${UrlPart.GameStart}?placeId=${params.placeId}&accessCode=${params.accessCode}`;
  } else if (params.launchData) {
    const launchLink = `${UrlPart.ExperienceLauncher}placeId=${params.placeId}${
      params.launchData ? `&launchData=${params.launchData}` : ""
    }`;
    // eslint-disable-next-line no-restricted-syntax -- NaN on a malformed placeId, as before
    host.startGameWithDeepLinkUrl(launchLink, Number(params.placeId));
  } else {
    host.joinMultiplayerGame(parseFloat(params.placeId) ?? Number.NaN);
  }

  return Promise.resolve(true);
};

const deepLinkFollowUserToExperience = (target: DeepLink): Promise<boolean> => {
  const { userId } = target.params;
  if (userId) {
    window.location.href = `/games/start?userId=${userId}`;
  }
  return Promise.resolve(Boolean(userId));
};

const deepLinkGroup = (target: DeepLink): Promise<boolean> => {
  const { groupId } = target.params;
  if (groupId) {
    window.location.href = `/groups/${groupId}`;
  }
  return Promise.resolve(Boolean(groupId));
};

const pathRegex = /\/(\w+)/g; // matches: /(pathSegment)
const paramRegex = /(\w+)=([^&=]+)/g; // matches: (param)=(value)

const HYBRID_TARGET_KEY = "feature";
const HYBRID_TARGET_VALUE = "DeepLink";
const HYBRID_TARGET_PARAM_KEY = "deepLinkUrlPath";

export const parseDeepLink = (deepLinkString: string): DeepLink => {
  const path: PathPart[] = [];
  const params: DeepLinkParams = {};
  const url: string = deepLinkString;

  let pathPart = pathRegex.exec(deepLinkString);
  while (pathPart != null) {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    path.push(pathPart[1] as PathPart);
    pathPart = pathRegex.exec(deepLinkString);
  }

  let paramPart = paramRegex.exec(deepLinkString);
  while (paramPart != null) {
    const [, key, value] = paramPart;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    params[key!] = value!;
    paramPart = paramRegex.exec(deepLinkString);
  }

  return {
    path,
    params,
    url,
  };
};

export type DeepLinkNavigator = {
  navigateToDeepLink: (deepLinkUrl: string) => Promise<boolean>;
};

export const createDeepLinkNavigator = (host: DeepLinkHost): DeepLinkNavigator => {
  const firstUriSegmentToHandler: Record<string, (target: DeepLink) => Promise<boolean>> = {
    [PathPart.Navigation]: target => deepLinkNavigate(host, target),
    [PathPart.PlaceId]: target => deepLinkGameJoin(host, target),
    [PathPart.UserId]: deepLinkFollowUserToExperience,
    [PathPart.Group]: deepLinkGroup,
  };

  return {
    navigateToDeepLink: deepLinkUrl => {
      if (host.getDeviceMeta()?.isIosApp && host.navigateToHybridFeature) {
        host.navigateToHybridFeature({
          [HYBRID_TARGET_KEY]: HYBRID_TARGET_VALUE,
          [HYBRID_TARGET_PARAM_KEY]: deepLinkUrl,
        });
        return Promise.resolve(true);
      }
      if (host.getDeviceMeta()?.isInApp) {
        // use lua deeplinks map to resolve url if in universal app
        // https://github.com/Roblox/lua-apps/blob/master/src/internal/LuaApp/Modules/LuaApp/DeepLinks/DeepLinkMap.lua
        window.location.href = deepLinkUrl;
        return Promise.resolve(true);
      }
      const target = parseDeepLink(deepLinkUrl);
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const path = target.path[0]!;
      const handler = firstUriSegmentToHandler[path];
      return handler ? handler(target) : Promise.resolve(false);
    },
  };
};
