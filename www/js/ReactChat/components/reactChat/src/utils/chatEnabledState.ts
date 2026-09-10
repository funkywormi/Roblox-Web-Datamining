import type { TGetChatMetadataResponse } from "../types/api";

/** Why chat is disabled, highest-priority first (region > privacy > unknown), matching legacy. */
export type TChatDisabledReason = "region" | "privacy" | "unknown";

// Reason chat is disabled, from /v1/metadata (region > privacy > unknown, matching legacy). Null
// when enabled. Fail-open: a field disables chat only when explicitly "disabled"/false, so missing
// or not-yet-loaded metadata reads as enabled.
export function getChatDisabledReason(
  metadata: TGetChatMetadataResponse | undefined,
): TChatDisabledReason | null {
  if (!metadata) {
    return null;
  }
  if (metadata.isChatEnabledByGlobalRules === "disabled") {
    return "region";
  }
  if (metadata.isChatEnabledByPrivacySetting === "disabled") {
    return "privacy";
  }
  if (metadata.isChatEnabled === false) {
    return "unknown";
  }
  return null;
}
