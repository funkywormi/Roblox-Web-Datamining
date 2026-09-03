/* eslint-disable no-param-reassign */
import { useMemo } from "react";
import { isPremiumUser } from "@rbx/core-scripts/meta/user";
import { BuyRobuxPageData, CollectibleItemMetadata, Product } from "../types/buyRobuxPageData";

import type { LimitedTimeBonusItemFields } from "../contexts/BuyRobuxPageContext";

export type BuyRobuxPage = {
  limitedTimeBonusItem: LimitedTimeBonusItemFields;
  bonusItemDisplayName: string | undefined;
  bonusItemId: number | undefined;
  bonusItemRootPlaceId: number | undefined;
  giftingUrl: string;
  isSubscriber: boolean;
  productIds: string[];
  sectionNames: string[];
  subscriptionProductIds: string[];
  upsellProduct: Product | undefined;
  collectibleBonusItemMetadata: CollectibleItemMetadata | undefined;
  productBadgeSlotCount: number;
  atLeastOneProductHasBonusAmount: boolean;
} & BuyRobuxPageData;

export function useBuyRobuxPage(
  buyRobuxPageData: BuyRobuxPageData,
  urlSearchParams: URLSearchParams,
): BuyRobuxPage {
  // isPremiumUser returns true if the user is either a Premium or a Plus subscriber.
  const isSubscriber = isPremiumUser();

  const [bonusItemId, bonusItemDisplayName, bonusItemRootPlaceId] = useMemo(() => {
    const bonusItem = buyRobuxPageData.sections.find(section => section.personalizedBonus)
      ?.personalizedBonus?.bonuses[0];
    if (!bonusItem) {
      return [];
    }

    const { gamePassMetadata, virtualPurchasingProductTargetId } = bonusItem;
    if (!gamePassMetadata) {
      return [virtualPurchasingProductTargetId];
    }

    const { gamePassDisplayName, rootPlaceId } = gamePassMetadata;
    return [virtualPurchasingProductTargetId, gamePassDisplayName, rootPlaceId];
  }, [buyRobuxPageData.sections]);

  const limitedTimeBonusItem: LimitedTimeBonusItemFields = useMemo(
    () =>
      buyRobuxPageData.sections.reduce<LimitedTimeBonusItemFields>(
        (acc, section) => {
          for (const b of section.limitedTimeBonus?.limitedTimeBonuses ?? []) {
            const meta = b.displayableBonus.collectibleItemMetadata;
            const id =
              b.displayableBonus.universalProductIdentifier?.targetIdentifier ??
              b.displayableBonus.virtualPurchasingProductTargetId ??
              "";

            acc.ids.push(id);
            if (meta?.backgroundImage2dUrl) acc.bannerImageUrls.push(meta.backgroundImage2dUrl);
            if (meta?.creatorDisplayName) acc.creatorDisplayNames.push(meta.creatorDisplayName);
            if (meta?.translationKey) acc.displayNames.push(meta.translationKey);
            if (meta?.image2dUrl) acc.imageUrls.push(meta.image2dUrl);
          }
          return acc;
        },
        { bannerImageUrls: [], creatorDisplayNames: [], displayNames: [], ids: [], imageUrls: [] },
      ),
    [buyRobuxPageData.sections],
  );

  const collectibleBonusItemMetadata: CollectibleItemMetadata | undefined = useMemo(() => {
    const bonusItem = buyRobuxPageData.sections.find(section => section.personalizedBonus)
      ?.personalizedBonus?.bonuses[0];
    if (!bonusItem) {
      return undefined;
    }

    return bonusItem.collectibleItemMetadata;
  }, [buyRobuxPageData.sections]);

  const productIdParam = urlSearchParams.get("product_id");
  const [productIds, upsellProduct] = useMemo(
    () =>
      buyRobuxPageData.sections.reduce<[string[], Product | undefined]>(
        ([products, upsell], section) => {
          const ids = section.products?.map(product => {
            if (product.productId === productIdParam) {
              upsell = product;
            }

            return product.productId;
          });

          return ids ? [[...products, ...ids], upsell] : [products, upsell];
        },
        [[], undefined],
      ),
    [buyRobuxPageData.sections, productIdParam],
  );

  const giftingUrl = useMemo(
    () =>
      buyRobuxPageData.sections.find(({ robuxGift }) => robuxGift?.giftingUrl)?.robuxGift
        ?.giftingUrl ?? "",
    [buyRobuxPageData.sections],
  );

  // Pass sectionType strings directly - ML handles the mapping
  const sectionNames = useMemo(
    () => buyRobuxPageData.sections.map(({ sectionType }) => sectionType),
    [buyRobuxPageData.sections],
  );

  const subscriptionProductIds = useMemo(
    () =>
      buyRobuxPageData.sections.flatMap(
        section => section.subscriptionV2?.products.map(p => p.subscriptionProductId) ?? [],
      ),
    [buyRobuxPageData.sections],
  );

  // Every product row reserves the same number of badge slots so the rows stay aligned, and the
  // row can only go horizontal once there is width for that many badges. Two independent badge
  // kinds can appear: the inline badge and the bonus-Robux tag.
  const { productBadgeSlotCount, atLeastOneProductHasBonusAmount } = useMemo(() => {
    const products = buyRobuxPageData.sections.flatMap(section => section.products ?? []);
    const hasInlineBadge = products.some(
      ({ inlineBadgeTranslationKey }) => inlineBadgeTranslationKey,
    );
    const hasBonusAmount = products.some(({ bonusRobuxAmount }) => bonusRobuxAmount);

    return {
      productBadgeSlotCount: Number(hasInlineBadge) + Number(hasBonusAmount),
      atLeastOneProductHasBonusAmount: hasBonusAmount,
    };
  }, [buyRobuxPageData.sections]);

  return {
    limitedTimeBonusItem,
    bonusItemDisplayName,
    bonusItemId,
    bonusItemRootPlaceId,
    giftingUrl,
    isSubscriber,
    productIds,
    sectionNames,
    subscriptionProductIds,
    upsellProduct,
    collectibleBonusItemMetadata,
    productBadgeSlotCount,
    atLeastOneProductHasBonusAmount,
    ...buyRobuxPageData,
  };
}
