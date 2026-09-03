import React, { useCallback, useMemo } from "react";
import { Button } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGamePassIconSize,
} from "@rbx/thumbnails";
import { FeatureDeveloperProducts } from "../../common/constants/translationConstants";
import developerProductConstants from "../constants/developerProductConstants";
import { TDeveloperProduct, TDiscount } from "../types/developerProductTypes";
import DeveloperProductPendingBadge from "./DeveloperProductPendingBadge";

type DiscountInformation = {
  originalPrice: number;
  totalDiscountAmount: number;
  totalDiscountPercentage: number;
  discounts: Array<{
    discountAmount?: number;
    discountPercentage?: number;
    discountCampaign?: string;
    localizedDiscountAttribution?: string;
  }>;
};

const toDiscountInformation = (
  priceInRobux: number,
  priceDiscountDetails: TDiscount[] | null | undefined,
): DiscountInformation | null => {
  if (!priceDiscountDetails?.length) return null;

  const totalDiscountAmount = priceDiscountDetails.reduce(
    (sum, d) => sum + (d.AmountInRobux ?? 0),
    0,
  );

  return {
    originalPrice: priceInRobux + totalDiscountAmount,
    totalDiscountAmount,
    totalDiscountPercentage: priceDiscountDetails.reduce((sum, d) => sum + (d.Percent ?? 0), 0),
    discounts: priceDiscountDetails.map(d => ({
      discountAmount: d.AmountInRobux,
      discountPercentage: d.Percent,
      discountCampaign: d.Type,
      localizedDiscountAttribution: d.localizedDiscountAttribution,
    })),
  };
};

type TDeveloperProductCardProps = {
  developerProduct: TDeveloperProduct;
  translate: TranslateFunction;
  sellerName: string;
  sellerId: number;
  universeId: number;
  pendingCount: number;
};

const DeveloperProductCard = ({
  developerProduct,
  sellerName,
  sellerId,
  universeId,
  translate,
  pendingCount,
}: TDeveloperProductCardProps): JSX.Element | null => {
  const [ItemPurchase, itemPurchaseService] = window.RobloxItemPurchase.createItemPurchase();
  const developerProductDetailsLink = developerProductConstants.url.developerProductDetailsPage(
    universeId.toString(),
    developerProduct.productId.toString(),
  ).url;
  const thumbnailComponent = useMemo(() => {
    return (
      <Thumbnail2d
        type={ThumbnailTypes.developerProductIcon}
        size={ThumbnailGamePassIconSize.size150}
        targetId={developerProduct.targetId}
        format={ThumbnailFormat.webp}
        altName={developerProduct.name}
        imgClassName="thumbnail"
        containerClass="gear-passes-asset"
      />
    );
  }, [developerProduct.name, developerProduct.targetId]);

  const onPurchase = useCallback(() => {
    itemPurchaseService.start();
  }, [itemPurchaseService]);

  return (
    <li className="list-item developer-product-tile">
      <div className="store-card">
        <div className="store-product-card-thumbnail">
          <a href={developerProductDetailsLink}>{thumbnailComponent}</a>
          {pendingCount ? (
            <DeveloperProductPendingBadge
              count={pendingCount}
              translate={translate}
              productId={developerProduct.productId}
            />
          ) : null}
        </div>
        <div className="store-product-card-caption">
          <div className="store-product-card-name" title={developerProduct.name}>
            {developerProduct.name}
          </div>
          <div className="store-card-price">
            <span className="icon-robux-16x16" />
            <span className="text-robux">{developerProduct.priceInRobux}</span>
          </div>
          <div className="store-card-footer">
            <Button
              data-product-id={developerProduct.productId}
              onClick={onPurchase}
              className="PurchaseButton btn-buy-md btn-full-width rbx-gear-passes-purchase"
            >
              <span>{translate(FeatureDeveloperProducts.LabelBuy)}</span>
            </Button>
            <ItemPurchase
              translate={translate}
              thumbnail={thumbnailComponent}
              productId={developerProduct.productId}
              assetName={developerProduct.name}
              assetType="Product"
              sellerName={sellerName}
              expectedCurrency={1}
              expectedSellerId={sellerId} // sellerId is not used in dev product purchase request
              expectedPrice={developerProduct.priceInRobux}
              saleLocationId={universeId}
              showSuccessBanner={false}
              discountInformation={toDiscountInformation(
                developerProduct.priceInRobux,
                developerProduct.priceDiscountDetails,
              )}
            />
          </div>
        </div>
      </div>
    </li>
  );
};

export default DeveloperProductCard;
