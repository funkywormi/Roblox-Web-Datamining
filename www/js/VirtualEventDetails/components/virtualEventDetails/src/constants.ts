import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";

// Most of these are strings which will be moved to transaltions in a subsequent PR
const translationConstants = {
  description: { translationKey: "DescriptionLabel", fallback: "Description" },
  eventCancelled: {
    translationKey: "EventCancelledText",
    fallback: "This event has been cancelled.",
  },
  joinEvent: { translationKey: "JoinEvent", fallback: "Join Event" },
  interested: { translationKey: "RsvpGoing", fallback: "Interested" },
  interestedTitle: { translationKey: "AttendanceBeforeEvent", fallback: "Interested" },
  attendingTitle: { translationKey: "AttendanceDuringEvent", fallback: "Attending Now" },
  interested_question: { translationKey: "RsvpNotGoing", fallback: "Interested?" },
  hostedBy: { translationKey: "HostedByLabel", fallback: "Hosted By" },
  goHome: { translationKey: "GoHome", fallback: "Go Home" },
  millionShorthandIdentifier: { translationKey: "millionShorthandIdentifier", fallback: "M" },
  billionShorthandIdentifier: { translationKey: "billionShorthandIdentifier", fallback: "B" },
  thousandShorthandIdentifier: { translationKey: "thousandShorthandIdentifier", fallback: "K" },
  ShareModalTitle: { translationKey: "ShareModalTitle", fallback: "Share This Event" },
  ShareModalLinkCopy: { translationKey: "ShareModalLinkCopy", fallback: "Copy" },
  NotifyMe: { translationKey: "NotifyMe", fallback: "Notify Me" },
  unfollowEvent: { translationKey: "UnfollowEvent", fallback: "Unfollow Event" },
  ShareModalBody: {
    translationKey: "ShareModalBody",
    fallback:
      "Copy the event link below to invite people to this event or share the event in chat.	",
  },
  eventModeratedTitle: { translationKey: "EventModeratedTitle", fallback: "[CONTENT MODERATED]" },
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

export default translationConstants;
