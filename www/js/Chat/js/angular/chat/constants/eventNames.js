import chatModule from '../chatModule';

const eventNames = {
  chatLandingConversationClicked: 'chatLandingConversationClicked',
  conversationMessageSent: 'conversationMessageSent',
  webChatConversationsLoaded: 'webChatConversationsLoaded',
  webChatConversationRendered: 'webChatConversationRendered',
  webChatRendered: 'webChatRendered',
  webChatModalRendered: 'webChatModalRendered',
  webChatModalAction: 'webChatModalAction',
  webChatModalActionResult: 'webChatModalActionResult'
};

chatModule.constant('eventNames', eventNames);

export default eventNames;
