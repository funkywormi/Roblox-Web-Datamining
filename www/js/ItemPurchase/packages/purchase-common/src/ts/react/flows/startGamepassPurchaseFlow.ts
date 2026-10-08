import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { Thumbnail2d } from '@rbx/www-common/components/thumbnail';
import { ASSET_TYPE_ENUM } from '../../core/services/itemPurchaseUpsellService/constants/upsellConstants';
import createItemPurchase from '../itemPurchase/factories/createItemPurchase';
import GamepassItemPurchaseWrapper from '../components/GamepassItemPurchaseWrapper';
import type { DiscountInformation } from '../components/discountInformation';

type TGamePassDiscount = {
  discountCampaign?: string;
  localizedDiscountAttribution?: string | null;
  robuxDiscountAmount?: number;
  robuxDiscountPercentage?: number;
};

type TGamePassDiscountInformation = {
  originalPrice?: number;
  totalAmountSaved?: number;
  discounts?: TGamePassDiscount[];
};

const toDiscountInformation = (raw: TGamePassDiscountInformation): DiscountInformation => ({
  originalPrice: raw.originalPrice,
  totalDiscountAmount: raw.totalAmountSaved,
  totalDiscountPercentage:
    raw.totalAmountSaved && raw.originalPrice && raw.originalPrice > 0
      ? raw.totalAmountSaved / raw.originalPrice
      : undefined,
  discounts: raw.discounts?.map(d => ({
    discountAmount: d.robuxDiscountAmount,
    discountPercentage: d.robuxDiscountPercentage,
    discountCampaign: d.discountCampaign,
    localizedDiscountAttribution: d.localizedDiscountAttribution ?? undefined
  }))
});

export type TStartGamepassPurchaseFlowArgs = {
  thumbnail: React.ReactNode;
  imageUrl: string;
  productId: number;
  assetName: string;
  sellerName: string;
  expectedSellerId: number;
  expectedPrice: number;
  iconAssetId: number;
  discountInformation?: TGamePassDiscountInformation | null;
  onPurchaseSuccess?: () => void;
};

export function startGamepassPurchaseFlow(args: TStartGamepassPurchaseFlowArgs): () => void {
  const containerId = 'rbx-gamepass-purchase-root';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const thumbnail = React.createElement(Thumbnail2d, {
    type: 'Asset',
    targetId: args.iconAssetId,
    size: '150x150',
    format: 'webp',
    altName: args.assetName
  });

  const [ItemPurchase, itemPurchaseService] = createItemPurchase() as [
    React.FC<any>,
    { start: () => void }
  ];

  render(
    React.createElement(GamepassItemPurchaseWrapper, {
      ItemPurchase,
      itemPurchaseService,
      innerProps: {
        thumbnail,
        productId: args.productId,
        assetName: args.assetName,
        assetType: ASSET_TYPE_ENUM.GAME_PASS,
        sellerName: args.sellerName,
        expectedCurrency: 1,
        expectedSellerId: args.expectedSellerId,
        expectedPrice: args.expectedPrice,
        discountInformation: args.discountInformation
          ? toDiscountInformation(args.discountInformation)
          : null,
        onPurchaseSuccess: args.onPurchaseSuccess
      }
    }),
    container
  );

  return () => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
    }
  };
}
