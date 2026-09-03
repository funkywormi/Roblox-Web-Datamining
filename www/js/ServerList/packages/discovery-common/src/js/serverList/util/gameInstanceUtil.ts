import {
  jsClientDeviceIdentifier,
  authenticatedUser,
} from "@rbx/core-scripts/legacy/header-scripts";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { getUrlWithQueries } from "@rbx/core-scripts/util/url";

import attributionUtils, { AttributionType } from "../../../ts/common/utils/attributionUtils";
import trackerClient, {
  PrivateServerEventContext,
  PrivateServerEventType,
} from "../analytics/privateServerLogging";
import serverListConstants from "../constants/serverListConstants";

const { isIE11 } = jsClientDeviceIdentifier;
const { serverListTypes } = serverListConstants;

const deviceMeta = getDeviceMeta();
const deviceType = deviceMeta?.deviceType;
const isUWPApp = deviceMeta?.isUWPApp ?? false;
const isInApp = deviceMeta?.isInApp ?? false;
const isChromeOs = deviceMeta?.isChromeOs ?? false;

export const getPlaceIdFromUrl = (): number | null => {
  const reg = /\/games\/(\d+)\//g;
  const match = reg.exec(window.location.pathname);
  return match?.[1] ? +match[1] : null;
};

export const shouldUseGameLaunchInterface = () => {
  return (
    (deviceType === "computer" && !isUWPApp && !isChromeOs) ||
    (deviceType === "tablet" && isIE11) ||
    isUWPApp
  );
};

export const getJoinScript = (
  placeId: number,
  { instanceId, accessCode }: { instanceId: string | null; accessCode: string },
  serverListType: string,
  players: Array<{ id: number | null; playerToken: string }>,
  ownedByPlayer: boolean,
  universeId: number,
): (() => void) => {
  const startTime = performance.now();
  window.EventTracker?.start(PrivateServerEventType.PRIVATE_SERVER_JOIN);
  const joinAttemptId = window.Roblox.GameLauncher?.isJoinAttemptIdEnabled()
    ? uuidService.generateRandomUuid()
    : undefined;
  const gamePlayIntentContext = `${serverListType}ServerListJoin`;
  const commonEventParams = {
    universeId,
    placeId,
    pid: placeId, // We send both placeId and pid since different tables might process either field
    joinAttemptId,
  };

  const sendPlayGameClickedEvent = () => {
    const privateServerParams =
      serverListType === serverListTypes.Vip.key
        ? { isPrivateServerJoin: true, isServerOwnedByPlayer: ownedByPlayer }
        : {};
    const properties = {
      attributionId: attributionUtils.getAttributionId(AttributionType.GameDetailReferral),
      ...commonEventParams,
      ...privateServerParams,
    };
    sendEventWithTarget("playGameClicked", gamePlayIntentContext, properties, targetTypes.WWW);
  };

  if (shouldUseGameLaunchInterface()) {
    return () => {
      sendPlayGameClickedEvent();
      sendEventWithTarget(
        "gamePlayIntent",
        gamePlayIntentContext,
        {
          lType: "protocol",
          // EventStream only allows string | number | boolean | undefined (not null).
          refuid: undefined,
          pg: "gameDetail",
          ...commonEventParams,
        },
        targetTypes.WWW,
      );

      if (serverListType === serverListTypes.friend.key) {
        trackerClient.sendEvent(
          PrivateServerEventType.PRIVATE_SERVER_JOIN,
          PrivateServerEventContext.GAME_TAB,
          String(performance.now() - startTime),
        );
        window.EventTracker?.endSuccess(PrivateServerEventType.PRIVATE_SERVER_JOIN);
        const friendPlayer = players.find(
          player => player.id !== null && player.id !== authenticatedUser.id,
        );
        if (!friendPlayer?.id) {
          return;
        }
        window.Roblox.GameLauncher?.followPlayerIntoGame(
          friendPlayer.id,
          joinAttemptId,
          gamePlayIntentContext,
        );
        return;
      }

      // accessCode must be checked first in the case of joining a live private server instance
      if (accessCode) {
        trackerClient.sendEvent(
          PrivateServerEventType.PRIVATE_SERVER_JOIN,
          PrivateServerEventContext.GAME_TAB,
          String(performance.now() - startTime),
        );
        window.EventTracker?.endSuccess(PrivateServerEventType.PRIVATE_SERVER_JOIN);
        window.Roblox.GameLauncher?.joinPrivateGame(
          placeId,
          accessCode,
          "",
          joinAttemptId,
          window.Roblox.GameLauncher?.isJoinAttemptIdEnabled() ? gamePlayIntentContext : undefined,
        );
        return;
      }

      if (instanceId) {
        trackerClient.sendEvent(
          PrivateServerEventType.PRIVATE_SERVER_JOIN,
          PrivateServerEventContext.GAME_TAB,
          String(performance.now() - startTime),
        );
        window.EventTracker?.endSuccess(PrivateServerEventType.PRIVATE_SERVER_JOIN);
        window.Roblox.GameLauncher?.joinGameInstance(
          placeId,
          instanceId,
          false,
          false,
          joinAttemptId,
          window.Roblox.GameLauncher?.isJoinAttemptIdEnabled() ? gamePlayIntentContext : undefined,
        );
      }
    };
  }
  let url = "";
  if (isInApp) {
    url = getUrlWithQueries("/games/start", { placeId });
  } else {
    url = `robloxmobile://placeID=${placeId}`;
  }
  if (instanceId) {
    url += `&gameInstanceId=${instanceId}`;
  }

  if (accessCode) {
    url += `&accessCode=${accessCode}`;
  }

  if (window.Roblox.GameLauncher?.isJoinAttemptIdEnabled() && joinAttemptId) {
    url += `&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=${gamePlayIntentContext}`;
  }

  return () => {
    sendPlayGameClickedEvent();
    window.location.href = url;
  };
};

export const canCreatePrivateGameServer = (
  servers: Array<{ owner: { id: number } }>,
  privateServerLimit: number,
) => {
  let serverLimit = privateServerLimit;
  servers.forEach(({ owner }: { owner: { id: number } }) => {
    if (owner.id === authenticatedUser.id) {
      serverLimit -= 1;
    }
  });
  return serverLimit > 0;
};
