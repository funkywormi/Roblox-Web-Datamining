import "../global";
import { uuidService } from "@rbx/core-legacy";
import { sendEventWithTarget, sendGamePlayEvent } from "../event-stream";

// TODO: this should not be part of core-scripts

export type JoinDataProperties = {
  launchData?: string;
  eventId?: string;
};

export type PlayGameProperties = {
  rootPlaceId?: string;
  placeId?: string;
  gameInstanceId?: string;
  playerId?: string;
  privateServerLinkCode?: string;
  referredByPlayerId?: string;
  joinData?: JoinDataProperties;
};

type EventStreamProperties = {
  eventName: string;
  ctx: string;
  gamePlayIntentEventCtx: string;
  properties: Record<string, string | number | undefined>;
};

const sendEventStream = (eventStreamProperties: EventStreamProperties) => {
  const { eventName } = eventStreamProperties;
  const { ctx } = eventStreamProperties;
  const additionalProperties = eventStreamProperties.properties;
  sendEventWithTarget(eventName, ctx, additionalProperties);
};

const sendGamePlayIntentEvent = (
  ctx: string,
  rootPlaceId: string,
  joinAttemptId?: string,
  actionType?: string,
) => {
  // @ts-expect-error TODO: old, migrated code
  sendGamePlayEvent(ctx, rootPlaceId, undefined, joinAttemptId, actionType);
};

export const buildPlayGameProperties = (
  rootPlaceId?: string,
  placeId?: string,
  gameInstanceId?: string,
  playerId?: string,
  privateServerLinkCode?: string,
  referredByPlayerId?: string,
  joinData?: JoinDataProperties,
): PlayGameProperties => ({
  rootPlaceId,
  placeId,
  gameInstanceId,
  playerId,
  privateServerLinkCode,
  referredByPlayerId,
  joinData,
});

const joinGame = (
  playGameProperties: PlayGameProperties,
  eventStreamProperties: EventStreamProperties,
  actionType?: string,
): PromiseLike<void> | void => {
  const { GameLauncher } = window.Roblox;
  if (GameLauncher) {
    const joinAttemptId = GameLauncher.isJoinAttemptIdEnabled()
      ? uuidService.generateRandomUuid()
      : undefined;
    const currentESProperties = eventStreamProperties;
    if (GameLauncher.isJoinAttemptIdEnabled()) {
      currentESProperties.properties.joinAttemptId = joinAttemptId;
    }

    if (actionType != null) {
      currentESProperties.properties.actionType = actionType;
    }

    const {
      rootPlaceId,
      placeId,
      gameInstanceId,
      playerId,
      joinData,
      privateServerLinkCode,
      referredByPlayerId,
    } = playGameProperties;

    if (placeId == null) {
      return;
    }

    if (placeId === rootPlaceId && gameInstanceId) {
      currentESProperties.properties.gameInstanceId = gameInstanceId;
      sendEventStream(currentESProperties);
      sendGamePlayIntentEvent(
        currentESProperties.gamePlayIntentEventCtx,
        rootPlaceId,
        joinAttemptId,
        actionType,
      );
      return GameLauncher.joinGameInstance(
        placeId,
        gameInstanceId,
        true,
        true,
        joinAttemptId,
        currentESProperties.gamePlayIntentEventCtx,
        referredByPlayerId,
      );
    } else if (rootPlaceId && playerId) {
      currentESProperties.properties.playerId = playerId;
      sendEventStream(currentESProperties);
      sendGamePlayIntentEvent(
        currentESProperties.gamePlayIntentEventCtx,
        rootPlaceId,
        joinAttemptId,
        actionType,
      );
      return GameLauncher.followPlayerIntoGame(
        playerId,
        joinAttemptId,
        currentESProperties.gamePlayIntentEventCtx,
      );
    } else if (privateServerLinkCode) {
      sendEventStream(currentESProperties);
      sendGamePlayIntentEvent(
        currentESProperties.gamePlayIntentEventCtx,
        placeId,
        joinAttemptId,
        actionType,
      );
      return GameLauncher.joinPrivateGame(
        placeId,
        // @ts-expect-error TODO: old, migrated code
        null,
        privateServerLinkCode,
        joinAttemptId,
        currentESProperties.gamePlayIntentEventCtx,
      );
    } else {
      sendEventStream(currentESProperties);
      sendGamePlayIntentEvent(
        currentESProperties.gamePlayIntentEventCtx,
        placeId,
        joinAttemptId,
        actionType,
      );
      return GameLauncher.joinMultiplayerGame(
        placeId,
        true,
        false,
        joinAttemptId,
        currentESProperties.gamePlayIntentEventCtx,
        joinData,
        referredByPlayerId,
      );
    }
  }
};

// Share links wait for the returned launch before redirecting to the game page, because the
// redirect cancels a launch that hasn't opened the client yet. Only the shared launcher
// (is-www-common-game-launcher-enabled) returns it. With the switch off this returns nothing, so
// the redirect happens right away, as before.
export const launchGame = (
  playGameProperties: PlayGameProperties,
  eventStreamProperties: EventStreamProperties,
  actionType?: string,
): PromiseLike<void> | void => {
  const launch = joinGame(playGameProperties, eventStreamProperties, actionType);
  return window.Roblox.GameLauncher?.isSharedGameLauncherEnabled?.() ? launch : undefined;
};
