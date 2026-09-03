import React, { useCallback, useRef } from "react";
import { ValidHttpUrl } from "@rbx/core-scripts/util/url";
import { Button } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import "@rbx/core-scripts/global";
import {
  DefaultThumbnailSize,
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import { TGetProductDetails, TGetProductInfo, ValueOf } from "../types/playButtonTypes";
import PurchaseButtonUI from "./PurchaseButtonUI";

const getPrice = (productInfo?: TGetProductInfo): string => productInfo?.price.toString() ?? "";

interface RobuxPurchaseButtonProps {
  universeId: string;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
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
  const itemPurchaseRef = useRef<ReturnType<typeof window.RobloxItemPurchase.createItemPurchase>>();
  itemPurchaseRef.current ??= window.RobloxItemPurchase.createItemPurchase();
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
              type={ThumbnailTypes.gameIcon}
              size={DefaultThumbnailSize}
              targetId={parseInt(universeId, 10)}
              imgClassName="game-card-thumb"
              format={ThumbnailFormat.jpeg}
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
