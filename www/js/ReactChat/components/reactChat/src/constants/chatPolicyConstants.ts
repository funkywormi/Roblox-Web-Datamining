export const CHAT_PENDING_STATUS = {
  invalid: "invalid",
  pending: "pending",
  not_pending: "not_pending",
} as const;

export type TChatPendingStatus = (typeof CHAT_PENDING_STATUS)[keyof typeof CHAT_PENDING_STATUS];

export const CHAT_MODERATION_TYPE = {
  trusted_comms: "trusted_comms",
  moderated: "moderated",
  invalid: "invalid",
  unknown_type: "unknown_type",
} as const;

export type TChatModerationType = (typeof CHAT_MODERATION_TYPE)[keyof typeof CHAT_MODERATION_TYPE];

export const CHAT_CONVERSATION_SOURCE = {
  channels: "channels",
  friends: "friends",
} as const;

export type TChatConversationSource =
  (typeof CHAT_CONVERSATION_SOURCE)[keyof typeof CHAT_CONVERSATION_SOURCE];

export const CHAT_OSA_ACK_STATUS = {
  acknowledged: "acknowledged",
  unacknowledged: "unacknowledged",
  not_applicable: "not_applicable",
} as const;

export const CHAT_USER_MESSAGE_OPT_IN_STATUS = {
  opted_in: "opted_in",
  not_opted_in: "not_opted_in",
  not_applicable: "not_applicable",
} as const;
