// Modal-sequence constants for the chat conversation-overlay FTUX flow. Mirrors the
// legacy AngularJS chat (dialogAttributesService.js) verbatim so the React chat hits
// the same /v2/get-modal-sequence + /v1/record-modal-sequence-response contract.

export const CHAT_MODAL_SEQUENCE = {
  conversation_inline_top_modal: "conversation_inline_top_modal",
  conversation_overlay: "conversation_overlay",
  conversation_list_overlay: "conversation_list_overlay",
} as const;

export type TChatModalSequence = (typeof CHAT_MODAL_SEQUENCE)[keyof typeof CHAT_MODAL_SEQUENCE];

export const CHAT_MODAL_VARIANT = {
  osa_context_card: "osa_context_card",
  chat_opt_in_info_card: "chat_opt_in_info_card",
  trusted_connection_upsell_o18: "conversation_trusted_connection_upsell18_plus",
  trusted_connection_upsell_u18: "conversation_trusted_connection_upsell_non18_plus",
  trusted_connection_created: "conversation_trusted_connection_created",
} as const;

export type TChatModalVariant = (typeof CHAT_MODAL_VARIANT)[keyof typeof CHAT_MODAL_VARIANT];

export const CHAT_MODAL_ACTION_TYPE = {
  record_has_seen: "record_has_seen",
  record_dont_show_again: "record_dont_show_again",
  record_has_accepted: "record_has_accepted",
} as const;

export type TChatModalActionType =
  (typeof CHAT_MODAL_ACTION_TYPE)[keyof typeof CHAT_MODAL_ACTION_TYPE];

/** Numeric friend-request origin codes from the profile-insights API. */
export const FRIENDSHIP_ORIGIN_TYPE = {
  qr_code: 6,
  phone_contact_importer: 8,
} as const;
