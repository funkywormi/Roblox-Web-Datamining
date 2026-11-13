import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { C3ChatMetadataPayload } from "../types/c3Chat";

const CREATE_CONVERSATION_URL = "/support/conversation";

// A stalled request would otherwise leave the send button disabled with no fallback.
const CREATE_CONVERSATION_TIMEOUT = 10000;

const CAPTCHA_ABANDONED = "Kind: abandoned; Type: captcha;";

export const isCaptchaAbandoned = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : "";
  return message.includes(CAPTCHA_ABANDONED);
};

const isChatMetadata = (value: unknown): value is C3ChatMetadataPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const payload = value as Partial<C3ChatMetadataPayload>;
  const interaction = payload.firstUserInteraction;
  return (
    typeof payload.conversationId === "string" &&
    payload.conversationId.length > 0 &&
    typeof payload.conversationAuthToken === "string" &&
    payload.conversationAuthToken.length > 0 &&
    typeof interaction === "object" &&
    interaction !== null &&
    typeof interaction.message === "string"
  );
};

/**
 * Starts a C3 conversation with the text the user sent. httpService runs the same captcha
 * challenge as POST /support. Closing the captcha rejects with an abandoned error.
 */
export const createNewSupportConversation = async (
  message: string,
): Promise<C3ChatMetadataPayload> => {
  const { data } = await httpService.post<C3ChatMetadataPayload>(
    {
      url: CREATE_CONVERSATION_URL,
      withCredentials: true,
      retryable: false,
      timeout: CREATE_CONVERSATION_TIMEOUT,
    },
    { message },
  );
  if (!isChatMetadata(data)) {
    throw new Error("Conversation was not created");
  }
  return data;
};
