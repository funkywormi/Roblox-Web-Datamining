import { EnvironmentUrls } from 'Roblox';
import { urlService } from 'core-utilities';
import Url from '../enums/url';
import CampaignTargetType from '../enums/campaignTargetType';

const { adConfigurationApi, developApi, catalogApi } = EnvironmentUrls;

enum CatalogApiUrl {
  V2SearchItemsDetails = '/v2/search/items/details'
}

enum AdConfigurationApiUrl {
  CreateSponsoredCampaign = '/v2/sponsored-campaigns/create',
  GetEligibleAssetTypeIds = '/v2/sponsored-campaigns/eligible-asset-type-ids',
  GetEligibleCampaignTargets = '/v2/sponsored-campaigns/eligible-campaign-targets',
  MultiGetCanUserSponsor = '/v2/sponsored-campaigns/multi-get-can-user-sponsor'
}

export const getGetEligibleCampaignTargetsConfig = () => ({
  retryable: true,
  url: `${adConfigurationApi}${AdConfigurationApiUrl.GetEligibleCampaignTargets}`,
  withCredentials: true
});

export const getCreateSponsoredCampaignConfig = () => ({
  withCredentials: true,
  url: `${adConfigurationApi}${AdConfigurationApiUrl.CreateSponsoredCampaign}`
});

export const getGetAssetsConfig = () => ({
  withCredentials: true,
  url: `${developApi}${Url.GetAssets}`
});

export const getSearchAssetsForCreatorConfig = () => ({
  withCredentials: true,
  url: `${catalogApi}${CatalogApiUrl.V2SearchItemsDetails}`
});

export const getSponsorableAssetTypeIdsConfig = () => ({
  withCredentials: true,
  url: `${adConfigurationApi}${AdConfigurationApiUrl.GetEligibleAssetTypeIds}`
});

interface MultiGetCanUserSponsorParams {
  withCredentials: boolean;
  url: string;
}

export function multiGetCanUserSponsorConfig(): MultiGetCanUserSponsorParams {
  return {
    withCredentials: true,
    url: `${adConfigurationApi}${AdConfigurationApiUrl.MultiGetCanUserSponsor}`
  };
}

interface SponsoredAdsListQueryParams {
  universeId?: number;
  assetId?: number;
}

export const getSponsoredAdListConfig = (
  campaignTargetType: CampaignTargetType,
  campaignTargetId: number,
  groupId: number
): string => {
  let url;
  if (groupId) {
    url = Url.GroupSponsoredAdsList.replace('{groupId}', groupId.toString());
  } else {
    url = Url.UserSponsoredAdsList;
  }

  const params: SponsoredAdsListQueryParams = {};
  if (campaignTargetType === CampaignTargetType.Universe) {
    params.universeId = campaignTargetId;
  } else if (campaignTargetType === CampaignTargetType.Asset) {
    params.assetId = campaignTargetId;
  }

  return urlService.getUrlWithQueries(url, params);
};

export default getCreateSponsoredCampaignConfig;
