import "../global";
import {
  createDeepLinkNavigator,
  ItemType,
  parseDeepLink,
  ShareLinks,
  ShareLinksType,
  type StudioLinkData,
} from "@rbx/www-common/deep-link";
import { getGameLauncher } from "@rbx/www-common/game-launch";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { launchGame } from "../game";
import { startDesktopAndMobileWebChat } from "../util/chat";
import { sendEventWithTarget } from "../event-stream";
import { getQueryParam, getHelpDeskUrl } from "../util/url";
import getPlaceIdFromUniverseId from "./getPlaceIdFromUniverseId";
import getUniverseIdFromPlaceId from "./getUniverseIdFromPlaceId";
import { resolveShareLinks, resolveShareLinksV2 } from "./resolveShareLinks";

const { Hybrid } = window.Roblox;
const fireEvent = window.EventTracker?.fireEvent;

const launchStudio = ({
  placeId,
  universeId,
  startTeamTest,
  instanceId,
  annotationId,
}: StudioLinkData): void => {
  const { GameLauncher } = window.Roblox;
  if (GameLauncher && placeId && universeId) {
    // checking of whether or not Team Create is actually enabled should be done in Studio if needed
    // this is done to be consistent with how Studio share link errors should show up in Studio if possible
    GameLauncher.editGameInStudio(
      placeId,
      universeId,
      true, // allowUpload
      true, // isTeamCreateEnabled
      false, // enableTeamCreatePreemptiveStart
      startTeamTest,
      instanceId,
      annotationId,
    );
  }
};

const { navigateToDeepLink } = createDeepLinkNavigator({
  getDeviceMeta: () => getDeviceMeta(),
  navigateToHybridFeature: Hybrid
    ? feature => {
        Hybrid.Navigation?.navigateToFeature(feature, () => true);
      }
    : undefined,
  sendEvent: (type, context, params) => {
    sendEventWithTarget(type, context, params);
  },
  fireCounter: name => {
    fireEvent?.(name);
  },
  resolveShareLinks: (linkId, linkType) => resolveShareLinks(linkId, linkType),
  resolveShareLinksV2: linkId => resolveShareLinksV2(linkId),
  getPlaceIdFromUniverseId: universeId => getPlaceIdFromUniverseId(universeId),
  getUniverseIdFromPlaceId: placeId => getUniverseIdFromPlaceId(placeId),
  launchGame: (properties, event) => {
    launchGame(properties, event);
  },
  joinMultiplayerGame: placeId => {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.Roblox.GameLauncher!.joinMultiplayerGame(placeId, true, false);
  },
  startGameWithDeepLinkUrl: (deepLinkUrl, placeId) => {
    const launcher = getGameLauncher();
    if (launcher) {
      launcher.startGameWithDeepLinkUrl(deepLinkUrl, placeId);
      return;
    }
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.Roblox.ProtocolHandlerClientInterface!.startGameWithDeepLinkUrl(deepLinkUrl, placeId);
  },
  startDeepLinkFlow: deepLinkUrl => {
    const launcher = getGameLauncher();
    if (launcher) {
      launcher.startDeepLinkFlow(deepLinkUrl);
      return true;
    }
    if (window.Roblox.ProtocolHandlerClientInterface?.startDeepLinkFlow) {
      window.Roblox.ProtocolHandlerClientInterface.startDeepLinkFlow(deepLinkUrl);
      return true;
    }
    return false;
  },
  openStudio: data => {
    // Check if ShareLinks WebApp has registered a custom handler for Studio links
    const { studioLinkHandler } = window.Roblox;
    if (studioLinkHandler && typeof studioLinkHandler === "function") {
      studioLinkHandler(data);
      return;
    }
    launchStudio(data);
  },
  startAccessManagementUpsell: params =>
    window.Roblox.AccessManagementUpsellV2Service?.startAccessManagementUpsell(params) ?? null,
  startChat: userId => {
    startDesktopAndMobileWebChat({ userId });
  },
  getQueryParam: name => getQueryParam(name),
  getHelpDeskUrl: (locale, articleId) => getHelpDeskUrl(locale, articleId),
});

export { parseDeepLink, navigateToDeepLink, ShareLinksType, ShareLinks, ItemType };
