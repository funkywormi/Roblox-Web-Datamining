import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createSystemFeedback } from 'react-style-guide';
import * as itemPurchase from 'roblox-item-purchase';
import { TranslateFunction, withTranslations, WithTranslationsProps } from 'react-utilities';
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat
} from 'roblox-thumbnails';
import { eventStreamService } from 'core-roblox-utilities';
import { CurrentUser, AXAnalyticsService, AXSendTrackingActionType } from 'Roblox';
import translationConfig from '../translation.config';
import { trackPurchaseButtonClick, TPurchaseSource } from '../../analytics/axTrackingEvents';

type TAngularToReactPurchaseHandoffContainerProps = {
  identifier: string | null;
};

type TItemPurchaseParams = {
  translate: TranslateFunction;
  productId: number;
  expectedCurrency: number;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  expectedSellerId: number;
  sellerName: string;
  showSuccessBanner?: boolean;
  onPurchaseSuccess?: () => void;
  collectibleItemId?: string | null;
  collectibleItemInstanceId?: string | null;
  collectibleProductId?: string | null;
  sellerType?: string | null;
  // assetTypeDisplayName?: string;
  // expectedPromoId?: number;
  userAssetId?: number;
  isLimited?: boolean;
  // handlePurchase?: () => void;
  // customProps?: () => void;
};

type TAngularToReactLimited2ResellerPurchase = {
  identifier: string;
  productId: number;
  name: string;
  itemType: string;
  assetId: number;
  assetType: string;
  collectibleItemId: string;
  collectibleItemInstanceId: string;
  collectibleProductId: string;
  expectedCurrency: number;
  expectedPrice: number;
  expectedPurchaserId: number;
  expectedPurchaserType: string;
  expectedSellerId: number;
  expectedSellerName: string;
  expectedSellerType: string;
  userAssetId: number;
  idempotencyKey: string;
  refreshPage: boolean;
  resalePurchase: boolean;
};

declare global {
  interface WindowEventMap {
    'angular-to-react-purchase-event': CustomEvent<TAngularToReactLimited2ResellerPurchase>;
  }
}

const { AXAnalyticsConstants } = AXAnalyticsService;
const { createItemPurchase } = itemPurchase;
const [ItemPurchase, itemPurchaseService] = createItemPurchase();

export const AngularToReactPurchaseHandoffContainer = ({
  identifier,
  translate
}: TAngularToReactPurchaseHandoffContainerProps & WithTranslationsProps): JSX.Element | null => {
  const [itemPurchaseParams, setItemPurchaseParams] = useState<TItemPurchaseParams>();
  const [eventIdentifier, setEventIdentifier] = useState<string>();
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

  const onPurchaseSuccess = reloadPage => {
    if (reloadPage) {
      window.location.reload();
    } else {
      window.dispatchEvent(new CustomEvent(`navigation-update-user-currency`));
    }
  };

  function createItemPurchaseParams(
    itemData: TAngularToReactLimited2ResellerPurchase
  ): TItemPurchaseParams {
    setEventIdentifier(itemData.identifier);
    return {
      translate,
      productId: itemData.productId,
      expectedPrice: itemData.expectedPrice,
      thumbnail: (
        <Thumbnail2d
          type={
            itemData.itemType.toLowerCase() === 'asset'
              ? ThumbnailTypes.assetThumbnail
              : ThumbnailTypes.bundleThumbnail
          }
          size={DefaultThumbnailSize}
          targetId={itemData.assetId}
          imgClassName=''
          format={ThumbnailFormat.webp}
        />
      ),
      assetName: itemData.name,
      assetType: itemData.assetType,
      sellerName: itemData.expectedSellerName,
      sellerType: itemData.expectedSellerType,
      expectedCurrency: 1,
      expectedSellerId: itemData.expectedSellerId,
      collectibleItemId: itemData.collectibleItemId,
      collectibleProductId: itemData.collectibleProductId,
      collectibleItemInstanceId: itemData.collectibleItemInstanceId,
      showSuccessBanner: true,
      userAssetId: itemData.userAssetId,
      isLimited: true, // Resellers items are limited
      onPurchaseSuccess: () => {
        const params = {
          totalTransactionValue: itemData.expectedPrice,
          transactionItems: JSON.stringify([
            {
              itemType: itemData.itemType,
              subType: itemData.assetType,
              itemId: itemData.assetId,
              resalePurchase: itemData.resalePurchase,
              // Direct resale is always a reseller purchase of a limited item,
              // and resale copies never carry a timed option.
              isLimited: true,
              isTimedOptionPurchase: false
            }
          ]),
          purchaseType: itemData.identifier,
          userId: CurrentUser.userId
        };
        // Sending 2 events - one for metadata and one for counters
        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.PurchaseSuccessDirectResale,
          excludeTelemetry: true
        });

        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.PurchaseSuccess,
          counterName: AXAnalyticsConstants.PurchaseSuccessDirectResale,
          metaData: {
            metaData: JSON.stringify(params),
            totalValue: itemData.expectedPrice
          },
          actionType: AXSendTrackingActionType.Click
        });
        eventStreamService.sendEvent(
          {
            name: 'marketplaceWebPurchaseSuccess',
            type: 'marketplaceWebPurchaseSuccess',
            context: 'marketplaceWebPurchase'
          },
          params
        );
        onPurchaseSuccess(itemData.refreshPage);
      }
    };
  }

  useEffect(() => {
    window.addEventListener(`angular-to-react-purchase-event`, event => {
      // The resale buy button lives in Angular; receiving this handoff event is
      // the click. Success is tracked via the existing purchase-success event.
      const itemData = event.detail;
      trackPurchaseButtonClick(TPurchaseSource.DirectResale, {
        totalTransactionValue: itemData.expectedPrice,
        transactionItems: JSON.stringify([
          {
            itemType: itemData.itemType,
            subType: itemData.assetType,
            itemId: itemData.assetId,
            resalePurchase: itemData.resalePurchase,
            // Direct resale is always a reseller purchase of a limited item,
            // and resale copies never carry a timed option.
            isLimited: true,
            isTimedOptionPurchase: false
          }
        ]),
        purchaseType: itemData.identifier,
        userId: CurrentUser.userId
      });
      setItemPurchaseParams(createItemPurchaseParams(itemData));
    });
  }, []);

  useEffect(() => {
    if (identifier === eventIdentifier && itemPurchaseParams) {
      itemPurchaseService.start();
    }
  }, [itemPurchaseParams, eventIdentifier, identifier]);

  return (
    <React.Fragment>
      <SystemFeedback />
      {itemPurchaseParams && <ItemPurchase {...itemPurchaseParams} />}
    </React.Fragment>
  );
};

export default withTranslations(AngularToReactPurchaseHandoffContainer, translationConfig);
