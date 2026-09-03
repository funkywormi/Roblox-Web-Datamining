import { TPunishment, CommutationEligibility } from "../utils/types";
import { PageConfigType, StaticPageName } from "./ConfigTypes";
import { PUNISHMENT_TYPE } from "../utils/constants";
import POLICY_EDUCATION_CONTENT_REGISTRY from "./educationalConfigs/policyEducationContentRegistry";

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
): EducationalPagesResult => {
  const educationalPages: PageConfigType[] = [];

  const unmappedViolationKeys = new Set<string>();
  const addedPolicyKeys = new Set<string>();

  // Add educational pages for each violation type a user violated.
  violationTypeKeys.forEach(violationTypeKey => {
    const policyEducationConfig = POLICY_EDUCATION_CONTENT_REGISTRY[violationTypeKey];

    // Track violation types that don't have educational content configured
    if (!policyEducationConfig) {
      unmappedViolationKeys.add(violationTypeKey);
      return;
    }

    // If the policy key has already been added, skip to avoid duplicates
    if (addedPolicyKeys.has(policyEducationConfig.policyKey)) return;
    addedPolicyKeys.add(policyEducationConfig.policyKey);

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
