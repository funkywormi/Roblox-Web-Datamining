import { PUNISHMENT_TYPE, VERIFICATION_CATEGORIES } from "./constants";
import { EvidenceType } from "./platformEvidenceTypes";

export type TBadUtterance = {
  /* This isnt used anymore, but just keeping it here for safety. */
  abuseType?: string;
  /* The translation key for the reason (violation type e.g. Profanity) of the bad utterance. */
  labelTranslationKey: string;
  /* The evidence that we show the user. This could be a chat line, an asset ID, etc. */
  utteranceText: string;
};

export type TVerificationCategory =
  (typeof VERIFICATION_CATEGORIES)[keyof typeof VERIFICATION_CATEGORIES];

export interface TDisplayMeta {
  lowercaseKey: string;
  capitalizedKey: string;
  icon: string;
}

export interface TEvidence {
  type: EvidenceType;
  elements?: unknown[];
  elementsObj?: Record<string, unknown>;
  displayMeta?: TDisplayMeta;
}

export interface TViolation {
  uid: string;
  abuseTypeTranslationKeys: string[];
  evidence?: TEvidence;
  // TODO(agrossman): support content (legacy) violations too
}

export type TPunishment = {
  agreedCheckBoxExperimentVariant?: string;
  badUtterances?: TBadUtterance[];
  beginDate: string;
  consequenceTransparencyMessage: string;
  context?: Record<string, unknown>;
  endDate: string;
  isForeshadowingConsequenceEnabled?: boolean;
  interventionId: string;
  messageToUser: string;
  punishedUserId: number;
  punishmentId: number;
  punishmentTypeDescription: PUNISHMENT_TYPE;
  showAppealsProcessLink: boolean;
  verificationCategory: TVerificationCategory;
  showUGCAvatarGuidelinesLink?: boolean;
  violation?: TViolation;
};

export enum ProceedAction {
  Reactivate,
  Paused,
  VerifyEmail,
  VerifyVPC,
}

export enum AMPRecoursePunishmentType {
  Chargeback = "Chargeback",
}

export type CommutationEligibility = {
  educational_pass_eligible: boolean;
};
