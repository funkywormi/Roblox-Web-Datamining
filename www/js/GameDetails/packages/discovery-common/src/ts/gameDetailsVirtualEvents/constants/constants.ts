import { TranslateFunction } from "@rbx/core-scripts/react";

// Most of these are strings which will be moved to transaltions in a subsequent PR
const translationConstants = {
  eventsTitle: { translationKey: "EventsListTitle", fallback: "Events" },
  seeMore: { translationKey: "SeeMore", fallback: "See More" },

  joinEvent: { translationKey: "JoinEvent", fallback: "Join Event" },
  unfollowEvent: { translationKey: "UnfollowEvent", fallback: "Unfollow Event" },
  NotifyMe: { translationKey: "NotifyMe", fallback: "Notify Me" },
  networkError: {
    translationKey: "NetworkError",
    fallback: "Something went wrong. Please try again later",
  },

  happeningNow: { translationKey: "Label.HappeningNow", fallback: "Happening now" },
  reminderSetForEventTime: {
    translationKey: "Label.ReminderSetForEventTime",
    fallback: "Reminder for event is set.",
  },
} as const;

export const getTranslationStringForKeyWithFallback = (
  translate: TranslateFunction,
  key: keyof typeof translationConstants,
  optionalArgs?: any,
): string => {
  return (
    translate(translationConstants[key].translationKey, optionalArgs) ||
    translationConstants[key].fallback
  );
};

export const EVENT_LIVENESS_STATE = {
  UPCOMING: "UPCOMING",
  LIVE: "LIVE",
  PAST: "PAST",
};

export const eventCategoryTranslationKeys = {
  newContent: "Label.NewContent",
  itemDrop: "Label.ItemDrop",
  newSeason: "Label.NewSeason",
  newLocation: "Label.NewLocation",
  newMap: "Label.NewMap",
  moreLevels: "Label.MoreLevels",
  newFeature: "Label.NewFeature",
  earlyAccess: "Label.EarlyAccess",
  expansion: "Label.Expansion",
  challenge: "Label.Challenge",
  quest: "Label.Quest",
  festival: "Label.Festival",
};

export const counterConstants = {
  prefix: "ExperienceEventsWeb_",
  joinFailed: "JoinFailed",
};

export type TEventCategoryLabel = keyof typeof eventCategoryTranslationKeys;

export const eventTileImpressionVisibilityThreshold = 0.5;

export default translationConstants;
