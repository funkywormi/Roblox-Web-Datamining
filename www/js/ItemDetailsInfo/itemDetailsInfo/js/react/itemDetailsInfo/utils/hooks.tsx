import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CurrentUser, Endpoints, AvatarAccoutrementService } from 'Roblox';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import ItemDetailsInfoService from '../services/itemDetailsInfoService';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TCategoryMapping,
  TCategoryMappings,
  TCategoryTranslation,
  TItemPricing,
  TItemType,
  TOwnedItemInstance,
  TPriceDisplayMode,
  TUserItemPermissions,
  TResellerItem,
  TCollectibleResellerItem
} from '../constants/types';
import { categoryTranslations } from '../constants/categoryTranslations';
import translationResources, { catalogTranslations } from '../services/translationService';
import { isLimited, isCollectible, checkReachedQuantityLimit } from './itemDetailUtils';
import { nonPurchasableDisplayModes } from '../constants/pricingConstants';
import { escapeHtml } from './parsingUtils';
import { ResaleRestriction } from '../constants/resaleRestrictionConstants';

type TCreatorReference = {
  creatorUrl: string;
  creatorDisplayName: string;
  creatorLinkHtml: { __html: string };
  CreatorLinkComponent: JSX.Element | null;
};

export function useCreatorReference({
  creatorTargetId,
  creatorName,
  creatorType,
  creatorHasVerifiedBadge
}: TAssetItemDetails | TBundleItemDetails): TCreatorReference {
  const [creatorUrl, creatorDisplayName] = useMemo(() => {
    if (!creatorTargetId) return ['', creatorName];
    if (creatorType === 'Group') {
      return [Endpoints.getAbsoluteUrl(`/groups/${creatorTargetId}`), creatorName];
    }
    if (creatorType === 'User') {
      return [Endpoints.getAbsoluteUrl(`/users/${creatorTargetId}/profile`), `@${creatorName}`];
    }
    return ['', creatorName];
  }, [creatorType, creatorTargetId, creatorName]);

  const creatorLinkHtml = useMemo(
    () => ({
      __html:
        !!creatorUrl && !!creatorName
          ? catalogTranslations.labelByCreatorLink({
              linkStart: `<a href="${creatorUrl}" class="text-name">`,
              creator: escapeHtml(creatorName),
              linkEnd: '</a>'
            })
          : ''
    }),
    [creatorUrl, creatorName]
  );

  const CreatorLinkComponent = useMemo(() => {
    if (creatorLinkHtml) {
      return (
        <React.Fragment>
          {/* eslint-disable-next-line react/no-danger */}
          <span className='text-label' dangerouslySetInnerHTML={creatorLinkHtml} />
          {!!creatorHasVerifiedBadge && (
            <VerifiedBadgeIconContainer
              size={BadgeSizes.SUBHEADER}
              additionalContainerClass='verified-badge-icon-item-details'
              titleText={creatorName}
            />
          )}
        </React.Fragment>
      );
    }
    return null;
  }, [creatorLinkHtml, creatorHasVerifiedBadge]);

  return {
    creatorUrl,
    creatorDisplayName,
    creatorLinkHtml,
    CreatorLinkComponent
  };
}

type TUseCatalogMappings = {
  typeToCategory?: Record<string, number>;
  typeToSubcategory?: Record<string, number>;
  categories?: Record<string, number>;
  subcategories?: Record<string, number>;
  categoriesById: Record<string, string> | null;
  subcategoriesById: Record<string, string> | null;
  getItemCategoryByTypeId: (itemType: TItemType, assetType: number) => TCategoryMapping | null;
  getItemCategoryByTypeName: (
    itemType: TItemType,
    assetTypeName: string
  ) => TCategoryMapping | null;
};

export const useCatalogMappings = (): TUseCatalogMappings => {
  const [mappings, setMappings] = useState<TCategoryMappings | null>(null);

  const categoriesById = useMemo(
    () => {
      if (!mappings?.categories) return null;

      const obj: Record<string, string> = {};
      Object.keys(mappings.categories).forEach(k => {
        obj[mappings.categories[k]] = k;
      });
      return obj;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!mappings?.categories]
  );

  const subcategoriesById = useMemo(
    () => {
      if (!mappings?.subcategories) return null;

      const obj: Record<string, string> = {};
      Object.keys(mappings.subcategories).forEach(k => {
        obj[mappings.subcategories[k]] = k;
      });
      return obj;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!mappings?.subcategories]
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const result = await ItemDetailsInfoService.getBatchedCategoryMappings();
        setMappings(result);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    })();
  }, []);

  const getItemCategoryByTypeId = useCallback(
    (itemType: TItemType, assetType: number): TCategoryMapping | null => {
      if (mappings && typeof assetType === 'number') {
        const categoryId = mappings.typeToCategory[assetType];
        const subcategoryId = mappings.typeToSubcategory[assetType];

        return {
          categoryId,
          subcategoryId,
          category: categoriesById?.[categoryId],
          subcategory: subcategoriesById?.[subcategoryId]
        };
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!mappings, typeof mappings?.categories, Object.keys(subcategoriesById || {}).length]
  );

  const getItemCategoryByTypeName = useCallback(
    (itemType: TItemType, assetTypeName: string): TCategoryMapping | null => {
      if (mappings && typeof assetTypeName === 'string') {
        const categoryId = mappings.typeToCategory[assetTypeName];
        const subcategoryId = mappings.typeToSubcategory[assetTypeName];

        return {
          categoryId,
          subcategoryId,
          category: categoriesById?.[categoryId],
          subcategory: subcategoriesById?.[subcategoryId]
        };
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [!!mappings, typeof mappings?.categories, categoriesById, subcategoriesById]
  );
  return {
    ...mappings,
    categoriesById,
    subcategoriesById,
    getItemCategoryByTypeId,
    getItemCategoryByTypeName
  };
};

function getCategoryTranslation(categoryName?: string | null): string | null {
  const translationMapping = categoryName ? categoryTranslations[categoryName] : null;

  if (!translationMapping) return null;

  const translationResource = translationResources[translationMapping.namespace] || null;
  return translationResource?.get(translationMapping.label, {}) || null;
}

export function useCategoryTranslation(
  itemType: TItemType,
  assetType: number
): TCategoryTranslation | null {
  const { getItemCategoryByTypeId, getItemCategoryByTypeName } = useCatalogMappings();

  const categoryMappings = useMemo(
    () => {
      if (!itemType || !assetType) return null;
      if (typeof assetType === 'number') return getItemCategoryByTypeId(itemType, assetType);
      if (typeof assetType === 'string') return getItemCategoryByTypeName(itemType, assetType);
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemType, assetType]
  );

  let existingAssetTypeDisplayName = useMemo(() => {
    return document.getElementById('item-container')?.dataset.assetTypeDisplayName || null;
  }, []);
  if (existingAssetTypeDisplayName === null) {
    const catalogNameKey = AvatarAccoutrementService.getAssetTypeById(assetType)?.catalogNameKey;
    if (itemType !== 'Bundle' && catalogNameKey) {
      existingAssetTypeDisplayName = translationResources.featureCatalog.get(catalogNameKey, {});
    }
  }

  const result = useMemo(
    () => {
      const response = {
        pregeneratedCategory: existingAssetTypeDisplayName,
        category: null,
        subcategory: null
      };
      if (itemType === 'Bundle') {
        const bundleMapping = categoryTranslations.Bundle;
        const translation: string = translationResources[bundleMapping.namespace].get(
          bundleMapping.label,
          {}
        );
        return {
          ...response,
          category: translation
        };
      }
      if (itemType === 'Asset') {
        if (!categoryMappings) return response;
        const categoryTranslation = getCategoryTranslation(categoryMappings.category);
        const subcategoryTranslation = getCategoryTranslation(categoryMappings.subcategory);
        const primaryFallback = categoryTranslation || subcategoryTranslation;

        if (categoryTranslation && subcategoryTranslation) {
          return {
            ...response,
            category: categoryTranslation,
            subcategory: subcategoryTranslation
          };
        }
        if (primaryFallback) {
          return {
            ...response,
            category: primaryFallback
          };
        }
      }
      return response;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemType, !!categoryMappings, categoryMappings?.category, categoryMappings?.subcategory]
  );

  const categoryString = useMemo(
    () => {
      if (result?.pregeneratedCategory) return result.pregeneratedCategory;

      return [result?.category, result?.subcategory].filter(c => c).join(' | ');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result?.category, result?.subcategory]
  );

  return { ...result, categoryString };
}

function genPriceDisplayMode(
  itemDetails: TAssetItemDetails | TBundleItemDetails,
  ownedItemInstances: TOwnedItemInstance[],
  permissions: TUserItemPermissions,
  originalItemDetails: boolean,
  isExperienceLinkEnabled: boolean
): TPriceDisplayMode {
  const isItemLimited = isLimited(itemDetails.itemRestrictions);
  const isItemCollectible = isCollectible(itemDetails.itemRestrictions);
  const { isModerated, isPurchaseEnabled } = permissions;
  const isItemPremium = !!itemDetails.premiumPricing?.premiumPriceInRobux;
  const hasOriginalCopies =
    typeof itemDetails.price === 'number' &&
    typeof itemDetails.unitsAvailableForConsumption === 'number' &&
    itemDetails.unitsAvailableForConsumption &&
    (itemDetails.saleLocationType !== 'ExperiencesDevApiOnly' || isExperienceLinkEnabled);

  if (isModerated) return 'MODERATED';
  if (!isPurchaseEnabled) return 'PURCHASE_DISABLED';

  if (isItemLimited && !isItemCollectible) {
    if (typeof itemDetails.lowestPrice === 'number') return 'LIMITED_WITH_RESELLERS';
    if (hasOriginalCopies && itemDetails.isPurchasable) {
      return 'LIMITED_WITH_CONSUMABLE';
    }
    return 'LIMITED_NO_RESELLERS';
  }
  if (isItemCollectible) {
    const reachedQuantityLimit = checkReachedQuantityLimit(itemDetails, ownedItemInstances);
    if (itemDetails.hasResellers) {
      if (originalItemDetails) {
        return 'COLLECTIBLE_ONLY_ORIGINAL';
      }
      if (reachedQuantityLimit && itemDetails.hasResellers) {
        return 'COLLECTIBLE_ONLY_RESELLERS_QUANTITY_LIMIT_REACHED';
      }
      return 'COLLECTIBLE_ONLY_RESELLERS';
    }
    if (isExperienceLinkEnabled) {
      return 'COLLECTIBLE_IN_EXPERIENCE_ONLY_ORIGINAL';
    }
    if (
      (!reachedQuantityLimit && hasOriginalCopies) ||
      !itemDetails.itemRestrictions.includes('Collectible')
    ) {
      return 'COLLECTIBLE_ONLY_ORIGINAL';
    }
    return 'COLLECTIBLE_NO_SELLERS';
  }
  if (itemDetails.collectibleItemId !== undefined) {
    if (isExperienceLinkEnabled || itemDetails.saleLocationType === 'ExperiencesDevApiOnly') {
      return 'COLLECTIBLE_IN_EXPERIENCE_ONLY_ORIGINAL';
    }
  }

  if (isItemPremium && !ownedItemInstances?.length) {
    if (CurrentUser.isPremiumUser) {
      return 'PREMIUM_USER_PREMIUM_ITEM';
    }
    if (!CurrentUser.isAuthenticated) {
      return 'UNAUTHENTICATED_USER_PREMIUM_ITEM';
    }
    if (CurrentUser.isAuthenticated && !CurrentUser.isPremiumUser) {
      return 'NON_PREMIUM_USER_PREMIUM_ITEM';
    }
  }

  if (ownedItemInstances?.length) {
    return 'ITEM_ALREADY_OWNED';
  }
  if (!itemDetails.isPurchasable) return 'NOT_FOR_SALE';
  return 'REGULAR';
}

export function useResellers(
  itemDetails?: TAssetItemDetails | TBundleItemDetails
): { resellers: TResellerItem[] | null } {
  const [resellers, setResellers] = useState<TResellerItem[] | null>(null);
  const { getResellers } = ItemDetailsInfoService;
  useEffect(
    () => {
      if (!itemDetails?.id || !itemDetails.itemRestrictions) return;
      if (isCollectible(itemDetails.itemRestrictions)) return;
      if (!isLimited(itemDetails.itemRestrictions) && !isCollectible(itemDetails.itemRestrictions))
        return;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        try {
          const result = await getResellers(itemDetails.id);
          if (result.data) {
            setResellers(result.data);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemDetails?.id]
  );
  return { resellers };
}

export function useItemPricing(
  itemDetails: TAssetItemDetails | TBundleItemDetails,
  collectibleItemDetails: TAssetItemDetails | TBundleItemDetails | undefined,
  permissions: TUserItemPermissions,
  ownedItemInstances: TOwnedItemInstance[],
  originalItemDetail: boolean,
  isExperienceLinkEnabled: boolean
): TItemPricing {
  const result = useMemo(
    () => {
      const isItemLimited = isLimited(itemDetails.itemRestrictions);
      const isItemCollectible = isCollectible(itemDetails.itemRestrictions);
      const resaleRestriction = collectibleItemDetails
        ? collectibleItemDetails.resaleRestriction
        : ResaleRestriction.NONE;
      const showResellerPrice =
        (isItemLimited && typeof itemDetails.lowestPrice === 'number') ||
        (isItemCollectible &&
          itemDetails.hasResellers &&
          resaleRestriction !== ResaleRestriction.DISABLED);
      const priceDisplayMode = genPriceDisplayMode(
        itemDetails,
        ownedItemInstances,
        permissions,
        originalItemDetail,
        isExperienceLinkEnabled
      );

      if (priceDisplayMode === 'COLLECTIBLE_IN_EXPERIENCE_ONLY_ORIGINAL') {
        return {
          priceDisplayMode,
          price: itemDetails.price ?? null,
          saleLocationType: itemDetails.saleLocationType ?? null,
          unitsAvailableForConsumption: itemDetails.unitsAvailableForConsumption ?? null,
          totalQuantity: itemDetails.totalQuantity ?? null
        };
      }

      if (nonPurchasableDisplayModes.includes(priceDisplayMode)) {
        return {
          priceDisplayMode,
          price: itemDetails.price ?? null,
          saleLocationType: itemDetails.saleLocationType ?? null
        };
      }

      if (typeof itemDetails.premiumPricing?.premiumPriceInRobux === 'number') {
        return {
          priceDisplayMode,
          price: itemDetails.price ?? null,
          premiumPrice: itemDetails.premiumPricing.premiumPriceInRobux,
          premiumDiscountPercentage: itemDetails.premiumPricing.premiumDiscountPercentage,
          saleLocationType: itemDetails.saleLocationType ?? null
        };
      }
      if (
        (isItemLimited && priceDisplayMode === 'LIMITED_WITH_CONSUMABLE') ||
        (isItemCollectible && priceDisplayMode === 'COLLECTIBLE_ONLY_ORIGINAL')
      ) {
        return {
          priceDisplayMode,
          price: itemDetails.price ?? null,
          unitsAvailableForConsumption: itemDetails.unitsAvailableForConsumption ?? null,
          totalQuantity: itemDetails.totalQuantity ?? null,
          saleLocationType: itemDetails.saleLocationType ?? null
        };
      }
      if (showResellerPrice) {
        return {
          priceDisplayMode,
          price: itemDetails.price ?? null,
          lowestPrice: itemDetails.lowestPrice,
          lowestResalePrice: itemDetails.lowestResalePrice,
          unitsAvailableForConsumption: itemDetails.unitsAvailableForConsumption ?? null,
          totalQuantity: itemDetails.totalQuantity ?? null,
          saleLocationType: itemDetails.saleLocationType ?? null
        };
      }
      return {
        priceDisplayMode,
        price: itemDetails.price ?? null,
        saleLocationType: itemDetails.saleLocationType ?? null
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      !!itemDetails,
      itemDetails?.price,
      itemDetails?.lowestResalePrice,
      itemDetails?.saleLocationType,
      permissions?.isPurchaseEnabled,
      ownedItemInstances?.length
    ]
  );
  return result;
}
