import { escapeHtml } from '@rbx/core-scripts/format/string';
import { RobloxTranslationResource } from '@rbx/legacy-webapp-types/Roblox';
import {
  ItemDetailObject,
  ItemPurchaseAjaxDataObject,
  ItemPurchaseObject
} from '../../constants/serviceTypeDefinitions';
import LoadingOverlay from '../../components/LoadingOverlay';
import { LANG_KEYS } from '../../constants/upsellConstants';
import initiateAutoPurchaseItem from './initiateAutoPurchaseItem';

/** Params for purchasing a collectible directly (no Buy-Robux redirect). */
export type DirectCollectiblePurchaseParams = {
  itemDetail: ItemDetailObject;
  itemPurchaseAjaxData: ItemPurchaseAjaxDataObject;
  /** Discounted price the user agreed to (already reflects selected offers). */
  purchasePrice: number;
  offerIds: string[];
  userBalance: number;
  translationResource: RobloxTranslationResource;
};

/**
 * When applying marketplace offers in the Robux upsell modal drops the price to
 * at/below the user's balance, they don't need to buy Robux. This purchases the
 * collectible directly with the discounted price + offers, then reuses the
 * upsell success modal — without re-entering the `createItemPurchase` flow.
 */
export default async function initiateDirectCollectiblePurchase({
  itemDetail,
  itemPurchaseAjaxData,
  purchasePrice,
  offerIds,
  userBalance,
  translationResource
}: DirectCollectiblePurchaseParams): Promise<void> {
  const dataset = itemDetail.buyButtonElementDataset;

  const item = {
    itemContainerElemClassList: undefined,
    assetType: dataset?.assetType ?? '',
    assetName: escapeHtml(itemDetail.assetName),
    productId: dataset?.productId ?? '',
    expectedPrice: purchasePrice,
    expectedCurrency: Number(dataset?.expectedCurrency) || 1,
    expectedPromoId: undefined,
    expectedSellerId: Number(dataset?.expectedSellerId) || 0,
    userAssetId: dataset?.userassetId ? Number(dataset.userassetId) : undefined,
    context: '',
    isLibrary: false,
    itemThumbnailUrl: itemPurchaseAjaxData.thumbnailImageUrl ?? itemPurchaseAjaxData.imageurl ?? '',
    itemPath: window.location.pathname,
    alertImageUrl: itemPurchaseAjaxData.alerturl ?? '',
    userBalance,
    itemPurchaseAjaxData,
    itemDetail: dataset,
    offerIds: offerIds.length ? offerIds : undefined
  } as ItemPurchaseObject;

  const loadingOverlay = new LoadingOverlay();
  loadingOverlay.show();
  loadingOverlay.updateMessage(translationResource.get(LANG_KEYS.purchasingTheItemLabel, {}));

  await initiateAutoPurchaseItem(item, null, loadingOverlay, translationResource);
}
