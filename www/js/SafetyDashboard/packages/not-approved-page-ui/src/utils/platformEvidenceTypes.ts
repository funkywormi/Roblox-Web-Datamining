import * as z from "zod/mini";
import type { TEvidence } from "./types";

z.config(z.locales.en());

// This code is adapted from Appeals Portal web-frontend code: https://github.rbx.com/Roblox/web-frontend/blob/853c9ff97d5bc8b62360da3320aa3158ee9a7afc/WebApps/Roblox.ModerationPortal.WebApp/Roblox.ModerationPortal.WebApp/ts/react/api/types.ts

/**
 * Known values for `violation.evidence.type`.
 */
export enum EvidenceType {
  PLATFORM = "platform",
}

/**
 * This represents the supported evidence content for a platform violation.
 * Elements are validated separately.
 */
const zPlatformEvidence = z.object({
  type: z.literal(EvidenceType.PLATFORM),
  displayMeta: z.optional(
    z.object({
      lowercaseKey: z.string().check(z.minLength(1)),
      capitalizedKey: z.string().check(z.minLength(1)),
      icon: z.string(),
    }),
  ),
  /** We handle this verification separately in `zPlatformElement` */
  elements: z.optional(z.array(z.unknown())),
});

/**
 * This represent the supported evidence content for a platform violation.
 */
export type PlatformEvidence = z.infer<typeof zPlatformEvidence>;

/**
 * Evidence is partly typed, and we'll use this to almost fully type it for PLATFORM evidence if
 * it passed our validation check. It doesn't validate individual elements.
 */
export const isPlatformEvidence = (
  evidence: TEvidence,
  // For reasons, the lint/test is setup to run from root in web-frontend. So it will use root's typescript
  // version, which is incompatible with zod. So while this works fine in the actual code and while editing
  // we'll need to ignore it for tests to work :(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore For reasons, the lint/test runs TS from the base folder, which is incompatible with zod
): evidence is PlatformEvidence => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- API may return unexpected values
  if (evidence.type !== EvidenceType.PLATFORM) {
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
  // TODO(agrossman): allow rendering of all supported elements
  // z.object({
  //   type: z.literal('timestamp'),
  //   labelKey: z.string(),
  //   unix: z.number()
  // })
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
    return false;
  }
  return true;
};

/**
 * This represents fully valid platform evidence, including valid elements.
 */
const zPlatformEvidenceFullyTyped = z.object({
  ...zPlatformEvidence.shape,
  elements: z.optional(z.array(zPlatformElement)),
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
  evidence: TEvidence,
  // For reasons, the lint/test is setup to run from root in web-frontend. So it will use root's typescript
  // version, which is incompatible with zod. So while this works fine in the actual code and while editing
  // we'll need to ignore it for tests to work :(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore For reasons, the lint/test runs TS from the base folder, which is incompatible with zod
): evidence is PlatformEvidenceFullyTyped => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- API may return unexpected values
  if (evidence.type !== EvidenceType.PLATFORM) {
    return false;
  }
  const result = zPlatformEvidenceFullyTyped.safeParse(evidence);
  if (!result.success) {
    console.warn("Failed to parse platform evidence fully typed: ", result.error);
    return false;
  }
  return true;
};
