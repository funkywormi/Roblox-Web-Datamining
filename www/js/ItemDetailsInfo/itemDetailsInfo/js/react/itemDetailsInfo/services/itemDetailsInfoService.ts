/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AxiosPromise, AxiosResponse, httpService } from 'core-utilities';
import { CurrentUser } from 'Roblox';
import { DefaultThumbnailSize, ThumbnailFormat } from 'roblox-thumbnails';
import urlConfigs from '../constants/urlConfigs';
import {
  TItemType,
  TAssetItemDetails,
  TOwnedItemInstance,
  TBundleItemDetails,
  TCategoryMappings,
  TResellerItem,
  TCollectibleResellerItem,
  TL2ResellableCopies
} from '../constants/types';

export type TMultiItemDetailsResult = {
  data: TAssetItemDetails[];
};

export type TOwnedItemInstanceResult = {
  data: TOwnedItemInstance[];
};
export type TDeleteInventoryItemResult = {
  isValid: boolean;
};
export type TAddToProfileResult = {};
export type TRemoveFromProfileResult = {};
export type TSubmitSafetyEvent = {
  id: string;
};

type TBatchedCategoryResult = [
  Record<string, number>,
  Record<string, number>,
  Record<string, number>,
  Record<string, number>
];

type TResellers = {
  previousPageCursor: string;
  nextPageCursor: string;
  data: TResellerItem[];
};

type TCollectibleResellers = {
  previousPageCursor: string;
  nextPageCursor: string;
  data: TCollectibleResellerItem[];
};

export type TGetCollectibleItemDetailsResult = {
  data: TCollectibleItemDetails[];
};

type TCollectibleItemDetails = TAssetItemDetails & {
  itemTargetId: number;
};

export type TFaeFeatureAccessRecourse = {
  action: string;
};

export type TFaeFeatureAccessFeature = {
  featureName: string;
  // 'Granted' means the user can claim FAE-gated items. Any other value
  // (e.g. 'Actionable') means access is not currently granted.
  access: string;
  recourse?: string | null;
  recourses?: TFaeFeatureAccessRecourse[];
  v2Recourses?: TFaeFeatureAccessRecourse[][];
  shouldPrompt?: boolean;
};

export type TFaeFeatureAccessResponse = {
  features: TFaeFeatureAccessFeature[];
};

export const FAE_ACCESS_GRANTED = 'Granted';

async function getItemToCategoryMappings(): Promise<Record<string, number>> {
  const result: AxiosResponse<Record<string, number>> = await httpService.get(
    urlConfigs.assetTypeToCategory
  );
  return result.data;
}
async function getItemToSubategoryMappings(): Promise<Record<string, number>> {
  const result: AxiosResponse<Record<string, number>> = await httpService.get(
    urlConfigs.assetTypeToSubcategory
  );
  return result.data;
}
async function getItemCategories(): Promise<Record<string, number>> {
  const result: AxiosResponse<Record<string, number>> = await httpService.get(
    urlConfigs.categories
  );
  return result.data;
}
async function getItemSubcategories(): Promise<Record<string, number>> {
  const result: AxiosResponse<Record<string, number>> = await httpService.get(
    urlConfigs.subcategories
  );
  return result.data;
}

export const ItemDetailsInfoService = {
  getItemDetails(
    targetId: number,
    itemType: string
  ): AxiosPromise<TAssetItemDetails | TBundleItemDetails> {
    const requestBody = { itemType };
    return httpService.get(urlConfigs.itemDetails(targetId), requestBody);
  },
  getLimitedAssetResaleData(
    targetId: number
  ): AxiosPromise<TAssetItemDetails | TBundleItemDetails> {
    return httpService.get(urlConfigs.assetResaleData(targetId));
  },
  getOwnedItem(targetId: number, itemType: TItemType): AxiosPromise<TOwnedItemInstanceResult> {
    return httpService.get(urlConfigs.ownedItem(CurrentUser.userId, itemType, targetId));
  },
  async getIsItemOwned(targetId: number, itemType: TItemType): Promise<boolean> {
    const result: AxiosResponse<boolean> = await httpService.get(
      urlConfigs.ownedItem(CurrentUser.userId, itemType, targetId)
    );
    return result?.data === true;
  },
  async getResellers(itemId: number): Promise<TResellers> {
    const result: AxiosResponse<TResellers> = await httpService.get(
      urlConfigs.getResellers(itemId)
    );
    return result.data;
  },
  async getCollectibleItemDetails(itemId: string): Promise<TAssetItemDetails | null> {
    const requestBody = {
      itemIds: [itemId]
    };

    const result: AxiosResponse<TGetCollectibleItemDetailsResult> = await httpService.post(
      urlConfigs.collectibleItemDetails,
      requestBody
    );
    if (result.data?.[0]) {
      result.data[0].id = result.data[0].itemTargetId;
    }
    const itemDetails: TAssetItemDetails | undefined = result.data?.[0];
    return itemDetails || null;
  },
  postItemDetails(targetId: number, itemType: string): AxiosPromise<TMultiItemDetailsResult> {
    const requestBody = {
      items: [
        {
          itemType,
          id: targetId
        }
      ]
    };
    return httpService.post(urlConfigs.assetItemDetails, requestBody);
  },
  postDeleteItemFromInventory(targetId: number): AxiosPromise<TDeleteInventoryItemResult> {
    return httpService.delete(urlConfigs.deleteFromInventory(targetId));
  },
  postAssetDetailsArray(targetIds: number[]): AxiosPromise<TMultiItemDetailsResult> {
    const items = new Array<unknown>();
    targetIds.map(item =>
      items.push({
        itemType: 'Asset',
        id: item
      })
    );
    const requestBody = {
      items
    };
    return httpService.post(urlConfigs.assetItemDetails, requestBody);
  },
  getItemToCategoryMappings,
  getItemToSubategoryMappings,
  getItemCategories,
  getItemSubcategories,
  async getBatchedCategoryMappings(): Promise<TCategoryMappings> {
    const results: TBatchedCategoryResult = await Promise.all([
      getItemToCategoryMappings(),
      getItemToSubategoryMappings(),
      getItemCategories(),
      getItemSubcategories()
    ]);
    return {
      typeToCategory: results[0],
      typeToSubcategory: results[1],
      categories: results[2],
      subcategories: results[3]
    };
  },
  addToProfile(targetId: number, itemType: TItemType): AxiosPromise<TAddToProfileResult> {
    const requestBody = {};
    return httpService.post(urlConfigs.modifyProfile(targetId, itemType), requestBody);
  },
  removeFromProfile(targetId: number, itemType: TItemType): AxiosPromise<TRemoveFromProfileResult> {
    const requestBody = {};
    return httpService.delete(urlConfigs.modifyProfile(targetId, itemType), requestBody);
  },
  postSubmitSafetyEvent(bundleId: number, reporterId: string): AxiosPromise<TSubmitSafetyEvent> {
    const requestBody = {
      safetyEvent: {
        eventTime: Date.now(),
        idempotencyKey: `ugc_bundle/${bundleId}/${reporterId}`,
        tags: {
          SUBMITTER_USER_ID: {
            valueList: [
              {
                data: reporterId
              }
            ]
          },
          REPORTED_ABUSE_VECTOR: {
            valueList: [
              {
                data: 'ugc_bundle'
              }
            ]
          },
          UGC_BUNDLE_ID: {
            valueList: [
              {
                data: bundleId.toString()
              }
            ]
          },
          ENTRY_POINT: {
            valueList: [
              {
                data: 'website'
              }
            ]
          },
          REPORTED_ABUSE_CATEGORY: {
            valueList: [
              {
                data: 'ABUSE_TYPE_OTHER'
              }
            ]
          },
          REPORTER_COMMENT: {
            valueList: [
              {
                data: ''
              }
            ]
          }
        }
      }
    };
    return httpService.post(urlConfigs.submitSafetyEvent, requestBody);
  },
  getLimited2CopiesOwned(
    userId: string,
    collectibleItemId: string,
    limit: number,
    cursor: string | undefined
  ): AxiosPromise<TL2ResellableCopies> {
    const urlConfig = {
      url: urlConfigs.getLimited2CopiesOwned(userId, collectibleItemId, limit, cursor),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  getFaeFeatureAccess(): AxiosPromise<TFaeFeatureAccessResponse> {
    return httpService.get(urlConfigs.faeFeatureAccess);
  },
  // The endpoint returns a single feature in `features[0]`. We treat
  // `access === 'Granted'` as the only truthy state; everything else
  // (including network errors) resolves to `false`.
  async getIsFaeFeatureGranted(): Promise<boolean> {
    try {
      const result: AxiosResponse<TFaeFeatureAccessResponse> = await httpService.get(
        urlConfigs.faeFeatureAccess
      );
      return result.data?.features?.[0]?.access === FAE_ACCESS_GRANTED;
    } catch {
      return false;
    }
  },
  // Returns true when the viewer is eligible to see the FAE upsell (i.e. we
  // should show the unlock flow). Falls back to false on errors or any non-
  // 'Granted' access value — caller treats that as "item unavailable".
  async getIsFaeUpsellGranted(): Promise<boolean> {
    try {
      const result: AxiosResponse<TFaeFeatureAccessResponse> = await httpService.get(
        urlConfigs.faeUpsellAccess
      );
      return result.data?.features?.[0]?.access === FAE_ACCESS_GRANTED;
    } catch {
      return false;
    }
  }
};

export default ItemDetailsInfoService;
