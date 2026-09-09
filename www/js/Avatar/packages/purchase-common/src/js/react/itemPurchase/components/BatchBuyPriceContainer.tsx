import { useEffect, useState } from "react";
import { TranslationProvider, useTranslation } from "@rbx/core-scripts/react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { isAuthenticated, userId } from "@rbx/core-scripts/meta/user";
import type { TSystemFeedbackService } from "@rbx/core-ui/legacy/react-style-guide";
import batchLoadItemDetails from "../factories/batchLoadItemDetails";
import itemDetailsService from "../services/itemDetailsService";
import { BatchBuyItemsButton } from "./BatchBuyItems";
import translationConfig from "../translation.config";
import "../../../../css/tailwind.css";

export type TBatchPurchaseItem = {
  id: number;
  itemType: string;
  timedOption?: { days: number; price: number; selected?: boolean };
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export type BatchBuyPriceContainerProps = {
  items: TBatchPurchaseItem[];
  purchaseMetadata: Map<string, string | undefined>;
  systemFeedbackService: TSystemFeedbackService;
  onBuyButtonClick?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onTransactionComplete?: (results: Record<string, unknown>[]) => void;
  productSurface?: string;
  displayPriceOnButton?: boolean;
  variant?: string;
  size?: string;
  // Host-supplied translator. Next.js passes one sourced from next-intl; when omitted the
  // component self-sources from core-scripts (window.Roblox.Lang), the .NET path.
  translate?: TranslateFunction;
};

const PriceContainer = ({
  items,
  purchaseMetadata,
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
}: BatchBuyPriceContainerProps & { translate: TranslateFunction }) => {
  const [currentUserBalance, setCurrentUserBalance] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated()) {
      itemDetailsService
        .getCurrentUserBalance(userId())
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
      itemDetails={itemDetails}
      purchaseMetadata={purchaseMetadata}
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

// Sources `translate` from core-scripts context for the .NET path.
const PriceContainerFromContext = (props: BatchBuyPriceContainerProps) => {
  const { translate } = useTranslation();
  return <PriceContainer {...props} translate={translate} />;
};

// Translation is injectable so the same component works on both platforms:
//  - Next.js: host passes `translate` (from next-intl) — no window.Roblox dependency.
//  - .NET / window.RobloxItemPurchase: omit it and we self-wrap in core-scripts
//    TranslationProvider, matching the old withTranslations behavior (non-breaking).
const BatchBuyPriceContainer = ({ translate, ...props }: BatchBuyPriceContainerProps) =>
  translate ? (
    <PriceContainer {...props} translate={translate} />
  ) : (
    <TranslationProvider config={translationConfig.purchasingResources}>
      <PriceContainerFromContext {...props} />
    </TranslationProvider>
  );

export default BatchBuyPriceContainer;
