import { EventStream } from 'Roblox';

const EVENT_NAME = 'friendRecommendations';
const CTX = {
  ACCEPTED_FRIEND_REQUEST: 'accept',
  SENT_FRIEND_REQUEST: 'request',
  CAROUSEL_DISPLAYED: 'displayed'
};

function emitCarouselDisplayedEvent(userId, variant, numberOfRecommendations) {
  EventStream.SendEvent(EVENT_NAME, CTX.CAROUSEL_DISPLAYED, {
    uid: userId,
    numberOfRecommendations,
    variant
  });
}

function emitFriendRequestSentEvent(userId, recipientId) {
  EventStream.SendEvent(EVENT_NAME, CTX.SENT_FRIEND_REQUEST, {
    uid: userId,
    recipientId
  });
}

function emitAcceptedFriendRequestEvent(userId, senderId) {
  EventStream.SendEvent(EVENT_NAME, CTX.ACCEPTED_FRIEND_REQUEST, {
    uid: userId,
    recipientId: senderId
  });
}

export default {
  emitCarouselDisplayedEvent,
  emitAcceptedFriendRequestEvent,
  emitFriendRequestSentEvent
};
