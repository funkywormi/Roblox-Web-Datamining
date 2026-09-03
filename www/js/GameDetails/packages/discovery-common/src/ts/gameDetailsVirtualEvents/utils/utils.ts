import Intl from "@rbx/core-scripts/intl";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { launchGame } from "@rbx/game-play-button";
import { getGameLaunchEventStreamProperties } from "./analytics";
import { EVENT_LIVENESS_STATE } from "../constants/constants";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

// TODO https://jira.rbx.com/browse/EN-1853 Change this to just take in an event object instead of two dates
export const getEventLivenessState = (startTimeUtc: number, endTimeUtc: number): string => {
  if (startTimeUtc > Date.now()) {
    return EVENT_LIVENESS_STATE.UPCOMING;
  }
  if (endTimeUtc < Date.now()) {
    return EVENT_LIVENESS_STATE.PAST;
  }

  return EVENT_LIVENESS_STATE.LIVE;
};

export const tryParseDate = (utcTimestamp: number | string): number => {
  return utcTimestamp ? new Date(utcTimestamp).getTime() : new Date(0).getTime();
};

export const generateSessionId = (): string => {
  return uuidService.generateRandomUuid();
};

export const joinExperience = (
  rootPlaceId: number,
  sessionId: string,
  eventId: string,
  universeId: number,
  attributionId: string,
  referralSessionInfo: TDiscoverySessionInfo,
  referralPage: PageContext | undefined,
): void => {
  // TODO may need to copy more playability checking logic from: https://github.rbx.com/Roblox/web-frontend/blob/5a610056e0fb17c7491cc1380a3b3dc2d7b9b8fb/WebApps/Roblox.GameLaunch.WebApp/Roblox.GameLaunch.WebApp/ts/react/playButton/components/PlayButton.tsx
  // or just import that component, but modified so we can change the label text
  if (!rootPlaceId) {
    throw new Error("missing root placeId");
  }
  launchGame(
    rootPlaceId.toString(), // placeId
    rootPlaceId.toString(), // RootPlaceId
    "", // privateServerLinkCode
    undefined, // gameInstanceId
    getGameLaunchEventStreamProperties(
      sessionId,
      universeId,
      attributionId,
      referralSessionInfo,
      referralPage,
    ), // eventProperties
    { eventId }, // joinDataProperties
  );
};

export const getLocalizedDateString = (dateTimeUtc: number): string => {
  const dateOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  } as const;

  const intl = new Intl();
  const { locale } = intl;

  return new Date(dateTimeUtc).toLocaleString(locale, dateOptions);
};
export default {};
