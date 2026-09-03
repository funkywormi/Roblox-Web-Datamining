import { httpService } from 'core-utilities';
import {
  CommunityFeatureFreeze,
  CommunityFeatureFreezeName,
  CommunityFeatureFreezesResponse
} from '../types';
import groupConstants from '../constants/groupConstants';

interface GroupOwnerFeatureFreeze {
  feature: string;
  isFeatureBlocked: boolean;
  expiration: string;
}

interface GroupOwnerFeatureFreezesResponse {
  features: GroupOwnerFeatureFreeze[];
}

interface SetFeaturesResponse {
  updated: boolean;
}

// Owner endpoint uses singular feature names; map them to the plural community feature names.
const ownerToCommunityFeatureName: Record<string, CommunityFeatureFreezeName> = {
  ForumRead: CommunityFeatureFreezeName.ForumsRead,
  ForumWrite: CommunityFeatureFreezeName.ForumsWrite
};

const fetchGroupOwnerFeatureFreezes = async (
  groupId: number
): Promise<GroupOwnerFeatureFreeze[]> => {
  const url = groupConstants.urls.getGroupOwnerFeatureFreezesURL(groupId);
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.get<GroupOwnerFeatureFreezesResponse>(urlConfig);

  return data?.features ?? [];
};

const fetchGroupCommunityFeatureFreezes = async (
  groupId: number
): Promise<CommunityFeatureFreezesResponse> => {
  const url = groupConstants.urls.getGroupCommunityFeaturesURL(groupId);
  const urlConfig = {
    url,
    withCredentials: true
  };
  const { data } = await httpService.get<CommunityFeatureFreezesResponse>(urlConfig);

  return data;
};

const fetchCommunityFeatureFreezes = async (
  groupId: number,
  isOwner: boolean
): Promise<CommunityFeatureFreezesResponse> => {
  const [communityFreezes, ownerFreezes] = await Promise.all([
    fetchGroupCommunityFeatureFreezes(groupId),
    isOwner ? fetchGroupOwnerFeatureFreezes(groupId) : Promise.resolve([])
  ]);

  if (!isOwner) {
    return communityFreezes;
  }

  const canReenableByFeature = new Map<CommunityFeatureFreezeName, boolean>();
  ownerFreezes.forEach(feature => {
    const communityFeature = ownerToCommunityFeatureName[feature.feature];
    if (!communityFeature) {
      return;
    }
    canReenableByFeature.set(
      communityFeature,
      feature.isFeatureBlocked
        ? !feature.expiration || new Date(feature.expiration).getTime() <= Date.now()
        : false
    );
  });

  const features: CommunityFeatureFreeze[] = (communityFreezes?.features ?? []).map(feature => ({
    ...feature,
    canReenable: canReenableByFeature.get(feature.feature) ?? false
  }));

  return { features };
};

const reenableForums = async (groupId: number): Promise<boolean> => {
  const url = groupConstants.urls.getGroupOwnerFeatureFreezesURL(groupId);
  const urlConfig = {
    url,
    withCredentials: true
  };
  const request = {
    features: {
      ForumRead: 'On',
      ForumWrite: 'On'
    }
  };
  const { data } = await httpService.patch<SetFeaturesResponse>(urlConfig, request);

  return data?.updated ?? false;
};

export default {
  fetchCommunityFeatureFreezes,
  reenableForums
};
