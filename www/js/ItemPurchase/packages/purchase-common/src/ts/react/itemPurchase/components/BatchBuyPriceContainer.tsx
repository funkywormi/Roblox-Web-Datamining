import { useEffect, useState } from "react";
import { isAuthenticated, userId } from "@rbx/core-scripts/meta/user";
import batchLoadItemDetails from "../factories/batchLoadItemDetails";
import itemDetailsService from "../services/itemDetailsService";
import { BatchBuyItemsButton } from "./BatchBuyItems";
import type { TButtonVariant, TButtonSize } from "./BatchBuyItems";
import { SelfProvidedTranslate } from "../SelfProvidedTranslate";
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from "../useTranslate";
import type {
  BatchPurchaseItem,
  BatchPurchaseItemResult,
  MarketplaceOfferPricing,
  SystemFeedbackService,
} from "../types/batchPurchase";
import type { ParsedItemDetail } from "../types/itemDetails";
import "../../../../css/tailwind.css";

export type TBatchPurchaseItem = BatchPurchaseItem;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export type TMarketplaceOfferPricing = MarketplaceOfferPricing;

export type BatchBuyPriceContainerProps = {
  items: TBatchPurchaseItem[];
  purchaseMetadata: Map<string, string | undefined>;
  marketplaceOfferPricing?: TMarketplaceOfferPricing;
  systemFeedbackService: SystemFeedbackService;
  onBuyButtonClick?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onTransactionComplete?: (results: BatchPurchaseItemResult[]) => void;
  productSurface?: string;
  displayPriceOnButton?: boolean;
  variant?: TButtonVariant;
  size?: TButtonSize;
  // Host-supplied translator. Next.js passes one sourced from next-intl; when omitted the
  // component self-sources from window.Roblox.Lang via TranslationProviderSCC, the .NET path.
  translate?: PurchaseTranslate;
};

const PriceContainer = ({
  items,
  purchaseMetadata,
  marketplaceOfferPricing = {},
  systemFeedbackService,
  onBuyButtonClick = noop,
  onConfirm = noop,
  onCancel = noop,
  onTransactionComplete = noop,
  productSurface = "SHOPPING_CART_WEB",
  displayPriceOnButton = false,
  variant = "Emphasis",
  size = "Large",
  translate,
}: BatchBuyPriceContainerProps & { translate: PurchaseTranslate }) => {
  const [currentUserBalance, setCurrentUserBalance] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated()) {
      itemDetailsService
        .getCurrentUserBalance(userId()!)
        .then(result => {
          setCurrentUserBalance(result.data.robux);
        })
        .catch(() => {
          setCurrentUserBalance(undefined);
        });
    }
  }, []);

  const { itemDetails } = batchLoadItemDetails(items);

  return (
    <BatchBuyItemsButton
      currentUserBalance={currentUserBalance}
      items={items}
      // Only the load-failure sentinel is partial; BatchBuyItems handles it before reading ids.
      itemDetails={itemDetails as ParsedItemDetail[]}
      purchaseMetadata={purchaseMetadata}
      marketplaceOfferPricing={marketplaceOfferPricing}
      systemFeedbackService={systemFeedbackService}
      onBuyButtonClick={onBuyButtonClick}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onTransactionComplete={onTransactionComplete}
      productSurface={productSurface}
      displayPriceOnButton={displayPriceOnButton}
      translate={translate}
      variant={variant}
      size={size}
    />
  );
};

// Translation is injectable so the same component works on both platforms:
//  - Next.js: host passes `translate` (from next-intl) — no window.Roblox dependency.
//  - .NET / window.RobloxItemPurchase: omit it and we self-wrap in TranslationProviderSCC,
//    matching the old withTranslations behavior (non-breaking).
const BatchBuyPriceContainer = ({ translate, ...props }: BatchBuyPriceContainerProps) => (
  <SelfProvidedTranslate
    translate={translate}
    namespaces={purchasingNamespaces}
    useTranslate={usePurchasingTranslate}
    render={t => <PriceContainer {...props} translate={t} />}
  />
);

export default BatchBuyPriceContainer;
