import { AccessManagementUpsellV2Service } from 'Roblox';
import groupConstants from '../constants/groupConstants';
import {
  REQUIREMENT_ACTION_BY_KEY,
  RequirementActions,
  RequirementKey
} from './communityTierConstants';

type RequirementActionResult = {
  shouldRefresh: boolean;
};

/** True when the requirement has an owner-facing action behind it. */
export function isActionableRequirement(requirementKey: string): boolean {
  return REQUIREMENT_ACTION_BY_KEY[requirementKey as RequirementKey] !== undefined;
}

async function startAgeEstimation(): Promise<RequirementActionResult> {
  const params = {
    featureName: 'TriggerFacialAgeEstimationRecourse',
    namespace: 'account_identity/AgeCheck',
    isAsyncCall: false
  };

  try {
    await AccessManagementUpsellV2Service.startAccessManagementUpsell(params);
    return { shouldRefresh: true };
  } catch {
    // The upsell was dismissed or failed to open, so nothing changed server-side.
    return { shouldRefresh: false };
  }
}

function navigateToSecuritySettings(): RequirementActionResult {
  window.open(groupConstants.urls.accountSecuritySettings, '_blank');
  // The user completes this in another tab, so there is nothing to refresh yet.
  return { shouldRefresh: false };
}

export default async function startRequirementAction(
  requirementKey: string
): Promise<RequirementActionResult> {
  switch (REQUIREMENT_ACTION_BY_KEY[requirementKey as RequirementKey]) {
    case RequirementActions.ageEstimation:
      return startAgeEstimation();
    case RequirementActions.securitySettings:
      return navigateToSecuritySettings();
    default:
      return { shouldRefresh: false };
  }
}
