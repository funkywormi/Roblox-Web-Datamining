import { LimitedTimeBonusItemFields } from "../contexts/BuyRobuxPageContext";
import {
  BuyRobuxPageData,
  CollectibleItemMetadata,
  EnhancedBuyRobuxPageData,
  Product,
  Section,
} from "../types/buyRobuxPageData";

type EnhancedBuyRobuxPageDataParams = {
  buyRobuxPageData: BuyRobuxPageData;
  isSubscriber: boolean;
  urlProductId?: string;
};

const getBonusItemData = (sections: Section[]) => {
  const bonusItem = sections.find(section => section.personalizedBonus)?.personalizedBonus
    ?.bonuses[0];
  if (!bonusItem) {
    return {};
  }

  const { gamePassMetadata, virtualPurchasingProductTargetId } = bonusItem;
  if (!gamePassMetadata) {
    return { virtualPurchasingProductTargetId };
  }

  const { gamePassDisplayName, rootPlaceId } = gamePassMetadata;
  return {
    virtualPurchasingProductTargetId,
    bonusItemDisplayName: gamePassDisplayName,
    rootPlaceId,
  };
};

export const getLimitedTimeBonusItem = (sections: Section[]): LimitedTimeBonusItemFields => {
  return sections.reduce<LimitedTimeBonusItemFields>(
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
  );
};

const getCollectibleBonusItemMetadata = (
  sections: Section[],
): CollectibleItemMetadata | undefined => {
  const bonusItem = sections.find(section => section.personalizedBonus)?.personalizedBonus
    ?.bonuses[0];
  if (!bonusItem) {
    return undefined;
  }

  return bonusItem.collectibleItemMetadata;
};

const splitProductIdsAndUpsellProduct = (
  sections: Section[],
  productIdParam?: string,
): [string[], Product | undefined] => {
  return sections.reduce<[string[], Product | undefined]>(
    ([products, upsell], section) => {
      let currentUpsell = upsell;
      const ids = section.products?.map(product => {
        if (product.productId === productIdParam) {
          currentUpsell = product;
        }

        return product.productId;
      });

      return ids ? [[...products, ...ids], currentUpsell] : [products, currentUpsell];
    },
    [[], undefined],
  );
};

export const getEnhancedBuyRobuxPageData = ({
  buyRobuxPageData,
  isSubscriber,
  urlProductId,
}: EnhancedBuyRobuxPageDataParams): EnhancedBuyRobuxPageData => {
  const bonusItemData = getBonusItemData(buyRobuxPageData.sections);
  const limitedTimeBonusItem: LimitedTimeBonusItemFields = getLimitedTimeBonusItem(
    buyRobuxPageData.sections,
  );
  const collectibleBonusItemMetadata: CollectibleItemMetadata | undefined =
    getCollectibleBonusItemMetadata(buyRobuxPageData.sections);

  const [productIds, upsellProduct] = splitProductIdsAndUpsellProduct(
    buyRobuxPageData.sections,
    urlProductId,
  );

  const giftingUrl =
    buyRobuxPageData.sections.find(({ robuxGift }) => robuxGift?.giftingUrl)?.robuxGift
      ?.giftingUrl ?? "";

  // Pass sectionType strings directly - ML handles the mapping
  const sectionNames = buyRobuxPageData.sections.map(({ sectionType }) => sectionType);

  const subscriptionProductIds = buyRobuxPageData.sections.flatMap(
    section => section.subscriptionV2?.products.map(p => p.subscriptionProductId) ?? [],
  );

  // Every product row reserves the same number of badge slots so the rows stay aligned, and the
  // row can only go horizontal once there is width for that many badges. Two independent badge
  // kinds can appear: the inline badge and the bonus-Robux tag.

  const products = buyRobuxPageData.sections.flatMap(section => section.products ?? []);
  const hasInlineBadge = products.some(
    ({ inlineBadgeTranslationKey }) => inlineBadgeTranslationKey,
  );
  const hasBonusAmount = products.some(({ bonusRobuxAmount }) => bonusRobuxAmount);

  const productBadgeSlotCount = Number(hasInlineBadge) + Number(hasBonusAmount);
  const atLeastOneProductHasBonusAmount = hasBonusAmount;

  return {
    limitedTimeBonusItem,
    bonusItemDisplayName: bonusItemData.bonusItemDisplayName,
    bonusItemId: bonusItemData.virtualPurchasingProductTargetId,
    bonusItemRootPlaceId: bonusItemData.rootPlaceId,
    giftingUrl,
    isSubscriber,
    productIds,
    sectionNames,
    subscriptionProductIds,
    upsellProduct,
    collectibleBonusItemMetadata,
    productBadgeSlotCount,
    atLeastOneProductHasBonusAmount,
    buyRobuxPageData,
  };
};
