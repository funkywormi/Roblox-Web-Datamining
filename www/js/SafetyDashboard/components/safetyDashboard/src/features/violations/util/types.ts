import * as z from "zod/mini";
import { Violation, Asset, Bundle, Avatar, Look, UserProfile, Chat } from "@rbx/moderation-portal";
import { sendValidationErrorEvent } from "../../../telemetry/appealsEvents";

z.config(z.locales.en());

/**
 * Known values for `violation.evidence.type`.
 */
export const EvidenceType = { PLATFORM: "platform" } as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

/**
 * This represents the supported evidence content for a platform violation.
 * Elements are validated separately.
 */
const zPlatformEvidence = z.object({
  type: z.literal(EvidenceType.PLATFORM),
  display_meta: z.object({
    lowercase_key: z.string().check(z.minLength(1)),
    capitalized_key: z.string().check(z.minLength(1)),
    icon: z.string(),
  }),
  /** We handle this verification separately in `zPlatformElement` */
  elements: z.array(z.unknown()),
});

/**
 * This represent the supported evidence content for a platform violation.
 */
export type PlatformEvidence = z.infer<typeof zPlatformEvidence>;

/**
 * The API types don't have a proper discriminator type, so we'll use type guards
 * to work around that.
 */

export const isAssetContent = (content: Violation["content"]): content is Asset => {
  return content?.content_type === "CONTENT_TYPE_ASSET";
};
export const isBundleContent = (content: Violation["content"]): content is Bundle => {
  return content?.content_type === "CONTENT_TYPE_BUNDLE";
};
export const isAvatarContent = (content: Violation["content"]): content is Avatar => {
  return content?.content_type === "CONTENT_TYPE_AVATAR";
};
export const isUserProfileContent = (content: Violation["content"]): content is UserProfile => {
  return content?.content_type === "CONTENT_TYPE_USER_PROFILE";
};
export const isLookContent = (content: Violation["content"]): content is Look => {
  return content?.content_type === "CONTENT_TYPE_LOOK";
};
export const isChatContent = (content: Violation["content"]): content is Chat => {
  return content?.content_type === "CONTENT_TYPE_CHAT";
};

/**
 * Evidence is partly typed, and we'll use this to almost fully type it for PLATFORM evidence if
 * it passed our validation check. It doesn't validate individual elements.
 */
export const isPlatformEvidence = (evidence: unknown): evidence is PlatformEvidence => {
  if (
    typeof evidence !== "object" ||
    evidence === null ||
    !("type" in evidence) ||
    evidence.type !== EvidenceType.PLATFORM
  ) {
    // we only care about PLATFORM evidence
    // other types will have to implement their own type guards
    return false;
  }
  const result = zPlatformEvidence.safeParse(evidence);
  if (!result.success) {
    console.warn("Failed to parse platform evidence: ", result.error);
    return false;
  }
  return true;
};

// we either specify text or textKey,
// if both are specified, text will take precedence over textKey
export const zPlatformElement = z.union([
  z
    .object({
      type: z.literal("text"),
      labelKey: z.string(),
      text: z.optional(z.string()),
      textKey: z.optional(z.string()),
      textKeyParameters: z.optional(z.record(z.string(), z.string())),
    })
    .check(
      z.refine(data => data.text !== undefined || data.textKey !== undefined, {
        message: "Either 'text' or 'textKey' must be provided",
      }),
      z.refine(data => !data.textKeyParameters || data.textKey !== undefined, {
        message: "'textKeyParameters' requires 'textKey' to be provided",
      }),
    ),
  z.object({
    type: z.literal("image"),
    labelKey: z.string(),
    url: z.string(),
    altLabelKey: z.optional(z.string()),
  }),
  z.object({
    type: z.literal("timestamp"),
    labelKey: z.string(),
    unix: z.number(),
  }),
]);

/**
 * This represents a supported element in platform evidence.
 */
export type PlatformElement = z.infer<typeof zPlatformElement>;

/**
 * Checks if an element provided as part of platform evidence follows the expected schema.
 * If not, send an error event, because this signals that an integrator needs to fix the
 * way they provide evidence, or otherwise update the UI.
 */
export const isPlatformElementValid = (element: unknown): element is PlatformElement => {
  const result = zPlatformElement.safeParse(element);
  if (!result.success) {
    console.warn("Failed to parse platform element: ", result.error);
    sendValidationErrorEvent({
      errorType: "platform element",
      errorMessage: result.error.message,
    });
    return false;
  }
  return true;
};

/**
 * This represents fully valid platform evidence, including valid elements.
 */
const zPlatformEvidenceFullyTyped = z.object({
  ...zPlatformEvidence.shape,
  elements: z.array(zPlatformElement),
});

/**
 * This represents the supported evidence content for a platform violation (fully typed).
 */
export type PlatformEvidenceFullyTyped = z.infer<typeof zPlatformEvidenceFullyTyped>;

/**
 * Evidence is partly typed, and we'll use this to almost fully type it for PLATFORM evidence if
 * it passed our validation check. It doesn't validate individual elements.
 */
export const isValidatedPlatformEvidence = (
  evidence: unknown,
): evidence is PlatformEvidenceFullyTyped => {
  if (
    typeof evidence !== "object" ||
    evidence === null ||
    !("type" in evidence) ||
    evidence.type !== EvidenceType.PLATFORM
  ) {
    // we only care about PLATFORM evidence
    // other types will have to implement their own type guards
    return false;
  }
  const result = zPlatformEvidenceFullyTyped.safeParse(evidence);
  if (!result.success) {
    console.warn("Failed to parse platform evidence fully typed: ", result.error);
    return false;
  }
  return true;
};

/**
 * A violation is "limited" when we have no structured content and no valid
 * platform evidence to render. The UI falls back to generic copy and a
 * support-form appeal path instead of the inline appeal modal.
 */
export const isLimited = (violation: Violation): boolean =>
  !violation.content && !isValidatedPlatformEvidence(violation.evidence);
