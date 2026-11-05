import { launchGame as launchLegacyGame, type PlayGameProperties } from "@rbx/core-scripts/game";
import { generateRandomUuid } from "@rbx/core-lib/uuid";
import { sendEventWithTarget, sendGamePlayEvent } from "@rbx/core-scripts/event-stream";
import { getGameLauncher, withJoinAttemptId, type GameLauncher } from "@rbx/www-common/game-launch";

type EventStreamProperties = Parameters<typeof launchLegacyGame>[1];

// The Next.js host (NavLayout) registers the shared launcher; .NET pages use window.Roblox.GameLauncher.
// The shared launcher always sends join attempt ids, like .NET's protocol handler.
export const isJoinAttemptIdEnabled = (): boolean =>
  getGameLauncher() != null ||
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- window.Roblox is absent on Next.js
  (window.Roblox?.GameLauncher?.isJoinAttemptIdEnabled() ?? false);

// Same events and launcher calls as @rbx/core-scripts/game launchGame with join attempt ids on.
// As on .NET, guests are stopped after the events: the launcher's host shows the sign-up dialog.
const launchSharedGame = (
  launcher: GameLauncher,
  playGameProperties: PlayGameProperties,
  { eventName, ctx, gamePlayIntentEventCtx, properties }: EventStreamProperties,
  actionType?: string,
): Promise<void> | undefined => {
  const {
    rootPlaceId,
    placeId,
    gameInstanceId,
    playerId,
    joinData,
    privateServerLinkCode,
    referredByPlayerId,
    isEarlyTesting,
  } = playGameProperties;
  if (placeId == null) {
    return undefined;
  }

  const joinAttemptId = generateRandomUuid();
  const withJoinAttempt = <T extends Parameters<typeof withJoinAttemptId>[0]>(params: T) =>
    withJoinAttemptId(params, joinAttemptId, gamePlayIntentEventCtx);
  const sendEvents = (intentPlaceId: string, extraProperties: Record<string, string> = {}) => {
    sendEventWithTarget(eventName, ctx, {
      ...properties,
      joinAttemptId,
      ...extraProperties,
      ...(actionType == null ? {} : { actionType }),
    });
    // @ts-expect-error referrerId is optional, as in @rbx/core-scripts/game
    sendGamePlayEvent(gamePlayIntentEventCtx, intentPlaceId, undefined, joinAttemptId, actionType);
  };

  if (placeId === rootPlaceId && gameInstanceId) {
    sendEvents(rootPlaceId, { gameInstanceId });
    return launcher.joinGameInstance(
      withJoinAttempt({
        placeId,
        gameId: gameInstanceId,
        isPlayTogetherGame: true,
        referredByPlayerId,
      }),
    );
  }
  if (rootPlaceId && playerId) {
    sendEvents(rootPlaceId, { playerId });
    return launcher.followPlayerIntoGame(withJoinAttempt({ userId: playerId }));
  }
  if (privateServerLinkCode) {
    sendEvents(placeId);
    return launcher.joinPrivateGame(withJoinAttempt({ placeId, linkCode: privateServerLinkCode }));
  }
  sendEvents(placeId);
  return launcher.joinMultiplayerGame(
    withJoinAttempt({
      placeId,
      isPlayTogetherGame: false,
      launchData: joinData?.launchData,
      eventId: joinData?.eventId,
      referredByPlayerId,
      isEarlyTesting: isEarlyTesting === true ? "true" : undefined,
    }),
  );
};

export const launchPlayGame = (
  playGameProperties: PlayGameProperties,
  eventStreamProperties: EventStreamProperties,
  actionType?: string,
): void => {
  const launcher = getGameLauncher();
  if (launcher == null) {
    launchLegacyGame(playGameProperties, eventStreamProperties, actionType);
    return;
  }
  // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation -- imperative launch; failures reach the host's onLaunchFailed
  void launchSharedGame(launcher, playGameProperties, eventStreamProperties, actionType);
};
