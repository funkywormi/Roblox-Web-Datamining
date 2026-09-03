import { GameLauncher } from "@rbx/core-scripts/legacy/Roblox";
import environmentUrls from "@rbx/environment-urls";
import "@rbx/core-scripts/global";
import {
  JoinDataProperties,
  launchGame as launchPlayGame,
  buildPlayGameProperties,
} from "@rbx/core-scripts/game";
import { eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import * as urlService from "@rbx/core-scripts/util/url";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import {
  deviceMeta as DeviceMeta,
  jsClientDeviceIdentifier,
} from "@rbx/core-scripts/legacy/header-scripts";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import {
  TAppsFlyerReferralProperties,
  TPlayabilityStatus,
  TPlayabilityStatusWithUnplayableError,
  type TPlayButtonPageContext,
} from "../types/playButtonTypes";

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
  if (!GameLauncher?.isJoinAttemptIdEnabled()) {
    return {};
  }

  const { joinAttemptOrigin } = eventProperties;
  let { joinAttemptId } = eventProperties;
  joinAttemptId =
    typeof joinAttemptId === "string" ? joinAttemptId : uuidService.generateRandomUuid();
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

  eventStreamService.sendEventWithTarget("playGameClicked", "click", mergedProperties);

  return mergedProperties;
}

function getEncodedUniversalLink(placeId: string, eventProperties: TEventProperties = {}): string {
  let universalLink = `${environmentUrls.websiteUrl}/games/start?placeid=${placeId}`;

  if (GameLauncher?.isJoinAttemptIdEnabled()) {
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
  const deviceMeta = DeviceMeta.getDeviceMeta();
  if (
    deviceMeta?.isIosDevice ||
    deviceMeta?.isAndroidDevice ||
    jsClientDeviceIdentifier.isIos13Ipad ||
    deviceMeta?.isChromeOs
  ) {
    const playGameClickedEventProperties = sendPlayGameClickedEvent(
      eventProperties,
      placeId,
      joinData,
      actionType,
    );

    const encodedUniversalLink = getEncodedUniversalLink(placeId, playGameClickedEventProperties);
    const afDeeplinkParams = urlService.composeQueryString({
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
  const deviceMeta = DeviceMeta.getDeviceMeta();
  if (
    deviceMeta?.isIosDevice ||
    deviceMeta?.isAndroidDevice ||
    jsClientDeviceIdentifier.isIos13Ipad ||
    deviceMeta?.isChromeOs
  ) {
    const playGameClickedEventProperties = sendPlayGameClickedEvent({}, placeId, {});
    const encodedUniversalLink = getEncodedUniversalLink(placeId, playGameClickedEventProperties);
    const afDeeplinkParams = urlService.composeQueryString({
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

export const startVerificationFlow = async (): Promise<[boolean, boolean]> => {
  try {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return window.Roblox.IdentityVerificationService.startVerificationFlow();
  } catch {
    return [false, false];
  }
};

export const startVoiceOptInOverlayFlow = async (
  requireExplicitVoiceConsent: boolean,
  useVoiceUpsellV2Design: boolean,
): Promise<boolean> => {
  try {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return window.Roblox.IdentityVerificationService.showVoiceOptInOverlay(
      requireExplicitVoiceConsent,
      useVoiceUpsellV2Design,
    );
  } catch {
    return false;
  }
};

export const startAvatarVideoOptInOverlayFlow = async (
  requireExplicitCameraConsent: boolean,
  useCameraU13Design: boolean,
): Promise<boolean> => {
  try {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/return-await
    return window.Roblox.IdentityVerificationService.showAvatarVideoOptInOverlay(
      requireExplicitCameraConsent,
      useCameraU13Design,
    );
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

    return (
      (await window.Roblox.AccessManagementUpsellV2Service?.startAccessManagementUpsell(params)) ??
      false
    );
  } catch (e) {
    const { fireEvent } = window.EventTracker ?? {};
    fireEvent?.(counterEvents.PlayButtonUpsellAgeRestrictionVerificationError);
    // re-throw the error to allow clients to handle their specific requirements
    // when an error happens
    throw e;
  }
};

export const handleShareLinkEventLogging = (placeId: string, universeId: string): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const shareLinkSourceType = window.Roblox.UrlParser?.getParameterValueByName(
      "shareLinkSourceType",
      false,
    );
    if (shareLinkSourceType?.toLowerCase() !== "experiencedetails") {
      return;
    }

    const { EventStream } = window.Roblox;
    EventStream?.SendEventWithTarget(
      "shareLinkGameJoin",
      "GamePlayButtonWeb",
      {
        placeId,
        universeId,
      },
      EventStream.TargetTypes.WWW,
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

  eventStreamService.sendEvent(
    {
      name: unlockPlayIntentConstants.eventName,
      type: unlockPlayIntentConstants.eventName,
      context: eventStreamService.eventTypes.formInteraction,
    },
    eventParams,
  );
};

export default {
  handleShareLinkEventLogging,
  launchGame,
  launchLogin,
  startVerificationFlow,
  startVoiceOptInOverlayFlow,
  startAgeCheckAccessManagementUpsellFlow,
  shouldShowUnplayableButton,
  sendUnlockPlayIntentEvent,
};
