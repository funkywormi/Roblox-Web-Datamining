import React, { useCallback, useMemo } from 'react';
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailGamePassIconSize,
  ThumbnailTypes
} from '@rbx/thumbnails';
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Button } from '@rbx/ui';
import { createItemPurchase } from '@rbx/legacy-webapp-types/roblox-item-purchase';
import { TDeveloperProductDetails, TDiscount } from '../../common/types/types';
import { TGetGameDetails } from '../../common/types/bedev1Types';
import { FeatureDeveloperProducts } from '../../common/constants/translationConstants';

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

type DeveloperProductDetailsBuyButtonProps = {
  developerProductDetailsData: TDeveloperProductDetails;
  gameDetails: TGetGameDetails;
  translate: TranslateFunction;
};

const DeveloperProductMetadataAndBuy = ({
  translate,
  developerProductDetailsData,
  gameDetails
}: DeveloperProductDetailsBuyButtonProps): JSX.Element => {
  const [ItemPurchase, itemPurchaseService] = createItemPurchase();

  const onPurchase = useCallback(() => {
    itemPurchaseService.start();
  }, [itemPurchaseService]);

  const thumbnailForPurchaseDialog = useMemo(() => {
    return (
      <Thumbnail2d
        type={ThumbnailTypes.developerProductIcon}
        size={ThumbnailGamePassIconSize.size150}
        targetId={developerProductDetailsData.TargetId}
        format={ThumbnailFormat.webp}
        altName={developerProductDetailsData.Name}
        imgClassName='thumbnail'
        containerClass='gear-passes-asset'
      />
    );
  }, [developerProductDetailsData.Name, developerProductDetailsData.TargetId]);

  return (
    <React.Fragment>
      <Button
        variant='contained'
        className='buy-button'
        data-product-id={developerProductDetailsData.ProductId}
        onClick={onPurchase}>
        {translate(FeatureDeveloperProducts.LabelBuy)}
      </Button>
      <ItemPurchase
        translate={translate}
        thumbnail={thumbnailForPurchaseDialog}
        productId={developerProductDetailsData.ProductId}
        assetName={developerProductDetailsData.Name}
        assetType='Product'
        sellerName={gameDetails.creator.name}
        expectedCurrency={1}
        expectedSellerId={gameDetails.creator.id} // sellerId is not used in dev product purchase request
        expectedPrice={developerProductDetailsData.PriceInRobux}
        saleLocationId={gameDetails.id}
        showSuccessBanner={false}
        discountInformation={toDiscountInformation(
          developerProductDetailsData.PriceInRobux,
          developerProductDetailsData.PriceDiscountDetails,
        )}
      />
    </React.Fragment>
  );
};

export default DeveloperProductMetadataAndBuy;
