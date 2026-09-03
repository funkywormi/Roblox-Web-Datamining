import { Intl } from "@rbx/core-scripts/legacy/Roblox";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import "@rbx/core-scripts/global";
import { launchGame } from "@rbx/game-play-button";
import { getGameLaunchEventStreamProperties } from "./analytics";
import { EVENT_LIVENESS_STATE, getTranslationStringForKeyWithFallback } from "./constants";

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

export const getShortenedNumber = (number: number, translate: TranslateFunction): string => {
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;
  const shortenToTarget = (target: number): string => {
    // parsing to float to remove trailing 0s
    return Number.parseFloat((number / target).toFixed(1)).toString();
  };

  if (number >= billion) {
    return `${shortenToTarget(billion)}${getTranslationStringForKeyWithFallback(
      translate,
      "billionShorthandIdentifier",
    )}`;
  }
  if (number >= million) {
    return `${shortenToTarget(million)}${getTranslationStringForKeyWithFallback(
      translate,
      "millionShorthandIdentifier",
    )}`;
  }
  if (number >= thousand) {
    return `${shortenToTarget(thousand)}${getTranslationStringForKeyWithFallback(
      translate,
      "thousandShorthandIdentifier",
    )}`;
  }

  return number.toString();
};

export const generateSessionId = (): string => {
  return uuidService.generateRandomUuid();
};

export const joinExperience = (rootPlaceId: number, sessionId: string, eventId: string): void => {
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
    getGameLaunchEventStreamProperties(sessionId), // eventProperties
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
