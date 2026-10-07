import { httpService } from "core-utilities";
import { DefaultThumbnailSize, ThumbnailFormat } from "roblox-thumbnails";
import itemDetailsConstants from "../constants/itemDetailsConstants";
import urlConfigs from "../constants/urlConfigs";
import type { TItemLicense } from "../../common/types/license";

export type TBundledItem = {
  id: number;
  type: string;
};

export type TItemDetail = {
  name?: string;
  assetType?: number;
  bundleType?: number;
  productId?: number;
  creatorTargetId?: number;
  purchasable?: boolean;
  bundledItems?: TBundledItem[];
  license?: TItemLicense;
};

export type TShowcaseEntry = {
  id: number | string;
  assetSeoUrl: string;
};

type TThumbnailResponse = {
  data: { imageUrl: string }[];
};

export const itemDetailsService = {
  getDetails: (targetId: number | string, isBundle: boolean): Promise<TItemDetail | null> =>
    httpService
      .get<TItemDetail | null>(urlConfigs.getDetails(targetId), {
        itemType: isBundle ? "bundle" : "asset",
      })
      .then(({ data }) => data),

  getRecommendations: (
    recommendationTargetId: number | string,
    recommendationTypeTargetId: number | undefined,
    numItems: number,
    isBundle: boolean,
  ): Promise<{ data: number[] }> => {
    const params: Record<string, unknown> = { numItems, details: false };
    if (isBundle) {
      params.bundleId = recommendationTargetId;
      params.bundleTypeId = recommendationTypeTargetId;
    } else {
      params.assetId = recommendationTargetId;
      params.assetTypeId = recommendationTypeTargetId;
    }
    return httpService
      .get<{ data: number[] }>(urlConfigs.getRecommendations(isBundle), params)
      .then(({ data }) => data);
  },

  getCanConfigure: (
    targetId: number | string,
    isBundle: boolean,
  ): Promise<{ isAllowed?: boolean }> =>
    httpService
      .get<{ isAllowed?: boolean }>(urlConfigs.getCanConfigure(targetId, isBundle), {})
      .then(({ data }) => data),

  getCanSponsor: (targetId: number | string): Promise<Record<string, boolean>> =>
    httpService
      .get<Record<string, boolean>>(urlConfigs.getCanSponsor(targetId), {})
      .then(({ data }) => data),

  getUserShowcase: (userId: number | string | null): Promise<TShowcaseEntry[]> =>
    httpService
      .get<TShowcaseEntry[]>(urlConfigs.getUserShowcase(userId), {})
      .then(({ data }) => data),

  getCurrentUserBalance: (userId: number | string | null): Promise<{ robux?: number }> =>
    httpService
      .get<{ robux?: number }>(urlConfigs.getCurrentUserBalance(userId), {})
      .then(({ data }) => data),

  getAssetThumbnail: (targetId: number | string): Promise<TThumbnailResponse> =>
    httpService
      .get<TThumbnailResponse>(urlConfigs.getAssetThumbnail, {
        assetIds: targetId,
        size: DefaultThumbnailSize,
        format: ThumbnailFormat.png,
        isCircular: false,
      })
      .then(({ data }) => data),

  getBundleThumbnail: (targetId: number | string): Promise<TThumbnailResponse> =>
    httpService
      .get<TThumbnailResponse>(urlConfigs.getBundleThumbnail, {
        bundleIds: targetId,
        size: DefaultThumbnailSize,
        format: ThumbnailFormat.png,
        isCircular: false,
      })
      .then(({ data }) => data),
};

export const isClassicAssetType = (assetType?: number): boolean =>
  itemDetailsConstants.classicAssetTypes.includes(assetType as never);

export const isAllowedInShowcase = (assetType?: number): boolean =>
  itemDetailsConstants.showcaseAllowedAssetTypes.includes(assetType as never);

export default itemDetailsService;
