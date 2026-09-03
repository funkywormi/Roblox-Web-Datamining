export enum C3ChatMessageType {
  Message = "message",
  EndConversation = "end_conversation",
}
export type C3Interaction = {
  message: string;
  ordinal: number;
  id: string;
  type: C3ChatMessageType;
};

export type C3ChatMessage = C3Interaction & {
  isUser: boolean;
};

export type C3GetChatMessagesResponse = C3Interaction[];

export type C3ChatMetadataPayload = {
  firstUserInteraction: C3Interaction;
  conversationId: string;
  conversationAuthToken: string;
};
