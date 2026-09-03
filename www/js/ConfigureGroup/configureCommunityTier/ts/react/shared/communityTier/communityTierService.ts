import { httpService } from 'core-utilities';
import communityTierConstants, { SIGNAL_TO_REQUIREMENT_KEY } from './communityTierConstants';
import { GroupSettingsCommunityTierResponse, mapGroupSettingsToTierInfo } from './mapGroupTierInfo';
import { GroupTierInfo } from './types';

type ApiRequirement = { key: number | string; satisfied: boolean };

type EvaluateResponse = {
  tierInfo: GroupSettingsCommunityTierResponse['communityTier'];
  passedSignals?: string[] | null;
  requirements?: ApiRequirement[] | null;
};

function buildRequirementsFromSignals(passedSignals: string[]): ApiRequirement[] {
  const passedSet = new Set(passedSignals);

  return Object.entries(SIGNAL_TO_REQUIREMENT_KEY).map(([signal, key]) => ({
    key,
    satisfied: passedSet.has(signal)
  }));
}

async function fetchGroupTierInfo(groupId: number): Promise<GroupTierInfo | null> {
  const urlConfig = {
    url: communityTierConstants.urls.getGroupSettings(groupId),
    withCredentials: true
  };

  const response = await httpService.get<GroupSettingsCommunityTierResponse>(urlConfig);
  return mapGroupSettingsToTierInfo(response.data);
}

/**
 * Reads the tier off the group detail response, which carries the same
 * `communityTier` payload as group settings but is readable by non-members.
 */
async function fetchGroupTierInfoFromGroupDetail(groupId: number): Promise<GroupTierInfo | null> {
  const urlConfig = {
    url: communityTierConstants.urls.getGroupDetail(groupId),
    withCredentials: true
  };

  const response = await httpService.get<GroupSettingsCommunityTierResponse>(urlConfig);
  return mapGroupSettingsToTierInfo(response.data);
}

/**
 * Re-evaluates the tier and maps the result, returning null when the response
 * carries no tier at all.
 *
 * Null is a successful evaluation that found nothing to report, not a failure:
 * throwing here made the page tell the owner a request had failed when it had in
 * fact returned 200, so the distinction is left to the caller.
 */
async function evaluateGroupTier(groupId: number): Promise<GroupTierInfo | null> {
  const urlConfig = {
    url: communityTierConstants.urls.evaluateCommunityTier(groupId),
    withCredentials: true
  };

  const response = await httpService.post<EvaluateResponse>(urlConfig);
  const { tierInfo, passedSignals, requirements } = response.data;

  const signalRequirements =
    passedSignals && passedSignals.length > 0
      ? buildRequirementsFromSignals(passedSignals)
      : undefined;
  const resolvedRequirements = requirements ?? tierInfo?.requirements ?? signalRequirements;

  const communityTier = tierInfo ? { ...tierInfo, requirements: resolvedRequirements } : null;

  return mapGroupSettingsToTierInfo({ communityTier });
}

const communityTierService = {
  getGroupTierInfo: async (groupId: number): Promise<GroupTierInfo | null> => {
    if (groupId <= 0) {
      return Promise.reject(new Error('Invalid group ID'));
    }

    return fetchGroupTierInfo(groupId);
  },

  getGroupTierInfoFromGroupDetail: async (groupId: number): Promise<GroupTierInfo | null> => {
    if (groupId <= 0) {
      return Promise.reject(new Error('Invalid group ID'));
    }

    return fetchGroupTierInfoFromGroupDetail(groupId);
  },

  evaluateGroupTier: async (groupId: number): Promise<GroupTierInfo | null> => {
    if (groupId <= 0) {
      return Promise.reject(new Error('Invalid group ID'));
    }

    return evaluateGroupTier(groupId);
  }
};

export default communityTierService;
