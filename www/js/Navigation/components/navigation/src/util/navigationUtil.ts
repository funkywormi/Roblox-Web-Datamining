import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import realtime from "@rbx/core-scripts/realtime";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import layoutConstants from "../constants/layoutConstants";
import links, { UniversalSearchLink } from "../constants/linkConstants";

const { newUniversalSearchUrls, avatarSearchLink } = links;

const isGuest = authenticatedUser() == null;

const getAccountNotificationCount = () =>
  // The last item that contributes to the setting notification counter was removed, but leaving this util in here for
  // now in case we want to add a new counter in the future.
  Promise.resolve(0);
const sendClickEvent = (eventName: string) => {
  sendEventWithTarget(eventName, "click", {}, targetTypes.WWW);
};

const subscribeToFriendsNotifications = (handleFriendsEvent: () => void) => {
  if (isGuest) {
    return () => {
      // do nothing
    };
  }
  document.addEventListener(layoutConstants.friendEvents.requestCountChanged, handleFriendsEvent);
  const realTimeClient = realtime.GetClient();
  realTimeClient.Subscribe(
    layoutConstants.friendEvents.friendshipNotifications,
    handleFriendsEvent,
  );
  return () => {
    document.removeEventListener(
      layoutConstants.friendEvents.requestCountChanged,
      handleFriendsEvent,
    );
    realTimeClient.Unsubscribe(
      layoutConstants.friendEvents.friendshipNotifications,
      handleFriendsEvent,
    );
  };
};

const subscribeToMessagesNotifications = (handleMessagesEvent: () => void) => {
  if (isGuest) {
    return () => {
      // do nothing
    };
  }
  document.addEventListener(layoutConstants.messagesCountChangeEvent.name, handleMessagesEvent);
  return () => {
    document.removeEventListener(
      layoutConstants.messagesCountChangeEvent.name,
      handleMessagesEvent,
    );
  };
};

const isInMobileSize = () => window.innerWidth < 543; // breakpoint for mobile size

const getNewUniversalSearchLinks = (): UniversalSearchLink[] => {
  const urls = [...newUniversalSearchUrls];
  const relevantUrls = urls.filter(({ pageSort }) =>
    pageSort.some(keyword => window.location.pathname.includes(keyword)),
  );
  const unRelevantUrls = urls.filter(({ pageSort }) =>
    pageSort.every(keyword => !window.location.pathname.includes(keyword)),
  );
  return [...relevantUrls, ...unRelevantUrls];
};

const getAvatarAutocompleteSearchLinks = () =>
  avatarSearchLink.pageSort.some(keyword => window.location.pathname.includes(keyword));

export {
  getAccountNotificationCount,
  sendClickEvent,
  subscribeToFriendsNotifications,
  subscribeToMessagesNotifications,
  isInMobileSize,
  getNewUniversalSearchLinks,
  getAvatarAutocompleteSearchLinks,
};
