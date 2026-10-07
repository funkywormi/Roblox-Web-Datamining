/* eslint-disable react/jsx-no-literals */
// Just for line 49 using '+' for thumbnails representing more than the 3 item thumbnail limit
import React, { Fragment, useState } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize
} from '@rbx/thumbnails';
import { isPremiumUser, userId } from '@rbx/core-scripts/meta/user';
import { generateRandomUuid } from '@rbx/core-lib/uuid';
import { Badge } from '@rbx/foundation-ui';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from '../components/PriceLabel';
import BalanceAfterSaleText from '../components/BalanceAfterSaleText';
import itemPurchaseService from '../services/itemPurchaseService';
import ItemType from '../../enums/ItemType';
import BatchBuyPurchaseResults from '../../enums/BatchBuyPurchaseResults';
import TwoStepVerificationModal from '../components/TwoStepVerificationModal';
import FoundationPurchaseModal from '../components/FoundationPurchaseModal';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { ParsedItemDetail } from '../types/itemDetails';
import type {
  BatchPurchaseItem,
  BatchPurchaseItemResult,
  BatchPurchaseLineItem,
  BulkPurchaseResult,
  MarketplaceOfferPrice,
  MarketplaceOfferPricing,
  SystemFeedbackService,
  TimedOption
} from '../types/batchPurchase';

const { violationLabels } = itemPurchaseConstants;

const {
  resources,
  batchBuyMaxThumbnails,
  purchaseMetadataKeys,
  floodcheckTime
} = itemPurchaseConstants;

interface ItemThumbnailProps {
  itemsCount: number;
  item: ParsedItemDetail;
  index: number;
  timedOption?: TimedOption;
  translate: PurchaseTranslate;
}

function ItemThumbnail({ itemsCount, item, index, timedOption, translate }: ItemThumbnailProps) {
  const itemName = item.name;

  const hasMoreItems = itemsCount > batchBuyMaxThumbnails;
  const moreItemsCount = itemsCount - batchBuyMaxThumbnails;
  const shouldShowOverlay = hasMoreItems && index === batchBuyMaxThumbnails - 1;

  return (
    <div className='modal-multi-item-image-container'>
      {timedOption && (
        <div className='timed-options-badge-container'>
          <Badge
            variant='Neutral'
            icon='icon-regular-clock'
            className='bg-surface-0'
            label={
              timedOption?.days
                ? translate(resources.timedOptionDaysAbbreviation, { days: timedOption.days })
                : ''
            }
          />
        </div>
      )}

      <Thumbnail2d
        type={
          item.itemType.toLowerCase() === ItemType.Bundle
            ? ThumbnailTypes.bundleThumbnail
            : ThumbnailTypes.assetThumbnail
        }
        size={DefaultThumbnailSize}
        targetId={item.id}
        containerClass='batch-buy-thumbnail'
        format={ThumbnailFormat.webp}
        altName={itemName}
      />
      {shouldShowOverlay && (
        <div className='thumb-overlay'>
          <div className='font-header-1'>＋{moreItemsCount}</div>
        </div>
      )}
    </div>
  );
}

const getViolationLabel = (translate: PurchaseTranslate, violation?: string) =>
  translate(
    (violation === undefined
      ? undefined
      : (violationLabels as Record<string, string>)[violation]) ??
      'Label.Sublabel.FraudPaymentAbuse'
  );

const formatEconomicRestrictionErrorResult = (translate: PurchaseTranslate, message: string) => {
  const [, , violation, expirationTimeInMinutes] = message.split('/');
  const timeoutInHours = Math.ceil(Number(expirationTimeInMinutes) / 60);
  if (timeoutInHours > 24) {
    const timeoutInDays = Math.ceil(timeoutInHours / 24);
    return {
      success: false,
      message: 'Text.EconomicRestrictionsDaysGeneral',
      params: {
        violation: getViolationLabel(translate, violation),
        day: timeoutInDays
      }
    };
  }
  return {
    success: false,
    message: 'Text.EconomicRestrictionsHoursGeneral',
    params: {
      violation: getViolationLabel(translate, violation),
      hour: timeoutInHours
    }
  };
};

export function handleResultFromPurchases(
  translate: PurchaseTranslate,
  result: BulkPurchaseResult | undefined,
  startTwoStepVerification: () => void
) {
  // Error handling using systemFeedbackService returns the errors for handling within the feature itself
  let successCount = 0;
  const errorResults: { error: string; count: number }[] = [];

  if (!result) {
    return { success: false, message: resources.purchaseErrorFailureMessage };
  }

  if (result.status === 200) {
    if (
      result.data &&
      result.data.message &&
      result.data.message.startsWith('Error/EconomicRestrictions')
    ) {
      const { message } = result.data;
      return formatEconomicRestrictionErrorResult(translate, message);
    }

    result.data.fulfillmentGroups[0]!.lineItems.forEach(itemResult => {
      if (itemResult.status === 'SUCCEEDED') {
        successCount += 1;
      } else {
        const error = errorResults.find(err => {
          return err.error === itemResult.errorReason;
        });

        if (error) {
          error.count += 1;
        } else {
          errorResults.push({ error: itemResult.errorReason, count: 1 });
        }
      }
    });

    if (successCount === result.data.fulfillmentGroups[0]!.lineItems.length) {
      return { success: true, message: resources.purchaseCompleteHeading };
    }
    let predominantError = { error: '', count: 0 };
    errorResults.forEach(err => {
      if (err.count > predominantError.count) {
        predominantError = err;
      }
    });

    // Partial success, partial failure error messages
    if (successCount > 0) {
      switch (predominantError.error) {
        case BatchBuyPurchaseResults.AlreadyOwned:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessItemsOwnedFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.InsufficientFunds:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessInsufficientFundsFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.ExceptionOccured:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessNetworkErrorFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.TooManyPurchases:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessFloodcheckFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.PremiumNeeded:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessPremiumNeededFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.NoSellers:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessNoSellersFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        case BatchBuyPurchaseResults.InExperienceOnly:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessInExperienceOnlyFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
        default:
          return {
            success: false,
            message: resources.batchBuyPartialSuccessGeneralFailureMessage,
            params: {
              itemCountSuccess: successCount,
              itemCountFailure: predominantError.count
            }
          };
      }
    } else {
      // All purchases failed
      switch (predominantError.error) {
        case BatchBuyPurchaseResults.AlreadyOwned:
          return { success: false, message: resources.batchBuyItemsOwnedFailureMessage };
        case BatchBuyPurchaseResults.InsufficientFunds:
          return { success: false, message: resources.insufficientFundsFailureMessage };
        case BatchBuyPurchaseResults.ExceptionOccured:
          return { success: false, message: resources.networkErrroFailureMessage };
        case BatchBuyPurchaseResults.TooManyPurchases:
          return {
            success: false,
            message: resources.floodcheckFailureMessage,
            params: { throttleTime: floodcheckTime }
          };
        case BatchBuyPurchaseResults.PremiumNeeded:
          return { success: false, message: resources.premiumNeededFailureMessage };
        case BatchBuyPurchaseResults.NoSellers:
          return { success: false, message: resources.noSellersFailureMessage };
        case BatchBuyPurchaseResults.InExperienceOnly:
          return { success: false, message: resources.inExperienceOnlyFailureMessage };
        default:
          return { success: false, message: resources.purchaseErrorFailureMessage };
      }
    }
  } else if (result.status === 403 && result.data.message!.includes('2sv')) {
    startTwoStepVerification();
  } else if (result.status === 400 && result.data.message!.includes('InsufficientTotalBalance')) {
    return { success: false, message: resources.insufficientFundsFailureMessage };
  }

  return { success: false, message: resources.purchaseErrorFailureMessage };
}

export function withMarketplaceOfferPricing(
  itemToPurchase: BatchPurchaseLineItem,
  marketplaceOfferPrice: MarketplaceOfferPrice | undefined
) {
  if (!marketplaceOfferPrice) {
    return null;
  }

  return {
    ...itemToPurchase,
    agreedPriceRobux: marketplaceOfferPrice.priceInRobux,
    ...(marketplaceOfferPrice.offerIds.length > 0
      ? { offerIds: marketplaceOfferPrice.offerIds }
      : {})
  };
}

interface MultiItemPurchaseModalProps {
  translate?: PurchaseTranslate;
  open: boolean;
  title?: string;
  expectedTotalPrice: number;
  items: BatchPurchaseItem[];
  itemDetails: ParsedItemDetail[];
  currentRobuxBalance?: number;
  purchaseMetadata: Map<string, string | undefined>;
  marketplaceOfferPricing?: MarketplaceOfferPricing;
  onCancel: () => void;
  onTransactionComplete: (results: BatchPurchaseItemResult[]) => void;
  onAction: () => void;
  loading?: boolean;
  productSurface: string;
  systemFeedbackService: SystemFeedbackService;
}

export default function createMultiItemPurchaseModal() {
  function MultiItemPurchaseModalInner({
    translate,
    open,
    title,
    expectedTotalPrice,
    items,
    itemDetails,
    currentRobuxBalance,
    purchaseMetadata,
    marketplaceOfferPricing = {},
    onCancel,
    onTransactionComplete,
    onAction,
    loading,
    productSurface,
    systemFeedbackService
  }: MultiItemPurchaseModalProps & { translate: PurchaseTranslate }) {
    let defaultTitle: string;
    let actionButtonText: string;

    const [isTwoStepVerificationActive, setIsTwoStepVerificationActive] = useState(false);
    const startTwoStepVerification = () => {
      systemFeedbackService.loading(translate('Message.TwoStepVerificationBatchPurchase'));
      setIsTwoStepVerificationActive(true);
    };
    const stopTwoStepVerification = () => setIsTwoStepVerificationActive(false);
    const [hasTwoStepVerificationBeenCompleted, setHasTwoStepVerificationBeenCompleted] = useState(
      false
    );

    const assetInfo = {
      itemCount: itemDetails.length,
      robux: renderToString(
        <span className='robux-price'>
          <PriceLabel {...{ price: expectedTotalPrice }} />
        </span>
      )
    };
    const bodyMessageResource = resources.batchBuyPromptMessage;

    if (expectedTotalPrice === 0) {
      defaultTitle = translate(resources.getItemHeading);
      actionButtonText = translate(resources.getNowAction);
    } else {
      defaultTitle = translate(resources.buyItemHeading);
      actionButtonText = translate(resources.buyNowAction);
    }

    const itemsSlice = itemDetails?.slice(0, batchBuyMaxThumbnails);

    function handleResult(result: BulkPurchaseResult | undefined) {
      const resultFeedback = handleResultFromPurchases(translate, result, startTwoStepVerification);
      let resultMessage: string;
      if (resultFeedback.params) {
        resultMessage = translate(resultFeedback.message, resultFeedback.params);
      } else {
        resultMessage = translate(resultFeedback.message);
      }

      if (resultFeedback.success) {
        systemFeedbackService.success(resultMessage);
      } else {
        systemFeedbackService.warning(resultMessage);
      }
    }

    async function purchaseItems() {
      const fulfillmentGroups: { strategy: string; lineItems: BatchPurchaseLineItem[] } = {
        strategy: 'BEST_EFFORT',
        lineItems: []
      };

      const lineItems: BatchPurchaseLineItem[] = [];
      const itemResults: BatchPurchaseItemResult[] = [];
      itemDetails.forEach(item => {
        let itemToPurchase: BatchPurchaseLineItem = {};
        if (item.collectibleItemId !== undefined) {
          const collectibleItemDetails = item.collectibleItemDetails!;
          const itemPurchaseInfo = items.find(i => i.id === item.id && i.itemType === item.itemType);
          const purchaseFromCreator =
            collectibleItemDetails.saleLocationType !== 'ExperiencesDevApiOnly' &&
            (collectibleItemDetails.unitsAvailableForConsumption ?? 0) > 0 &&
            (!collectibleItemDetails.hasResellers ||
              (collectibleItemDetails.price ?? NaN) <
                (collectibleItemDetails.lowestResalePrice ?? NaN));
          if (!purchaseFromCreator && collectibleItemDetails.lowestAvailableResaleProductId) {
            itemToPurchase.collectibleProductId =
              collectibleItemDetails.lowestAvailableResaleProductId;
          } else {
            itemToPurchase.collectibleProductId = collectibleItemDetails.collectibleProductId;
          }
          if (itemPurchaseInfo?.timedOption) {
            itemToPurchase.rentalOption = { durationDays: itemPurchaseInfo.timedOption.days };
          }
          const marketplaceOfferPrice = marketplaceOfferPricing[item.collectibleItemId];
          const offerPricedLineItem = withMarketplaceOfferPricing(
            itemToPurchase,
            marketplaceOfferPrice
          );
          if (offerPricedLineItem) {
            itemToPurchase = offerPricedLineItem;
          } else if (itemPurchaseInfo?.timedOption) {
            itemToPurchase.agreedPriceRobux = itemPurchaseInfo.timedOption.price;
          } else {
            itemToPurchase.agreedPriceRobux = collectibleItemDetails.lowestPrice;
          }
        } else if (item.firstReseller !== undefined) {
          itemToPurchase.limitedV1InstanceId = `${item.firstReseller.userAssetId}`;
          itemToPurchase.agreedPriceRobux = item.firstReseller.price;
        } else {
          itemToPurchase.virtualEconomyProductId = `${item.productId}`;
          itemToPurchase.agreedPriceRobux =
            item.premiumPriceInRobux && isPremiumUser()
              ? item.premiumPriceInRobux
              : item.price;
        }
        lineItems.push(itemToPurchase);

        const itemResultData: BatchPurchaseItemResult = { data: { itemData: {}, reason: '' } };
        if (item.itemType === 'Asset') {
          itemResultData.data.itemData.assetId = item.id;
        } else {
          itemResultData.data.itemData.bundleId = item.id;
        }
        itemResults.push(itemResultData);
      });

      fulfillmentGroups.lineItems = lineItems;

      const lookId = purchaseMetadata.has(purchaseMetadataKeys.LookId)
        ? purchaseMetadata.get(purchaseMetadataKeys.LookId)
        : '';
      const guid = generateRandomUuid();
      const idempotencyKey =
        lookId !== undefined && lookId !== '' ? `web_looks_purchase-${lookId}-${guid}` : guid;
      let result: BulkPurchaseResult | undefined;
      try {
        result = await itemPurchaseService.bulkPurchaseItem(
          userId()!,
          productSurface,
          fulfillmentGroups,
          idempotencyKey
        );

        const { data } = result;
        if (data.message && data.message.startsWith('Error/EconomicRestrictions')) {
          handleResult(result);
          onTransactionComplete(itemResults);
          return;
        }

        let count = 0;
        data.fulfillmentGroups[0]!.lineItems.forEach(item => {
          itemResults[count]!.data.reason =
            item.status === 'SUCCEEDED' ? 'Success' : item.errorReason;
          count += 1;
        });
      } catch (error) {
        result = error as BulkPurchaseResult | undefined;

        let count = 0;
        itemResults.forEach(() => {
          if (result) {
            itemResults[count]!.data.reason = result?.data.message;
          }
          count += 1;
        });
      }

      handleResult(result);
      onTransactionComplete(itemResults);
    }

    const onModalNeutral = () => {
      onCancel();
    };

    const onModalConfirm = () => {
      let twoStepVerificationRequired = false;
      itemDetails.forEach(item => {
        twoStepVerificationRequired =
          twoStepVerificationRequired || !!item.twoStepVerificationRequired;
      });
      if (twoStepVerificationRequired && !hasTwoStepVerificationBeenCompleted) {
        startTwoStepVerification();
      } else {
        purchaseItems();
        onAction();
      }
    };

    const onTwoStepVerificationChallengeComplete = () => {
      setHasTwoStepVerificationBeenCompleted(true);
      stopTwoStepVerification();
    };

    const body = (
      <Fragment>
        <div
          className='modal-message multi-item'
          // Used for formatting purchase text, hardcoded string value from translation service
          dangerouslySetInnerHTML={{
            __html: translate(bodyMessageResource, assetInfo)
          }}
        />
        {itemDetails !== undefined && itemDetails.length > 0 && (
          <div className='modal-multi-item-images-container'>
            {itemsSlice.map((item, i) => {
              const matchedItem = items.find(
                itemInfo => itemInfo.id === item.id && itemInfo.itemType === item.itemType
              );
              return (
                <ItemThumbnail
                  key={`${item.itemType}-${item.id}`}
                  itemsCount={itemDetails.length}
                  item={item}
                  index={i}
                  timedOption={matchedItem?.timedOption}
                  translate={translate}
                />
              );
            })}
          </div>
        )}
      </Fragment>
    );

    return (
      <React.Fragment>
        <TwoStepVerificationModal
          translate={translate}
          isTwoStepVerificationActive={isTwoStepVerificationActive}
          stopTwoStepVerification={onTwoStepVerificationChallengeComplete}
          systemFeedbackService={systemFeedbackService}
        />
        <FoundationPurchaseModal
          open={open}
          title={title || defaultTitle}
          body={body}
          neutralButtonText={translate(resources.cancelAction)}
          actionButtonText={actionButtonText}
          onAction={onModalConfirm}
          onNeutral={onModalNeutral}
          footerText={
            <BalanceAfterSaleText
              expectedPrice={expectedTotalPrice}
              currentRobuxBalance={currentRobuxBalance}
            />
          }
          loading={loading}
          actionButtonShow={!!itemDetails}
        />
      </React.Fragment>
    );
  }


  function MultiItemPurchaseModal({ translate, ...props }: MultiItemPurchaseModalProps) {
    return (
      <SelfProvidedTranslate
        translate={translate}
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <MultiItemPurchaseModalInner {...props} translate={t} />}
      />
    );
  }

  return MultiItemPurchaseModal;
}
