export enum C3ChatMessageType {
  Message = "message",
  EndConversation = "end_conversation",
}
/** The answer to a control on a bot message, sent with the user message that shows it. */
export type C3ContentResponse = { id: string; value: string };

export type C3Interaction = {
  message: string;
  ordinal: number;
  id: string;
  type: C3ChatMessageType;
  /** Items to show instead of `message` on a bot message. Unchecked, as the server sent them. */
  content?: readonly unknown[];
  response?: C3ContentResponse;
};

export type C3ChatMessage = C3Interaction & {
  isUser: boolean;
};

export type C3GetChatMessagesResponse = C3Interaction[];

export type C3FeedbackRating = 1 | 2 | 3 | 4 | 5;

export type C3ConversationUpdate = {
  feedbackRating?: C3FeedbackRating;
};

export type C3ChatMetadataPayload = {
  firstUserInteraction: C3Interaction;
  conversationId: string;
  conversationAuthToken: string;
};
