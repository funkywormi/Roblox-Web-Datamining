import { CurrentUser } from 'Roblox';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TOwnedItemInstance,
  TCategoryMapping
} from '../constants/types';
import {
  categoryTranslations,
  TCategoryTranslationMapping
} from '../constants/categoryTranslations';

export function isLimited(itemRestrictions: string[]): boolean {
  if (!itemRestrictions || !Array.isArray(itemRestrictions)) {
    return false;
  }
  if (itemRestrictions.includes('LimitedUnique') || itemRestrictions.includes('Limited')) {
    return true;
  }
  return false;
}

export function isLimitedUnique(itemRestrictions: string[]): boolean {
  if (!itemRestrictions || !Array.isArray(itemRestrictions)) {
    return false;
  }
  if (itemRestrictions.includes('LimitedUnique')) {
    return true;
  }
  return false;
}

export function isCollectible(itemRestrictions: string[]): boolean {
  if (!itemRestrictions || !Array.isArray(itemRestrictions)) {
    return false;
  }
  if (itemRestrictions.includes('Collectible')) {
    return true;
  }
  return false;
}

// Returns true when this item requires (or supports) Facial Age Estimation
// gating, signalled by 'IsFAE' in TAssetItemDetails.itemStatus.
// itemStatus only exists on assets — bundles always return false.
export function isFae(itemDetails: TAssetItemDetails | TBundleItemDetails): boolean {
  if (!itemDetails || itemDetails.itemType !== 'Asset') {
    return false;
  }
  return itemDetails.itemStatus?.includes('IsFAE') === true;
}

export function isInExperienceOnly(itemDetails: TAssetItemDetails | TBundleItemDetails): boolean {
  if (!itemDetails) {
    return false;
  }
  if (
    itemDetails.saleLocationType === 'MyExperiencesOnly' ||
    itemDetails.saleLocationType === 'ExperiencesById' ||
    itemDetails.saleLocationType === 'ExperiencesDevApiOnly'
  ) {
    return true;
  }
  return false;
}

export function checkReachedQuantityLimit(
  itemDetails: TAssetItemDetails | TBundleItemDetails,
  ownedItemInstances: TOwnedItemInstance[]
): boolean {
  if (!itemDetails?.quantityLimitPerUser || !ownedItemInstances?.length) {
    return false;
  }

  const isCreator = CurrentUser.isAuthenticated && itemDetails.creatorName === CurrentUser.name;
  const ownedNum = ownedItemInstances.length - (isCreator ? 1 : 0);
  return itemDetails.quantityLimitPerUser <= ownedNum;
}

type TCategoryTranslations = {
  category: TCategoryTranslationMapping | null;
  subcategory: TCategoryTranslationMapping | null;
};

export function getCategoryTranslations(
  categoryMapping: TCategoryMapping | null
): TCategoryTranslations | null {
  if (!categoryMapping) return null;
  const category = categoryMapping.category
    ? categoryTranslations?.[categoryMapping.category]
    : null;
  const subcategory = categoryMapping.subcategory
    ? categoryTranslations?.[categoryMapping.subcategory]
    : null;
  return {
    category: category || null,
    subcategory: subcategory || null
  };
}
