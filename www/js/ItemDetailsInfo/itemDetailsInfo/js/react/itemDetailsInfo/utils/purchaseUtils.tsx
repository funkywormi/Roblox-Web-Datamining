/* eslint-disable react/jsx-no-literals */
import React from 'react';
import { TranslateFunction } from 'react-utilities';
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat
} from 'roblox-thumbnails';
import { Badge } from '@rbx/foundation-ui';
import { TDiscountInformation } from 'Roblox';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TResellerItem,
  TCollectibleResellerItem,
  TTimedOption
} from '../constants/types';
import { translateCatalogGet, catalogTranslations } from '../services/translationService';
import { isInExperienceOnly, isCollectible, isLimited } from './itemDetailUtils';

type TItemPurchaseParams = {
  translate: TranslateFunction;
  productId: number;
  isRentable?: boolean;
  expectedCurrency: number;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  expectedSellerId: number;
  sellerName: string;
  isPlace?: boolean;
  isPrivateServer?: boolean;
  expectedPromoId?: number;
  userAssetId?: number;
  showSuccessBanner?: boolean;
  handlePurchase?: () => void;
  onPurchaseSuccess?: () => void;
  customProps?: () => void;
  collectibleItemId?: string | null;
  collectibleItemInstanceId?: string | null;
  collectibleProductId?: string | null;
  sellerType?: string | null;
  isLimited?: boolean;
  rentalOptionDays?: number | null;
  discountInformation?: TDiscountInformation | null;
};

type TCollectibleBestSellerInfo = {
  collectibleItemId: string;
  collectibleItemInstanceId: string | null;
  collectibleProductId?: string;
  expectedPrice: number;
  expectedSellerId?: number;
  sellerName?: string;
  sellerType?: string;
};

type TLimited1BestSellerInfo = {
  userAssetId?: number;
  expectedPrice: number;
  expectedSellerId?: number;
  sellerName: string;
  sellerType: string;
};

type TGetCollectibleBestSellerArgs = {
  expectedPrice: number | null;
  collectibleItemDetails: TAssetItemDetails | TBundleItemDetails | undefined;
  onlyFromReseller: boolean | null;
  itemDetails: TAssetItemDetails | TBundleItemDetails | null;
};
type TGetLimited1BestSellerArgs = {
  expectedPrice: number | null;
  resellers: TResellerItem[] | null;
  itemDetails: TAssetItemDetails | null;
};

type TGenPurchaseParamsArgs = {
  itemDetails: TAssetItemDetails | TBundleItemDetails | null;
  expectedPrice: number | null;
  resellers: TResellerItem[] | TCollectibleResellerItem[] | null;
  collectibleItemDetails: TAssetItemDetails | TBundleItemDetails | undefined;
  onlyFromReseller: boolean | null;
  timedOption?: TTimedOption | null;
};

export function isLimitedItem(itemRestrictions: string[]): boolean {
  return isLimited(itemRestrictions) || isCollectible(itemRestrictions);
}

function genBasePurchaseParams({
  itemDetails,
  expectedPrice,
  resellers,
  timedOption
}: TGenPurchaseParamsArgs): TItemPurchaseParams | null {
  if (!itemDetails) return null;
  const isBundle = itemDetails.itemType === 'Bundle';
  let price = expectedPrice || 0;
  if (timedOption !== null && timedOption?.price !== undefined) {
    price = timedOption.price;
  }
  return {
    translate: translateCatalogGet,
    productId: itemDetails.productId,
    expectedPrice: price,
    thumbnail: (
      <div className='marketplace-item-purchase-thumbnail-outer-container'>
        <div className='marketplace-item-purchase-thumbnail-container'>
          {timedOption && timedOption.days !== 0 && (
            <div className='timed-options-badge-container'>
              <Badge
                variant='Neutral'
                icon='icon-regular-clock'
                className='bg-surface-0'
                label={catalogTranslations.labelTimedOptionDaysAbbreviation(timedOption.days)}
              />
            </div>
          )}
          <Thumbnail2d
            type={isBundle ? ThumbnailTypes.bundleThumbnail : ThumbnailTypes.assetThumbnail}
            size={DefaultThumbnailSize}
            targetId={itemDetails.id}
            imgClassName=''
            format={ThumbnailFormat.webp}
          />
        </div>
      </div>
    ),
    assetName: itemDetails.name,
    assetType: itemDetails.itemType,
    sellerName: itemDetails.creatorName,
    sellerType: itemDetails.creatorType,
    expectedCurrency: 1,
    expectedSellerId: itemDetails.expectedSellerId || itemDetails.creatorTargetId,
    collectibleItemId: null,
    collectibleProductId: null,
    collectibleItemInstanceId: null,
    isPlace: false,
    userAssetId: resellers?.[0]?.userAssetId,
    isLimited: isLimitedItem(itemDetails.itemRestrictions),
    rentalOptionDays: timedOption !== null ? timedOption?.days : null,
    discountInformation: timedOption
      ? timedOption.discountInformation
      : itemDetails.discountInformation
  };
}

function getCollectibleBestSeller({
  collectibleItemDetails,
  onlyFromReseller,
  itemDetails
}: TGetCollectibleBestSellerArgs): TCollectibleBestSellerInfo | null {
  if (!collectibleItemDetails) return null;

  const { collectibleItemId } = collectibleItemDetails;
  if (!collectibleItemId) return null;

  // With all marketplace items moved to Collectible system, "isNonLimited" is equivalent to item restrictions array
  // being empty.
  const isNonLimited = !isLimitedItem(itemDetails?.itemRestrictions || []);

  const creatorItem: TCollectibleBestSellerInfo | null =
    collectibleItemDetails.unitsAvailableForConsumption || isNonLimited
      ? {
          collectibleItemId,
          collectibleItemInstanceId: null,
          collectibleProductId: collectibleItemDetails.collectibleProductId,
          expectedPrice: collectibleItemDetails.price,
          expectedSellerId: collectibleItemDetails.creatorId,
          sellerType: collectibleItemDetails.creatorType,
          sellerName: collectibleItemDetails.creatorName
        }
      : null;

  const resellerItem: TCollectibleBestSellerInfo | null =
    collectibleItemDetails.lowestAvailableResaleItemInstanceId &&
    collectibleItemDetails.lowestAvailableResaleProductId &&
    collectibleItemDetails.lowestResalePrice
      ? {
          collectibleItemId,
          collectibleItemInstanceId: collectibleItemDetails.lowestAvailableResaleItemInstanceId,
          collectibleProductId: collectibleItemDetails.lowestAvailableResaleProductId,
          expectedPrice: collectibleItemDetails.lowestResalePrice
        }
      : null;

  if (onlyFromReseller) {
    return resellerItem;
  }

  // For in experience only item, best seller cannot be original creator/copy.
  // L2.0 Offsale item (premium lapsed) must also not have best seller as original creator.
  if (creatorItem && resellerItem) {
    return resellerItem.expectedPrice < creatorItem.expectedPrice ||
      collectibleItemDetails.isOffSale === true ||
      isInExperienceOnly(collectibleItemDetails)
      ? resellerItem
      : creatorItem;
  }
  if (!creatorItem && !resellerItem) return null;
  if (creatorItem && !resellerItem) return creatorItem;
  if (!creatorItem && resellerItem) return resellerItem;
  return null;
}
function getLimited1BestSeller({
  resellers,
  itemDetails
}: TGetLimited1BestSellerArgs): TLimited1BestSellerInfo | null {
  const creatorItem: TLimited1BestSellerInfo | null =
    itemDetails && itemDetails.unitsAvailableForConsumption
      ? {
          userAssetId: undefined,
          expectedPrice: itemDetails.price,
          expectedSellerId: itemDetails.creatorId,
          sellerType: itemDetails.creatorType,
          sellerName: itemDetails.creatorName
        }
      : null;

  const resellerItem: TLimited1BestSellerInfo | null = resellers?.[0]
    ? {
        userAssetId: resellers[0].userAssetId,
        expectedPrice: resellers[0].price,
        expectedSellerId: resellers[0].seller?.id,
        sellerType: resellers[0].seller?.type,
        sellerName: resellers[0].seller?.name
      }
    : null;
  if (creatorItem && resellerItem) {
    return resellerItem.expectedPrice < creatorItem.expectedPrice ? resellerItem : creatorItem;
  }
  if (!creatorItem && !resellerItem) return null;
  if (creatorItem && !resellerItem) return creatorItem;
  if (!creatorItem && resellerItem) return resellerItem;
  return null;
}

function genPurchaseParams({
  itemDetails,
  expectedPrice,
  resellers,
  collectibleItemDetails,
  onlyFromReseller,
  timedOption
}: TGenPurchaseParamsArgs): TItemPurchaseParams | null {
  const purchaseParams = genBasePurchaseParams({
    itemDetails,
    expectedPrice,
    resellers,
    collectibleItemDetails,
    onlyFromReseller,
    timedOption
  });

  if (!itemDetails) return null;
  if (!purchaseParams) return null;

  if (collectibleItemDetails) {
    // Sets specific Limited 2.0 purchase parameters used by the Roblox.Purchase.WebApp.
    // Will choose the cheapest available product, whether from the original seller or the
    // cheapest reseller.
    const collectibleSellerInfo = getCollectibleBestSeller({
      expectedPrice,
      collectibleItemDetails,
      onlyFromReseller,
      itemDetails
    });
    if (collectibleSellerInfo) {
      purchaseParams.collectibleItemId = collectibleSellerInfo.collectibleItemId;
      purchaseParams.collectibleItemInstanceId = collectibleSellerInfo.collectibleItemInstanceId;
      purchaseParams.collectibleProductId = collectibleSellerInfo.collectibleProductId;
      purchaseParams.expectedSellerId = collectibleSellerInfo.expectedSellerId || 1;
      purchaseParams.sellerType = collectibleSellerInfo.sellerType;
      purchaseParams.sellerName = collectibleSellerInfo.sellerName
        ? collectibleSellerInfo.sellerName
        : '';
    }
  } else if (resellers?.length) {
    // Sets specific Limited 1.0 purchase parameters used by the Roblox.Purchase.WebApp.
    // Will choose the original seller (if items available) or choose the cheapest reseller.
    const limited1Resellers = (resellers || []) as TResellerItem[];
    const limited1SellerInfo = getLimited1BestSeller({
      expectedPrice,
      resellers: limited1Resellers,
      itemDetails: itemDetails.itemType === 'Asset' ? itemDetails : null
    });
    if (limited1SellerInfo) {
      purchaseParams.userAssetId = limited1SellerInfo.userAssetId;
      purchaseParams.expectedSellerId = limited1SellerInfo.expectedSellerId || 1;
      purchaseParams.sellerType = limited1SellerInfo.sellerType;
      purchaseParams.sellerName = limited1SellerInfo.sellerName;
    }
  }
  return purchaseParams;
}

// eslint-disable-next-line import/prefer-default-export
export { genPurchaseParams };
