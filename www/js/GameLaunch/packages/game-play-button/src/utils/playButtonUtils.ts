import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import "@rbx/core-scripts/global";
import { JoinDataProperties, buildPlayGameProperties } from "@rbx/core-scripts/game";
import {
  eventTypes,
  sendEvent,
  sendEventWithTarget,
  targetTypes,
} from "@rbx/core-scripts/event-stream";
import { composeQueryString } from "@rbx/core-scripts/util/url";
import { generateRandomUuid } from "@rbx/core-lib/uuid";
import { getDeviceMeta, isIos13Ipad } from "@rbx/core-scripts/meta/device";
import { fireEvent } from "@rbx/www-common/event-tracker";
import {
  showAvatarVideoOptInOverlay,
  showVoiceOptInOverlay,
  startVerificationFlow as startIdentityVerificationFlow,
} from "@rbx/www-common/identity-verification";
import { isJoinAttemptIdEnabled, launchPlayGame } from "./gameLauncher";
import { getStartAccessManagementUpsell } from "./accessManagementUpsell";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import {
  TAppsFlyerReferralProperties,
  TPrivatePlaytestInfo,
  TPlayabilityStatus,
  TPlayabilityStatusWithUnplayableError,
  type TPlayButtonPageContext,
} from "../types/playButtonTypes";
import playButtonConstants, { playOnWebActionType } from "../constants/playButtonConstants";

export const PlaytestUnlockUpsellType = {
  AgeVerification: "AgeVerification",
  UpdatePlaytestSettings: "UpdatePlaytestSettings",
  AddTrustedFriend: "AddTrustedFriend",
} as const;

const {
  unlockPlayIntentConstants,
  defaultAfReferralProperties,
  ageCheckUpsellFeatureName,
  ageCheckUpsellNamespace,
  counterEvents,
} = playButtonConstants;

type TEventProperties = Record<string, string | number | undefined>;
type TJoinAttemptProperties = {
  joinAttemptId?: string;
  joinAttemptOrigin?: string | number;
};

function getJoinAttemptProperties(eventProperties: TEventProperties): TJoinAttemptProperties {
  if (!isJoinAttemptIdEnabled()) {
    return {};
  }

  const { joinAttemptOrigin } = eventProperties;
  let { joinAttemptId } = eventProperties;
  joinAttemptId = typeof joinAttemptId === "string" ? joinAttemptId : generateRandomUuid();
  return { joinAttemptId, joinAttemptOrigin };
}

function sendPlayGameClickedEvent(
  eventProperties: TEventProperties,
  placeId: string,
  joinDataProperties: JoinDataProperties,
  actionType?: string,
): TEventProperties {
  const mergedProperties: TEventProperties = {
    placeId,
    ...eventProperties,
    ...getJoinAttemptProperties(eventProperties),
    ...joinDataProperties,
    ...(actionType == null ? {} : { actionType }),
  };

  sendEventWithTarget("playGameClicked", "click", mergedProperties);

  return mergedProperties;
}

function getEncodedUniversalLink(placeId: string, eventProperties: TEventProperties = {}): string {
  let universalLink = `${environmentUrls.websiteUrl}/games/start?placeid=${placeId}`;

  if (isJoinAttemptIdEnabled()) {
    const { joinAttemptId, joinAttemptOrigin } = getJoinAttemptProperties(eventProperties);

    if (typeof joinAttemptId === "string" && joinAttemptId.length > 0) {
      universalLink += `&joinAttemptId=${joinAttemptId}`;

      if (typeof joinAttemptOrigin === "string" && joinAttemptOrigin.length > 0) {
        universalLink += `&joinAttemptOrigin=${joinAttemptOrigin}`;
      }
    }
  }

  // append join data
  const { launchData, eventId } = eventProperties;
  if (typeof launchData === "string" && launchData.length > 0) {
    universalLink += `&launchData=${launchData}`;
  }
  if (typeof eventId === "string" && eventId.length > 0) {
    universalLink += `&eventId=${eventId}`;
  }

  return encodeURIComponent(universalLink);
}

export const launchGame = (
  placeId: string,
  rootPlaceId?: string,
  privateServerLinkCode?: string,
  gameInstanceId?: string,
  eventProperties: TEventProperties = {},
  joinData: JoinDataProperties = {},
  appsFlyerReferralProperties: TAppsFlyerReferralProperties = {},
  actionType?: string,
): void => {
  const deviceMeta = getDeviceMeta();
  if (
    deviceMeta?.isIosDevice ||
    deviceMeta?.isAndroidDevice ||
    isIos13Ipad() ||
    deviceMeta?.isChromeOs
  ) {
    const playGameClickedEventProperties = sendPlayGameClickedEvent(
      eventProperties,
      placeId,
      joinData,
      actionType,
    );

    const encodedUniversalLink = getEncodedUniversalLink(placeId, playGameClickedEventProperties);
    const afDeeplinkParams = composeQueryString({
      ...defaultAfReferralProperties,
      ...appsFlyerReferralProperties,
    });
    window.open(
      `https://ro.blox.com/Ebh5?${afDeeplinkParams}&af_dp=${encodedUniversalLink}&af_web_dp=${encodedUniversalLink}&deep_link_value=${encodedUniversalLink}`,
      "_self",
    );
  } else {
    // TODO(npatel, 2024-12-03): Modularize this code separately and add stricter type validation via zod.
    let referredByPlayerId: string | undefined = "0";
    if (window.localStorage.getItem("ref_info") !== null) {
      const refInfo: Record<string, string> = (() => {
        const refInfoRaw = window.localStorage.getItem("ref_info");
        if (!refInfoRaw) return {};
        try {
          // TODO: old, migrated code
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          return JSON.parse(atob(refInfoRaw)) as Record<string, string>;
        } catch {
          return {};
        }
      })();
      referredByPlayerId = refInfo[placeId];
    }
    launchPlayGame(
      buildPlayGameProperties(
        rootPlaceId,
        placeId,
        gameInstanceId,
        /* playerId= */ undefined,
        privateServerLinkCode,
        referredByPlayerId,
        joinData,
      ),
      playButtonConstants.eventStreamProperties(placeId, eventProperties),
      actionType,
    );
    if (window.localStorage.getItem("ref_info")) {
      window.localStorage.removeItem("ref_info");
    }
  }
};

export const launchLogin = (
  placeId: string,
  appsFlyerReferralProperties: TAppsFlyerReferralProperties = {},
): void => {
  const deviceMeta = getDeviceMeta();
  if (
    deviceMeta?.isIosDevice ||
    deviceMeta?.isAndroidDevice ||
    isIos13Ipad() ||
    deviceMeta?.isChromeOs
  ) {
    const playGameClickedEventProperties = sendPlayGameClickedEvent({}, placeId, {});
    const encodedUniversalLink = getEncodedUniversalLink(placeId, playGameClickedEventProperties);
    const afDeeplinkParams = composeQueryString({
      ...defaultAfReferralProperties,
      ...appsFlyerReferralProperties,
    });
    window.open(
      `https://ro.blox.com/Ebh5?${afDeeplinkParams}&af_dp=${encodedUniversalLink}&af_web_dp=${encodedUniversalLink}&deep_link_value=${encodedUniversalLink}`,
      "_self",
    );
  } else {
    launchPlayGame(
      buildPlayGameProperties(undefined, placeId),
      playButtonConstants.eventStreamProperties(placeId, {}),
    );
  }
};

// The global type declares this service as required, but it is only installed by the
// IdVerification SCC and window.Roblox is absent in Next.js, so check it at runtime.
type IdentityVerificationService = Window["Roblox"]["IdentityVerificationService"];

const getIdentityVerificationService = (): IdentityVerificationService | undefined =>
  (window as { Roblox?: { IdentityVerificationService?: IdentityVerificationService } }).Roblox
    ?.IdentityVerificationService;

export const startVerificationFlow = async (): Promise<[boolean, boolean]> => {
  try {
    const service = getIdentityVerificationService();
    const flow = service ? service.startVerificationFlow() : startIdentityVerificationFlow();
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return flow;
  } catch {
    return [false, false];
  }
};

export const startVoiceOptInOverlayFlow = async (
  requireExplicitVoiceConsent: boolean,
  useVoiceUpsellV2Design: boolean,
): Promise<boolean> => {
  try {
    const service = getIdentityVerificationService();
    const flow = service
      ? service.showVoiceOptInOverlay(requireExplicitVoiceConsent, useVoiceUpsellV2Design)
      : showVoiceOptInOverlay(requireExplicitVoiceConsent, useVoiceUpsellV2Design);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return flow;
  } catch {
    return false;
  }
};

export const startAvatarVideoOptInOverlayFlow = async (
  requireExplicitCameraConsent: boolean,
  useCameraU13Design: boolean,
): Promise<boolean> => {
  try {
    const service = getIdentityVerificationService();
    const flow = service
      ? service.showAvatarVideoOptInOverlay(requireExplicitCameraConsent, useCameraU13Design)
      : showAvatarVideoOptInOverlay(requireExplicitCameraConsent, useCameraU13Design);
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return flow;
  } catch {
    return false;
  }
};

/**
 * @param context - Where the upsell is being shown
 */
export const startAgeCheckAccessManagementUpsellFlow = async ({
  context,
  pageContext,
}: {
  context: string;
  pageContext: TPlayButtonPageContext;
}): Promise<boolean> => {
  try {
    const params = {
      featureName: ageCheckUpsellFeatureName,
      isAsyncCall: false,
      usePrologue: false,
      namespace: ageCheckUpsellNamespace,
      featureSpecificData: {
        // We use this instead of setting the `surface` parameter to match the
        // format on app
        context: `${context}-${pageContext}`,
      },
    };

    return (await getStartAccessManagementUpsell()?.(params)) ?? false;
  } catch (e) {
    fireEvent(counterEvents.PlayButtonUpsellAgeRestrictionVerificationError);
    // re-throw the error to allow clients to handle their specific requirements
    // when an error happens
    throw e;
  }
};

export const handleShareLinkEventLogging = (placeId: string, universeId: string): void => {
  try {
    // The param name matches case-insensitively, like the legacy UrlParser lookup.
    const shareLinkSourceType = [...new URLSearchParams(window.location.search)].find(
      ([name]) => name.toLowerCase() === "sharelinksourcetype",
    )?.[1];
    if (shareLinkSourceType?.toLowerCase() !== "experiencedetails") {
      return;
    }

    sendEventWithTarget(
      "shareLinkGameJoin",
      "GamePlayButtonWeb",
      {
        placeId,
        universeId,
      },
      targetTypes.WWW,
    );
  } catch {
    // ignore
  }
};

export const shouldShowUnplayableButton = (
  playabilityStatus: TPlayabilityStatus | undefined,
  shouldShowVpcPlayButtonUpsells: boolean | undefined,
): playabilityStatus is TPlayabilityStatusWithUnplayableError => {
  // playability is loading
  if (playabilityStatus === undefined) {
    return false;
  }

  // these statuses are never fully unplayable
  if (
    playabilityStatus === PlayabilityStatus.Playable ||
    playabilityStatus === PlayabilityStatus.GuestProhibited ||
    playabilityStatus === PlayabilityStatus.PurchaseRequired ||
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser ||
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired ||
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityAgeCheckRequired
  ) {
    return false;
  }

  // These statuses should show Locked Join instead of Unplayable if VPC play button upsells are enabled
  if (
    (playabilityStatus ===
      PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls ||
      playabilityStatus === PlayabilityStatus.ContextualPlayabilityRequireParentApproval) &&
    shouldShowVpcPlayButtonUpsells
  ) {
    return false;
  }

  return true;
};

export const sendUnlockPlayIntentEvent = (
  universeId: string,
  upsellName: string,
  playabilityStatus: TPlayabilityStatus,
  pageContext: TPlayButtonPageContext,
): void => {
  const eventParams = {
    universeId,
    upsellName,
    playabilityStatus,
    pg: pageContext,
  };

  sendEvent(
    {
      name: unlockPlayIntentConstants.eventName,
      type: unlockPlayIntentConstants.eventName,
      context: eventTypes.formInteraction,
    },
    eventParams,
  );
};

export const getPlaytestUnlockUpsellType = (
  playabilityStatus: TPlayabilityStatus | undefined,
): (typeof PlaytestUnlockUpsellType)[keyof typeof PlaytestUnlockUpsellType] | undefined => {
  if (
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser ||
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityAgeCheckRequired
  ) {
    return PlaytestUnlockUpsellType.AgeVerification;
  }

  if (
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityRequireParentApproval ||
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityPlaytestDisabled
  ) {
    return PlaytestUnlockUpsellType.UpdatePlaytestSettings;
  }

  if (playabilityStatus === PlayabilityStatus.ContextualPlayabilityTrustedFriendRequired) {
    return PlaytestUnlockUpsellType.AddTrustedFriend;
  }

  return undefined;
};

export const shouldUsePlaytestActionNeeded = (
  playabilityStatus: TPlayabilityStatus | undefined,
  privatePlaytestInfo: TPrivatePlaytestInfo | undefined | null,
): privatePlaytestInfo is TPrivatePlaytestInfo => {
  const isEligibleUnavailableStatus =
    playabilityStatus !== undefined &&
    playabilityStatus !== PlayabilityStatus.Playable &&
    playabilityStatus !== PlayabilityStatus.GuestProhibited;
  const requiresUpsell =
    privatePlaytestInfo?.isPlayable === false &&
    getPlaytestUnlockUpsellType(privatePlaytestInfo.playabilityStatus) !== undefined;

  return isEligibleUnavailableStatus && requiresUpsell;
};

export const navigateToPlaytestSettings = (): void => {
  window.location.assign(
    getAbsoluteUrl("/my/account#!/privacy/ContentRestrictions/PrivatePlaytest"),
  );
};

export const navigateToUserProfile = (userId: number): void => {
  window.location.assign(getAbsoluteUrl(`/users/${userId}/profile`));
};

export const getJoindata = (launchDataFromProps?: string) => {
  // Allow launchData to be passed from props for direct joins
  const launchData =
    new URLSearchParams(window.location.search).get("launchData") ?? launchDataFromProps;
  const eventId = new URLSearchParams(window.location.search).get("eventId") ?? undefined;
  return {
    launchData,
    eventId,
  };
};

export const sendPlayOnWebClickEvents = (
  placeId: string,
  universeId: string,
  eventProperties: TEventProperties = {},
  joinData: JoinDataProperties = {},
): TJoinAttemptProperties => {
  handleShareLinkEventLogging(placeId, universeId);
  const { joinAttemptId, joinAttemptOrigin } = sendPlayGameClickedEvent(
    eventProperties,
    placeId,
    joinData,
    playOnWebActionType,
  );
  if (!isJoinAttemptIdEnabled() || typeof joinAttemptId !== "string" || joinAttemptId === "") {
    return {};
  }
  return {
    joinAttemptId,
    joinAttemptOrigin:
      typeof joinAttemptOrigin === "string" && joinAttemptOrigin.length > 0
        ? joinAttemptOrigin
        : undefined,
  };
};

export default {
  handleShareLinkEventLogging,
  launchGame,
  launchLogin,
  startVerificationFlow,
  startVoiceOptInOverlayFlow,
  startAgeCheckAccessManagementUpsellFlow,
  shouldShowUnplayableButton,
  shouldUsePlaytestActionNeeded,
  sendUnlockPlayIntentEvent,
};
