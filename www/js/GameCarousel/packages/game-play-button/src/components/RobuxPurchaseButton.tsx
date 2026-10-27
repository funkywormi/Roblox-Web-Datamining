import React, { useCallback, useRef } from "react";
import { ValidHttpUrl } from "@rbx/core-scripts/util/url";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import "@rbx/core-scripts/global";
import { createItemPurchase } from "@rbx/purchase-common/create-item-purchase";
import { Thumbnail2d, ThumbnailGameIconSize } from "@rbx/www-common/components/thumbnail";
import { TGetProductDetails, TGetProductInfo } from "../types/playButtonTypes";
import { TButtonWidth } from "../constants/buttonWidths";
import PurchaseButtonUI from "./PurchaseButtonUI";

const getPrice = (productInfo?: TGetProductInfo): string => productInfo?.price.toString() ?? "";

interface RobuxPurchaseButtonProps {
  universeId: string;
  iconClassName?: string;
  buttonWidth?: TButtonWidth;
  buttonClassName?: string;
  hideButtonText?: boolean;
  redirectPurchaseUrl?: ValidHttpUrl;
  productDetails: TGetProductDetails;
  productInfo: TGetProductInfo;
  translate: TranslateFunction;
  refetchPlayabilityStatus: () => void;
}

const RobuxPurchaseButton: React.FC<RobuxPurchaseButtonProps> = ({
  universeId,
  iconClassName,
  buttonWidth,
  buttonClassName,
  hideButtonText,
  redirectPurchaseUrl,
  productDetails,
  productInfo,
  translate,
  refetchPlayabilityStatus,
}) => {
  const itemPurchaseRef = useRef<ReturnType<typeof createItemPurchase> | undefined>(undefined);
  itemPurchaseRef.current ??= createItemPurchase();
  const [ItemPurchase, itemPurchaseService] = itemPurchaseRef.current;

  const startRobuxPurchase = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      itemPurchaseService.start();
    },
    [itemPurchaseService],
  );

  return (
    <React.Fragment>
      <PurchaseButtonUI
        buttonWidth={buttonWidth}
        buttonClassName={buttonClassName}
        iconClassName={iconClassName}
        hideButtonText={hideButtonText}
        buttonContent={getPrice(productInfo)}
        onClick={redirectPurchaseUrl ? undefined : startRobuxPurchase}
        redirectUrl={redirectPurchaseUrl}
      />
      <ItemPurchase
        {...{
          translate,
          productId: productInfo.productId,
          expectedPrice: productInfo.price,
          thumbnail: (
            <Thumbnail2d
              type="GameIcon"
              size={ThumbnailGameIconSize.size150}
              targetId={universeId}
              imgClassName="game-card-thumb"
            />
          ),
          assetName: productDetails.name,
          assetType: "Place",
          sellerName: productDetails.builder,
          expectedCurrency: 1,
          expectedSellerId: productInfo.sellerId,
          onPurchaseSuccess: refetchPlayabilityStatus,
          isPlace: true,
        }}
      />
    </React.Fragment>
  );
};

export default RobuxPurchaseButton;
