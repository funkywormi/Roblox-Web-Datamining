import { ThumbnailTypes } from 'roblox-thumbnails';
import SponsoredCampaignType from '../enums/sponsoredCampaignType';
import CampaignTargetType from '../enums/campaignTargetType';
import TargetAgeBracket from '../enums/targetAgeBracket';
import TargetGender from '../enums/targetGender';
import CreativeType from '../enums/creativeType';
import DeviceType from '../enums/deviceTypes';
import PlacementLocation from '../enums/placementLocation';
import CreatorType from '../enums/creatorType';

export const CampaignTargetTypeToThumbnailType: { [key in CampaignTargetType]: ThumbnailTypes } = {
  [CampaignTargetType.Asset]: ThumbnailTypes.assetThumbnail,
  [CampaignTargetType.Universe]: ThumbnailTypes.gameIcon
};

export const maxCampaignDurationDays = 28;

export const minRobuxPerDay = 10;
export const maxRobuxPerDay = 9999999;

export const minCampaignNameLengthInclusive = 1;
export const maxCampaignNameLengthInclusive = 50;

export type Creator = {
  typeId: number;
  targetId: number;
};

export type CampaignTargetModel = {
  targetType: CampaignTargetType;
  targetId: number;
  name: string;
};

export type Asset = {
  id: number;
  name: string;
};

export type GetAssetsByIdsResponse = {
  data?: Array<Asset>;
};

export type SearchAssetsForCreatorResponse = {
  nextPageCursor: string | null;
  data: Array<Asset>;
};

export type GetSponsorableAssetTypesResponse = Array<number>;

export type MultiGetCanUserSponsorResponse = {
  data?: Map<number, boolean>;
};

export type GetRunningAndStoppedCampaignTargetsResponse = {
  campaignTargetModels: Array<CampaignTargetModel>;
};

export type CreateSponsoredCampaignSettings = {
  isEstimatedImpressionEnabled: boolean;
  isAverageDailyBudgetEnabled: boolean;
  areV2SponsoredGameWebsiteEndpointsEnabled: boolean;
  creatorId: number;
  creatorType: string;
  creatorName: string;
};

export type CreateSponsoredCampaignModel = {
  campaignTargetId: number;
  campaignTargetType: CampaignTargetType;
  targetGenders: Set<TargetGender>;
  targetAgeBrackets: Set<TargetAgeBracket>;
  startDate: Date;
  numberOfDays: number;
  targetDeviceTypes: Set<DeviceType>;
  campaignName: string;
  robuxPerDay: number;
  targetPlacementLocations: Set<PlacementLocation>;
  creativeModel: CreativeModel | null;
};

// Matches Roblox.AdConfiguration.Api.Models.CreateSponsoredCampaignRequest
export type CreateSponsoredCampaignRequest = {
  campaignTargetId: number;
  campaignTargetType: CampaignTargetType;
  targetGender: string;
  targetAgeBracket: string;
  startDate: Date;
  endDate: Date;
  targetDeviceType: string;
  campaignName: string;
  dailyBidAmountInRobux: number;
  placementLocation: string;
  creativeModel: CreativeModel | null;
};

export type CreateSponsoredCampaignResponse = {
  error: string;
  isValid: boolean;
  data: number;
};

export type ErrorModel = {
  code?: number;
  message: string;
  errors?: { message: string }[];
};

export type CreateSponsoredCampaignErrorResponse = {
  data?: { errors?: Array<ErrorModel> };
};

// Matches Roblox.AdConfiguration.Api.CeativeModel
export type CreativeModel = {
  creativeId: number;
  creativeType: CreativeType;
};

export const CreatorTypeToCatalogApiCreatorTypeValue: { [key in CreatorType]: number } = {
  [CreatorType.User]: 1,
  [CreatorType.Group]: 2
};

export const maxNumAssetsForSelector = 120;

export function GetCampaignTargetTypeForSponsoredCampaignType(
  sponsoredCampaignType: SponsoredCampaignType
): CampaignTargetType {
  switch (sponsoredCampaignType) {
    case SponsoredCampaignType.Experiences:
      return CampaignTargetType.Universe;
    case SponsoredCampaignType.CatalogAssets:
      return CampaignTargetType.Asset;
    default:
      throw new Error(`Unsuppored SponsoredCampaignType`);
  }
}

export function GetSponsoredCampaignTypeForCampaignTargetType(
  campaignTargetType: CampaignTargetType
): SponsoredCampaignType {
  switch (campaignTargetType) {
    case CampaignTargetType.Universe:
      return SponsoredCampaignType.Experiences;
    case CampaignTargetType.Asset:
      return SponsoredCampaignType.CatalogAssets;
    default:
      throw new Error(`Unsuppored CampaignTargetType`);
  }
}

// See confluence page entitled:
//   "Avatar Shop / Marketplace / Catalog Asset Types"
export const defaultSponsorableAssetTypeIds = [
  8,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  64,
  65,
  66,
  67,
  68,
  69,
  70,
  71,
  72
];
