import environmentUrls from "@rbx/environment-urls";
import { WASM_HASH_PARAM } from "@rbx/wasm-hash";
import type { JoinDataProperties } from "@rbx/core-scripts/game";
import { getJoindata, sendPlayOnWebClickEvents } from "./playButtonUtils";
import { firePlayOnWebClickCounter } from "./playOnWebTelemetryCounters";

export type TOpenPlayOnWebParams = {
  placeId: string;
  rootPlaceId?: string;
  universeId: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  eventProperties?: Record<string, string | number | undefined>;
  wasmJoinId?: string;
  // The page's join data, if it was read before the page removed it from the URL.
  joinData?: JoinDataProperties;
};

/**
 * Opens the place on the WASM web client in a new tab, with the page's join data and the user's
 * join id, and logs the Play on Web click.
 */
export const openPlayOnWeb = ({
  placeId,
  rootPlaceId,
  universeId,
  privateServerLinkCode,
  gameInstanceId,
  eventProperties,
  wasmJoinId,
  joinData = getJoindata(
    eventProperties?.launchData != null ? String(eventProperties.launchData) : undefined,
  ),
}: TOpenPlayOnWebParams): void => {
  firePlayOnWebClickCounter();
  const { joinAttemptId, joinAttemptOrigin } = sendPlayOnWebClickEvents(
    placeId,
    universeId,
    eventProperties,
    joinData,
  );

  const url = new URL(`${environmentUrls.playWebsite}/games/start?placeId=${placeId}`);

  if (joinData.launchData) {
    url.searchParams.set("launchData", joinData.launchData);
  }
  if (joinData.eventId) {
    url.searchParams.set("eventId", joinData.eventId);
  }
  // Matching workspace/packages/game-play-button/src/utils/gameLauncher.ts
  if (gameInstanceId && placeId === rootPlaceId) {
    url.searchParams.set("gameInstanceId", gameInstanceId);
  } else if (privateServerLinkCode) {
    url.searchParams.set("privateServerLinkCode", privateServerLinkCode);
  }
  if (joinAttemptId) {
    url.searchParams.set("joinAttemptId", joinAttemptId);
  }
  if (joinAttemptOrigin != null) {
    url.searchParams.set("joinAttemptOrigin", String(joinAttemptOrigin));
  }
  if (wasmJoinId) {
    url.searchParams.set(WASM_HASH_PARAM, wasmJoinId);
  }
  window.open(url.toString(), "_blank", "noopener");
};
