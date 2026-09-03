import { get, post } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

/**
 * Thin client for the Prompts Service API
 * (https://apis.${rootDomain}/modals-api/v1/prompts).
 *
 * Scope of this module:
 *   - Send the request and shape the response into a small domain object.
 *   - Tolerate failure modes that the orchestration layer treats as "no prompt"
 *     (HTTP 204, empty response, network errors).
 */

const PROMPTS_URL = `${environmentUrls.modalsApi}/v1/prompts`;
const IMPRESSION_URL = `${environmentUrls.modalsApi}/v1/prompts/impression`;

// Matches the C# enum name generated from `ENTRY_POINT_LOGOUT_INITIATED` in
// roblox/modals/modalseligibilityservice/v1beta1/modals_eligibility_service.proto.
// The controller normalizes via `Enum.TryParse<EntryPoint>(input, ignoreCase: true)`,
// so this string must match the enum member exactly (modulo case).
const LOGOUT_ENTRY_POINT = "LogoutInitiated";
const MODAL_PROMPT_STYLE = "Modal";

/**
 * A normalized representation of the prompt selected for the logout entry
 * point. The wire format is a JSON-serialized protobuf; the field of interest
 * here is `customPrompts`, a map keyed by prompt type whose values contain a
 * `translations` map that the dispatcher renders.
 */
export type LogoutPrompt = {
  /** Prompt type, e.g. "EmailV1". Equal to the customPrompts map key. */
  promptType: string;
  /**
   * Per-prompt translations resolved server-side for the current locale, keyed
   * by template variable name (e.g. `title`, `body`, `primaryButton`). The
   * exact keys are owned by the prompt config in the prompts service backend.
   */
  translations: Record<string, string>;
};

type RawCustomPrompt = {
  parameters?: Record<string, string>;
  translations?: Record<string, string>;
};

type RawPromptsResponse = {
  customPrompts?: Record<string, RawCustomPrompt>;
};

// Free-form capabilities the client advertises to prompts service.
export type ClientAttributes = Record<string, string>;

/**
 * Fetch the eligible prompt for the logout entry point.
 *
 * Returns `null` when there is no eligible prompt, the response is empty, or
 * the request fails for any reason. Callers should treat `null` as "no upsell
 * to show" — never throw.
 */
export const getLogoutPrompt = async (
  clientAttributes: ClientAttributes,
): Promise<LogoutPrompt | null> => {
  try {
    const response = await get<RawPromptsResponse>(
      { url: PROMPTS_URL, withCredentials: true },
      {
        entryPoint: LOGOUT_ENTRY_POINT,
        hasDetectedDeepLink: false,
        promptStyle: MODAL_PROMPT_STYLE,
        clientAttributes: JSON.stringify(clientAttributes),
      },
    );

    const customPrompts = response?.data?.customPrompts;
    if (!customPrompts) {
      return null;
    }

    const promptType = Object.keys(customPrompts)[0];
    if (!promptType) {
      return null;
    }
    const prompt = customPrompts[promptType];

    return {
      promptType,
      translations: prompt?.translations ?? {},
    };
  } catch {
    return null;
  }
};

/**
 * Best-effort impression report (fire-and-forget).
 */
export const recordLogoutPromptImpression = (promptType: string, promptId = ""): void => {
  post({ url: IMPRESSION_URL, withCredentials: true }, { promptType, promptId }).catch(() => {
    // ignore errors, fail open
  });
};
