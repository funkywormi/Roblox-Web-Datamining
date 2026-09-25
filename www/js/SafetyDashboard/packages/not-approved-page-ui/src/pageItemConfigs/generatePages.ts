import { TPunishment, CommutationEligibility } from "../utils/types";
import { PageConfigType, StaticPageName } from "./ConfigTypes";
import { PUNISHMENT_TYPE } from "../utils/constants";
import resolvePolicyEducationContent from "./educationalConfigs/resolvePolicyEducationContent";

import AppealsProcessPageItemConfig from "./configs/AppealsProcessPageItemConfig";
import ChargebackStepsPageItemConfig from "./configs/ChargebackStepsPageItemConfig";
import PreventionStepsPageItemConfig from "./configs/PreventionStepsPageItemConfig";
import PunishmentDescriptionPageItemConfig from "./configs/PunishmentDescriptionPageItemConfig";
import ReportMistakePageItemConfig from "./configs/ReportMistakePageItemConfig";
import ReviewedEvidencePageItemConfig from "./configs/ReviewedEvidencePageItemConfig";
import SecondChanceConclusionPageItemConfig from "./secondChanceConfigs/SecondChanceConclusionPageItemConfig";
import SecondChanceIntroPageItemConfig from "./secondChanceConfigs/SecondChanceIntroPageItemConfig";
import WhatHappenedPageItemConfig from "./configs/WhatHappenedPageItemConfig";
import createPolicyEducationPageItemConfig from "./educationalConfigs/createPolicyEducationPageItemConfig";

import ContinueButtonCta from "../components/cta/ContinueButtonCta";
import DismissDialogCta from "../components/cta/DismissDialogCta";
import ProceedActionsCta from "../components/cta/ProceedActionsCta";
import ReportMistakeButtonCta from "../components/cta/ReportMistakeButtonCta";
import SecondChanceActionsCta from "../components/cta/SecondChanceActionsCta";
import UnderstandContinueCta from "../components/cta/UnderstandContinueCta";

type EducationalPagesResult = {
  educationalPages: PageConfigType[];
  unmappedViolationKeys: string[];
};

/**
 * Helper function to generate the middle pages based on violation type keys. Currently only supports
 * adding in educational pages.
 *
 * Also returns violation types that couldn't be mapped to educational content.
 */
const getEducationalPages = (
  violationTypeKeys: string[],
  isEducationalPassEligible: boolean,
  readOnly?: boolean,
  isKidsTreatment = false,
): EducationalPagesResult => {
  const educationalPages: PageConfigType[] = [];

  const unmappedViolationKeys = new Set<string>();
  const orderedDeduplicationKeys: string[] = [];
  const policyContentByDeduplicationKey = new Map<
    string,
    NonNullable<ReturnType<typeof resolvePolicyEducationContent>>
  >();

  // Resolve and deduplicate policy content while preserving the first-seen policy order.
  violationTypeKeys.forEach(violationTypeKey => {
    const policyEducationConfig = resolvePolicyEducationContent(violationTypeKey, isKidsTreatment);

    // Track violation types that don't have educational content configured
    if (!policyEducationConfig) {
      unmappedViolationKeys.add(violationTypeKey);
      return;
    }

    const deduplicationKey =
      policyEducationConfig.deduplicationKey ?? policyEducationConfig.policyKey;
    const existingPolicyContent = policyContentByDeduplicationKey.get(deduplicationKey);

    if (!existingPolicyContent) {
      orderedDeduplicationKeys.push(deduplicationKey);
      policyContentByDeduplicationKey.set(deduplicationKey, policyEducationConfig);
    } else if (policyEducationConfig.deduplicationKey && !existingPolicyContent.deduplicationKey) {
      // Prefer focused Kids content when a standard fallback for the same policy appeared first.
      policyContentByDeduplicationKey.set(deduplicationKey, policyEducationConfig);
    }
  });

  orderedDeduplicationKeys.forEach(deduplicationKey => {
    const policyEducationConfig = policyContentByDeduplicationKey.get(deduplicationKey);
    if (!policyEducationConfig) {
      return;
    }
    const educationalCta =
      isEducationalPassEligible && !readOnly ? UnderstandContinueCta : ContinueButtonCta;

    // Policy education - Rule page that explains the rule that was broken.
    educationalPages.push({
      pageName: `policy-rule-${policyEducationConfig.policyKey}`,
      pageItems: [
        createPolicyEducationPageItemConfig({
          title: policyEducationConfig.ruleTitle,
          subtitle: policyEducationConfig.ruleSubtitle,
          description: policyEducationConfig.ruleDescription,
          descriptionBullets: policyEducationConfig.ruleDescriptionBullets,
          policyKey: policyEducationConfig.policyKey,
        }),
      ],
      CtaComponent: educationalCta,
    });

    // Policy education - Importance page that explains why the rule is important.
    educationalPages.push({
      pageName: `policy-importance-${policyEducationConfig.policyKey}`,
      pageItems: [
        createPolicyEducationPageItemConfig({
          title: policyEducationConfig.importanceTitle,
          description: policyEducationConfig.importanceDescription,
          descriptionBullets: policyEducationConfig.importanceDescriptionBullets,
          policyKey: policyEducationConfig.policyKey,
        }),
      ],
      CtaComponent: educationalCta,
    });
  });

  return { educationalPages, unmappedViolationKeys: [...unmappedViolationKeys] };
};

export type GeneratePagesResult = {
  pages: PageConfigType[];
  unmappedViolationKeys: string[];
};

/**
 * Generates pages dynamically based on punishment data that allows for arbitrary pages to be
 * inserted in the Not Approved Page.
 *
 * Main pages:
 * - First page: Always present (intro/evidence)
 * - Resolution page: Always present (foreshadowing/chargeback notice if applicable)
 *
 * Conditional pages:
 * - Educational pages: Added if the user has violation types that can be mapped to educational content.
 * - Second Chance intro page: Added if the user is eligible for a Second Chance pass.
 * - Second Chance conclusion page: Added if the user is eligible for a Second Chance pass.
 *
 * Also returns violation types that couldn't be mapped to educational content for logging.
 */
export const generatePages = (
  punishmentData: TPunishment,
  violationTypeKeys: string[],
  commutationEligibility?: CommutationEligibility,
  readOnly?: boolean,
  isKidsTreatment = false,
): GeneratePagesResult => {
  const pages: PageConfigType[] = [];

  const isDeletePunishment = punishmentData.punishmentTypeDescription === PUNISHMENT_TYPE.Delete;
  const isEducationalPassEligible = commutationEligibility?.educational_pass_eligible ?? false;

  // First page: Always present (intro/description page)
  pages.push({
    pageName: StaticPageName.Intro,
    pageItems: [
      PunishmentDescriptionPageItemConfig,
      WhatHappenedPageItemConfig,
      ReviewedEvidencePageItemConfig,
      ...(isDeletePunishment ? [AppealsProcessPageItemConfig] : []),
    ],
    CtaComponent: isDeletePunishment ? ReportMistakeButtonCta : ContinueButtonCta,
  });

  // Deletions only show the first page with the report mistake button so there's no need for additional pages.
  if (isDeletePunishment) {
    return { pages, unmappedViolationKeys: [] };
  }

  // Second Chance: Intro page if the user is eligible for a Second Chance pass.
  if (isEducationalPassEligible && !readOnly) {
    pages.push({
      pageName: StaticPageName.SecondChanceIntro,
      pageItems: [SecondChanceIntroPageItemConfig, ReportMistakePageItemConfig],
      CtaComponent: ContinueButtonCta,
    });
  }

  // Educational pages: Add native educational content if applicable.
  const { educationalPages, unmappedViolationKeys } = getEducationalPages(
    violationTypeKeys,
    isEducationalPassEligible,
    readOnly,
    isKidsTreatment,
  );
  pages.push(...educationalPages);

  // Resolution page: Always present (foreshadowing/chargeback notice if applicable)
  const resolutionCta = readOnly
    ? DismissDialogCta
    : isEducationalPassEligible
      ? UnderstandContinueCta
      : ProceedActionsCta;

  pages.push({
    pageName: StaticPageName.Resolution,
    pageItems: [
      PreventionStepsPageItemConfig,
      ChargebackStepsPageItemConfig,
      ReportMistakePageItemConfig,
      // The disclosure is normally rendered by ReportMistakePageItemConfig, which is hidden in
      // read-only Second Chance-eligible flows, so add it as a standalone item in that case.
      ...(readOnly && isEducationalPassEligible ? [AppealsProcessPageItemConfig] : []),
    ],
    CtaComponent: resolutionCta,
  });

  // Second Chance: Conclusion page if the user is eligible for a Second Chance pass.
  if (isEducationalPassEligible && !readOnly) {
    pages.push({
      pageName: StaticPageName.SecondChanceConclusion,
      pageItems: [SecondChanceConclusionPageItemConfig],
      CtaComponent: SecondChanceActionsCta,
    });
  }

  return { pages, unmappedViolationKeys };
};
