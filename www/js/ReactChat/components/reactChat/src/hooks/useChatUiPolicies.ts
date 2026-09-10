import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { getCurrentUserId } from "../utils/currentUser";

// Chat UI policy flags come from the "chat-ui" GUAC behaviour. expandedChatEnabled is a plain
// boolean; useChatTimeouts and useOneToOneOsaContextCards are percentage rollouts keyed on the
// current user id.
const CHAT_UI_GUAC_BEHAVIOUR = "chat-ui";

type TChatUiPolicy = {
  isWebChatTcEnabled?: boolean;
  useChatTimeouts?: number;
  expandedChatEnabled?: boolean;
  useOneToOneOsaContextCards?: number;
  isWebChatAutotranslationEnabled?: boolean;
  useDurableReplayGapRefetch?: boolean;
};

export type TChatUiPolicies = {
  /** Trusted Connections web-chat experience (incl. the contact-card FTUX). */
  isWebChatTcEnabled: boolean;
  /** This user is in the moderation-timeout rollout; gates all timeout UI. */
  useChatTimeouts: boolean;
  /** Expanded chat (U13 opt-in) is enabled; gates the opt-in consent modal. */
  expandedChatEnabled: boolean;
  /** This user is in the 1:1 OSA inline-context-card rollout. */
  useOneToOneOsaContextCards: boolean;
  /** Message auto-translation is enabled; gates rendering the server-provided translated
   * `content_to_display` below the muted original. */
  isWebChatAutotranslationEnabled: boolean;
  /** Subscribe to durable-replay gap events and refetch chat data on irrecoverable buffer gaps. */
  useDurableReplayGapRefetch: boolean;
};

const isChatUiPolicy = (value: unknown): value is TChatUiPolicy =>
  typeof value === "object" && value !== null;

/**
 * Reads the "chat-ui" GUAC behaviour once and resolves each policy flag to a boolean. The
 * `useChatTimeouts` and `useOneToOneOsaContextCards` percentages are resolved here (not returned
 * raw) via `userId % 100 <= threshold`, computed a single time at init.
 */
export const useChatUiPolicies = (): TChatUiPolicies => {
  const { data } = useQuery({
    queryKey: [`guac/${CHAT_UI_GUAC_BEHAVIOUR}`],
    queryFn: () => callBehaviour<unknown>(CHAT_UI_GUAC_BEHAVIOUR),
    staleTime: Infinity,
  });

  const policy = isChatUiPolicy(data) ? data : {};
  const userId = getCurrentUserId();
  const timeoutRolloutThreshold = policy.useChatTimeouts ?? 0;
  const osaRolloutThreshold = policy.useOneToOneOsaContextCards ?? 0;

  return {
    isWebChatTcEnabled: policy.isWebChatTcEnabled === true,
    useChatTimeouts: userId != null && userId % 100 <= timeoutRolloutThreshold,
    expandedChatEnabled: policy.expandedChatEnabled === true,
    useOneToOneOsaContextCards: userId != null && userId % 100 <= osaRolloutThreshold,
    isWebChatAutotranslationEnabled: policy.isWebChatAutotranslationEnabled === true,
    useDurableReplayGapRefetch: policy.useDurableReplayGapRefetch === true,
  };
};

export default useChatUiPolicies;
