import { CHAT_MODAL_VARIANT } from "../constants/chatModalConstants";
import type { TChatConversation } from "../types/chat";

export type TConsentVariant =
  | typeof CHAT_MODAL_VARIANT.chat_opt_in_info_card
  | typeof CHAT_MODAL_VARIANT.osa_context_card;

/**
 * Which blocking consent modal (if any) a conversation must show before it can be used. The U13
 * opt-in card takes precedence over the group-OSA card. Returns null when the conversation is not
 * consent-blocked.
 *
 * - U13 opt-in (`chat_opt_in_info_card`): `expandedChatEnabled && not_opted_in` — 1:1 or group.
 * - UK-OSA group (`osa_context_card`): OSA unacknowledged && group.
 *
 * The 1:1 UK-OSA case is the non-blocking inline card (see useOsaInlineCard), not handled here.
 */
export const resolveConsentVariant = (
  conversation: Pick<TChatConversation, "isChatOptInBlocked" | "isGroupOsaUnacknowledged">,
  expandedChatEnabled: boolean,
): TConsentVariant | null => {
  if (expandedChatEnabled && conversation.isChatOptInBlocked === true) {
    return CHAT_MODAL_VARIANT.chat_opt_in_info_card;
  }
  if (conversation.isGroupOsaUnacknowledged === true) {
    return CHAT_MODAL_VARIANT.osa_context_card;
  }
  return null;
};
