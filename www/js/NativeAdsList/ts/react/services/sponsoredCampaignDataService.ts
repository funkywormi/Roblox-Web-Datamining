import { dateService, httpService } from 'core-utilities';
import { AxiosPromise } from 'axios';

import CampaignTargetType from '../enums/campaignTargetType';
import {
  CreateSponsoredCampaignModel,
  CreateSponsoredCampaignRequest,
  CreateSponsoredCampaignResponse,
  GetAssetsByIdsResponse,
  GetRunningAndStoppedCampaignTargetsResponse,
  GetSponsorableAssetTypesResponse,
  MultiGetCanUserSponsorResponse,
  SearchAssetsForCreatorResponse
} from '../constants/sponsoredCampaignConstants';
import CatalogApiSortType from '../enums/catalogApiSortType';
import {
  getCreateSponsoredCampaignConfig,
  getGetAssetsConfig,
  getGetEligibleCampaignTargetsConfig,
  getSearchAssetsForCreatorConfig,
  getSponsorableAssetTypeIdsConfig,
  multiGetCanUserSponsorConfig
} from '../utils/urlHelper';

export function tryCreateSponsoredCampaign(
  model: CreateSponsoredCampaignModel
): AxiosPromise<CreateSponsoredCampaignResponse> {
  const targetGenders: string = Array.from(model.targetGenders).join(',');
  const targetAgeBrackets: string = Array.from(model.targetAgeBrackets).join(',');
  const targetDeviceTypes: string = Array.from(model.targetDeviceTypes).join(',');
  const targetPlacementLocations: string = Array.from(model.targetPlacementLocations).join(',');

  const createSponsoredCampaignRequest: CreateSponsoredCampaignRequest = {
    campaignTargetId: model.campaignTargetId,
    campaignTargetType: model.campaignTargetType,
    targetGender: targetGenders,
    targetAgeBracket: targetAgeBrackets,
    startDate: model.startDate,
    endDate: dateService.addDays(model.startDate, model.numberOfDays),
    targetDeviceType: targetDeviceTypes,
    campaignName: model.campaignName,
    dailyBidAmountInRobux: model.robuxPerDay,
    placementLocation: targetPlacementLocations,
    creativeModel: null
  };
  const urlConfig = getCreateSponsoredCampaignConfig();
  return httpService.post<CreateSponsoredCampaignResponse>(
    urlConfig,
    createSponsoredCampaignRequest
  );
}

export function getAssetsByIds(assetIds: Array<number>): AxiosPromise<GetAssetsByIdsResponse> {
  return httpService.get<GetAssetsByIdsResponse>(getGetAssetsConfig(), {
    assetIds: assetIds.join(',')
  });
}

export function searchAssetsForCreator(
  assetTypeIds: Array<number>,
  creatorTargetId: number,
  catalogApiCreatorTypeId: number,
  maxResultCount: number,
  catalogApiSortType: CatalogApiSortType
): AxiosPromise<SearchAssetsForCreatorResponse> {
  const params = new URLSearchParams();
  assetTypeIds.forEach(assetTypeId => params.append('assetTypeIds', assetTypeId.toString()));
  params.append('creatorTargetId', creatorTargetId.toString());
  params.append('creatorType', catalogApiCreatorTypeId.toString());
  params.append('limit', maxResultCount.toString());
  params.append('sortType', catalogApiSortType.toString());
  return httpService.get<SearchAssetsForCreatorResponse>(getSearchAssetsForCreatorConfig(), params);
}

export function getSponsorableAssetTypeIds(): AxiosPromise<GetSponsorableAssetTypesResponse> {
  return httpService.get<GetSponsorableAssetTypesResponse>(getSponsorableAssetTypeIdsConfig(), {});
}

export function multiGetCanUserSponsor(
  campaignTargetType: CampaignTargetType,
  campaignTargetIds: Array<number>
): AxiosPromise<MultiGetCanUserSponsorResponse> {
  return httpService.get<MultiGetCanUserSponsorResponse>(multiGetCanUserSponsorConfig(), {
    campaignTargetType,
    campaignTargetIds: campaignTargetIds.map(id => id.toString()).join(',')
  });
}

export function getRunningAndStoppedCampaignTargets(
  // If groupId is NULL, fetches the campaign targets for the authenticated user
  groupId: number | null,
  campaignTargetTypes: Array<CampaignTargetType>
): AxiosPromise<GetRunningAndStoppedCampaignTargetsResponse> {
  return httpService.post<GetRunningAndStoppedCampaignTargetsResponse>(
    getGetEligibleCampaignTargetsConfig(),
    { groupId, campaignTargetTypes }
  );
}
