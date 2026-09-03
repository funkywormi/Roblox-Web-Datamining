import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { formatSeoName } from "@rbx/core-scripts/format/string";
import { ThumbnailTypes } from "@rbx/thumbnails";
import recommendationsRequests from "./recommendationsRequests";
import recommendationsConstants, {
  recommendationTypes,
} from "../constants/recommendationsConstants";
import { TAssetItemDetails, TBundleItemDetails } from "./types";

type Creator = {
  name: string;
  creatorType: string;
  creatorId: number;
};

export type CatalogMetadata = {
  LCEnabledInEditorAndCatalog: boolean;
  autocompleteAvatarSearchNumToDisplay: number;
  autocompleteOmniSearchNumToDisplay: number;
  categoryOptimizationEnabled: boolean;
  is3dInEachItemCardAbTestingEnabled: boolean;
  is3dInEachItemCardEnabled: boolean;
  isAutocompleteEnabled: boolean;
  isCatalogAdsRowOnRecommendedPageEnabled: boolean;
  isCatalogSortsFromApiEnabled: boolean;
  isCategoryReorgEnabled: boolean;
  isCollectiblesEnabled: boolean;
  isCurrentUserAllowedToCreateShares: boolean;
  isDynamicHeadsEnabled: boolean;
  isJustinUiChangesEnabled: boolean;
  isPremiumIconOnItemTilesEnabled: boolean;
  isPremiumPriceOnItemTilesEnabled: boolean;
  isPremiumSortEnabled: boolean;
  numberOfCatalogItemsToDisplayOnSplash: number;
  numberOfCatalogItemsToDisplayOnSplashOnPhone: number;
  timeoutOn3dThumbnailRequestInMs: number;
};

export type RecommendationsMetadata = {
  numOfRecommendationsDisplayed: number;

  numOfRecommendationsRetrieved: number;
  subject: string;

  pageName?: string;

  recommendationTargetId?: string;

  isMoreByCreatorEnabled?: boolean;

  numberOfItems: number;
};

export type UserInventoryResponse = {
  data: CatalogItemDetails[];
};

export type CatalogItemDetails = TBundleItemDetails | TAssetItemDetails;

export type CatalogItemDetailsResponse = {
  data: CatalogItemDetails[];
};

type BaseItem = {
  id: number;
  name: string;
  price: number;
  lowestPrice?: number;
  absoluteUrl: string;
  audioUrl: string | null;
  urlType: string;
  creator: {
    id: number;
    name: string;
    nameForDisplay: string;
    type: string;
    profileLink: string;
  };
  thumbnail: {
    type: string;
  };
  product: {
    id: number | null;
    isForSale: boolean;
    isFree: boolean;
    noPriceText: string;
  };
  creatorHasVerifiedBadge: boolean;
  itemType?: string;
  itemRestrictions?: string[];
  priceStatus?: string;
  unitsAvailableForConsumption?: number;
  itemStatus?: string[];
};

type BundleItem = BaseItem & {
  premiumPrice?: number | null;
  itemType: "Bundle";
};

type AssetItem = BaseItem & {
  itemType: "Asset";
  hasResellers?: boolean;
  saleLocationType?: string;
};

export type RecommendedItem = BundleItem | AssetItem;

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class RecommendationsService {
  static getBundleUrl(bundleId: number): string {
    return getAbsoluteUrl(`/bundles/${bundleId}`);
  }

  static getAssetUrl(assetId: number, assetName: string): string {
    return getAbsoluteUrl(`/catalog/${assetId}/${assetName}`);
  }

  static getAudioUrl(assetId: number, assetType: number): string | null {
    if (assetType === 3) {
      return getAbsoluteUrl(`/library/${assetId}`);
    }
    return null;
  }

  static getProfileLink(userId: string): string {
    return getAbsoluteUrl(`/users/${userId}/profile`);
  }

  static getCreatorProfileLink(
    creatorId: number,
    creatorType: string,
    creatorName: string,
  ): string {
    if (creatorType === "Group") {
      return getAbsoluteUrl(`/groups/${creatorId}/${formatSeoName(creatorName)}`);
    }
    return getAbsoluteUrl(`/users/${creatorId}/profile`);
  }

  static isRecommendationAllowed(
    recommendationType: number,
    recommendationSubtype: number,
  ): boolean {
    if (recommendationType === recommendationsConstants.recommendationTypes.bundle) {
      return true;
    }

    return (
      recommendationSubtype > 0 &&
      recommendationSubtype !== recommendationsConstants.recommendationSubtypes.gamePasses &&
      recommendationSubtype !== recommendationsConstants.recommendationSubtypes.badges
    );
  }

  static translateBundleResultFromItemDetails(result: TBundleItemDetails): BundleItem {
    const bundleCreator: Creator = {
      name: result.creatorName,
      creatorType: result.creatorType,
      creatorId: result.creatorTargetId,
    };

    const item: BundleItem = {
      id: result.id,
      name: result.name,
      price: result.price,
      lowestPrice: result.lowestPrice,
      absoluteUrl: RecommendationsService.getBundleUrl(result.id),
      audioUrl: null,
      urlType: recommendationsConstants.bundleRootUrlTemplate,
      creator: {
        id: result.creatorTargetId,
        name: result.creatorName,
        nameForDisplay: RecommendationsService.getNameForDisplay(bundleCreator),
        type: result.creatorType,
        profileLink: RecommendationsService.getCreatorProfileLink(
          result.creatorTargetId,
          result.creatorType,
          result.creatorName,
        ),
      },
      thumbnail: {
        type: ThumbnailTypes.bundleThumbnail,
      },
      product: {
        id: null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        isForSale: !(result as any).itemStatus?.includes("Offsale"),
        isFree: result.price === 0,
        noPriceText: result.priceStatus || "",
      },
      creatorHasVerifiedBadge: result.creatorHasVerifiedBadge,
      itemType: "Bundle",
      itemRestrictions: result.itemRestrictions,
      priceStatus: result.priceStatus,
      unitsAvailableForConsumption: result.unitsAvailableForConsumption,
    };

    return item;
  }

  static async beginUpdateRecommendedItems(
    recommendationTargetId: number,
    recommendationType: number,
    recommendationSubtype: number,
    numItems: number,
    recommendationSubject: string,
  ): Promise<any[]> {
    let params;
    if (recommendationType === recommendationTypes.bundle) {
      params = RecommendationsService.buildUrlParamsV2(
        null,
        null,
        recommendationTargetId,
        numItems,
        recommendationSubtype !== -1 ? recommendationSubtype : null,
      );
    } else {
      params = RecommendationsService.buildUrlParamsV2(
        recommendationSubtype,
        recommendationTargetId,
        null,
        numItems,
        null,
      );
    }

    const urlConfig = RecommendationsService.buildUrlV2(recommendationSubject);

    const inventoryResponse = await recommendationsRequests.get<UserInventoryResponse>(
      urlConfig,
      params,
    );
    const inventoryData = inventoryResponse?.data;
    if (inventoryData) {
      const dynamicRecommendationType = inventoryData[0]?.itemType === "Bundle" ? 2 : 1;

      return dynamicRecommendationType === recommendationTypes.bundle
        ? inventoryData.map((r: CatalogItemDetails) => {
            return RecommendationsService.translateBundleResultFromItemDetails(
              r as TBundleItemDetails,
            );
          })
        : inventoryData.map((r: CatalogItemDetails) => {
            return RecommendationsService.translateAssetResultFromItemDetails(
              r as TAssetItemDetails,
            );
          });
    }
    return [];
  }

  static async getCatalogMetadata(): Promise<CatalogMetadata> {
    return recommendationsRequests.get<CatalogMetadata>(
      { url: `${environmentUrls.catalogApi.replace(/\/$/, "")}/v1/catalog/metadata` },
      {
        params: { retryable: true, withCredentials: true },
      },
    );
  }

  static getRecommendationMetadata(pageName: string): Promise<RecommendationsMetadata> {
    const params = { page: pageName };
    const urlConfig = {
      url: `${environmentUrls.catalogApi.replace(/\/$/, "")}/v1/recommendations/metadata`,
    };

    return recommendationsRequests.get<RecommendationsMetadata>(urlConfig, params).then(result => {
      const returnResult: RecommendationsMetadata = { ...result };
      if (returnResult) {
        const { numOfRecommendationsDisplayed } = returnResult;
        returnResult.numberOfItems = numOfRecommendationsDisplayed;
      }
      return returnResult;
    });
  }

  static translateAssetResultFromItemDetails(result: TAssetItemDetails): AssetItem {
    const { creatorName, assetType } = result;
    const assetCreator: Creator = {
      name: result.creatorName,
      creatorType: result.creatorType,
      creatorId: result.creatorTargetId,
    };
    const thumbnailType =
      assetType === recommendationsConstants.assetTypes.places
        ? ThumbnailTypes.placeGameIcon
        : ThumbnailTypes.assetThumbnail;

    const item: AssetItem = {
      id: result.id,
      name: result.name,
      price: result.price,
      lowestPrice: result.lowestPrice,
      absoluteUrl: RecommendationsService.getAssetUrl(result.id, result.name),
      audioUrl: RecommendationsService.getAudioUrl(result.id, result.assetType),
      hasResellers: !!result.hasResellers,
      saleLocationType: result.saleLocationType,
      urlType: recommendationsConstants.assetRootUrlTemplate,
      creator: {
        id: result.creatorTargetId,
        name: creatorName,
        nameForDisplay: RecommendationsService.getNameForDisplay(assetCreator),
        type: result.creatorType,
        profileLink: RecommendationsService.getCreatorProfileLink(
          result.creatorTargetId,
          result.creatorType,
          result.creatorName,
        ),
      },
      thumbnail: {
        type: thumbnailType,
      },
      product: {
        // Product id is not returned by the item details endpoint
        id: null,

        isForSale: !result.itemStatus?.includes("Offsale"),
        isFree: result.price === 0,
        noPriceText: result.priceStatus || "",
      },
      creatorHasVerifiedBadge: result.creatorHasVerifiedBadge,
      itemType: "Asset",
      itemRestrictions: result.itemRestrictions,
      priceStatus: result.priceStatus,
      unitsAvailableForConsumption: result.unitsAvailableForConsumption,
      itemStatus: result.itemStatus,
    };

    return item;
  }

  static buildUrlV2(subject: string) {
    return {
      url: `${environmentUrls.catalogApi.replace(/\/$/, "")}/v2/recommendations/${subject}`,
      withCredentials: true,
    };
  }

  static buildUrlParamsV2(
    assetTypeId: number | null,
    assetId: number | null,
    bundleId: number | null,
    numItems: number,
    bundleTypeId: number | null,
  ) {
    return { assetTypeId, assetId, bundleId, numItems, bundleTypeId, details: true };
  }

  static escapeHtml(str: string): string {
    const element = document.createElement("div");
    if (str) {
      element.innerText = str;
      element.textContent = str;
    }
    return element.innerHTML || "";
  }

  static getNameForDisplay(creator: Creator): string {
    const { userTypes, systemRobloxId } = recommendationsConstants;
    const { name, creatorType, creatorId } = creator;
    if (userTypes[1] === creatorType && systemRobloxId !== creatorId) {
      return ["", RecommendationsService.escapeHtml(name)].join("");
    }
    return RecommendationsService.escapeHtml(name);
  }
}

export default RecommendationsService;
