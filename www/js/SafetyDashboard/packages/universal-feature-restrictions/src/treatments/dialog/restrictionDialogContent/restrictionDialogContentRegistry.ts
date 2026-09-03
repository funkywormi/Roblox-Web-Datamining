import type { InterventionType } from "../../../types/api";

export interface RestrictionContentEntry {
  bodyKeys?: Partial<Record<InterventionType, string>>;
  titleKeys?: Partial<Record<InterventionType, string>>;
  labelKey: string;
}

/**
 * A registry with the current different abuse vectors and their correpsonding content keys.
 * This is only needed now as the backend to create these strings dynamically is not in place yet.
 */
const RESTRICTION_CONTENT_REGISTRY: Record<string, RestrictionContentEntry> = {
  experience_chat: {
    bodyKeys: {
      Nudge: "AbuseVector.TextChat.DialogBody.Nudge",
      Suspended: "AbuseVector.TextChat.DialogBody.Suspended",
      Banned: "AbuseVector.TextChat.DialogBody.Banned",
    },
    titleKeys: {
      Nudge: "AbuseVector.TextChat.DialogTitle.Nudge",
    },
    labelKey: "AbuseVector.TextChat",
  },
  party_chat: {
    labelKey: "AbuseVector.PartyChat",
  },
  age_verification: {
    labelKey: "AbuseVector.AgeVerification",
  },
  rights_management: {
    labelKey: "AbuseVector.RightsManagement",
  },
};

export function getRegistryEntry(abuseVector: string): RestrictionContentEntry | undefined {
  if (!Object.hasOwn(RESTRICTION_CONTENT_REGISTRY, abuseVector)) {
    return undefined;
  }
  return RESTRICTION_CONTENT_REGISTRY[abuseVector];
}

/**
 * Abuse vectors whose restriction data the consumer supplies via the dialog `overrides` prop
 * instead of the not-approved endpoint. That endpoint has no support for these vectors and always
 * errors (e.g. voice), so the dialog skips the fetch entirely and takes duration/end date from the
 * consumer.
 *
 * NOTE: Adding new vectors is discouraged.
 */
const OVERRIDE_BACKED_ABUSE_VECTORS: ReadonlySet<string> = new Set(["voice"]);

/**
 * Single source of truth for the fetch gate AND consumers. The only consumer should really be the Safety
 * Dashboard since that handles every abuse vector instead of 1-2 a consumer team would typically manage.
 */
export function isOverrideBackedAbuseVector(abuseVector: string): boolean {
  return OVERRIDE_BACKED_ABUSE_VECTORS.has(abuseVector);
}
