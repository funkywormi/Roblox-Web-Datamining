import { ContentType } from "@rbx/moderation-portal";
import {
  isAssetContent,
  isAvatarContent,
  isBundleContent,
  isChatContent,
  isLookContent,
  isPlatformEvidence,
  isUserProfileContent,
} from "./types";
import { Violation } from "./violations";

/**
 * Returns a string representing the type of violation for analytics purposes.
 */
export const getAnalyticsViolationType = (violation: Violation): string => {
  if (isPlatformEvidence(violation.evidence)) {
    const lastPartOfKey = violation.evidence.display_meta.lowercase_key.replace(/^.*\./, "");
    return `platform:${lastPartOfKey}`;
  }
  if (isAssetContent(violation.content)) {
    return violation.content.asset_type;
  }
  if (isBundleContent(violation.content)) {
    return violation.content.bundle_type;
  }
  if (isAvatarContent(violation.content)) {
    return ContentType.CONTENT_TYPE_AVATAR;
  }
  if (isUserProfileContent(violation.content)) {
    return ContentType.CONTENT_TYPE_USER_PROFILE;
  }
  if (isLookContent(violation.content)) {
    return ContentType.CONTENT_TYPE_LOOK;
  }
  if (isChatContent(violation.content)) {
    return ContentType.CONTENT_TYPE_CHAT;
  }
  return "unknown";
};
