import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslations, TranslateFunction } from '@rbx/core-scripts/react';
import { paymentFlowAnalyticsService } from '@rbx/core-scripts/legacy/core-roblox-utilities';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  TCheckboxCheckState
} from '@rbx/foundation-ui';
import type { SubscriptionProductInfo, SubscriptionOffer } from '@rbx/client-subscriptions-api/v1';
import translationConfig from '../../../js/react/itemPurchase/translation.config';
import SubscriptionUpsellBanner from './Subscriptions/SubscriptionUpsellBanner';
import RobloxSubscriptionSheet from './Subscriptions/RobloxSubscriptionSheet';
import UnifiedProductDetails from './UnifiedProductDetails';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import useModalShownTracking from '../hooks/useModalShownTracking';
import useUpsellTracking from '../hooks/useUpsellTracking';
import DiscountPriceDetail from './DiscountPriceDetail';
import { normalizeDiscountInformation } from './discountInformation';
import type { DiscountInformation } from './discountInformation';
import isPlusBenefitDiscount from '../utils/isPlusBenefitDiscount';
import isPlusSubscriptionRolloutEnabled from '../utils/subscriptionRolloutMeta';
import guacService from '../services/guacService';
import useMarketplaceOffers from '../hooks/useMarketplaceOffers';
// Reuse the shared paymentSession hook from @rbx/payments so we share the same
// `paymentSession-${userId}` localStorage cache + single-flight as Buy Robux and
// other Plus surfaces. (Roblox.Payments.WebApp is migrated to workspace @rbx/payments;
// this replaces the old cross-WebApp relative import into its source.)
import { usePaymentSession } from '@rbx/payments/services/paymentSession';
import EmbeddableText from './EmbeddableText';

export type UnifiedPurchaseActionParams = {
  purchasePrice?: number;
  offerIds?: string[];
};

export type UnifiedPurchaseModalProps = {
  translate: TranslateFunction;
  expectedPrice: number;
  displayPrice?: string;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  sellerName: string;
  onAction: (params?: UnifiedPurchaseActionParams) => void;
  onSecondaryAction?: () => void;
  secondaryActionButtonText?: string;
  footerDisclaimerText?: React.ReactNode;
  priceSuffix?: string;
  onCancel?: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
  rentalOptionDays?: number | null;
  open?: boolean;
  titleText: string;
  actionButtonText: string;
  subscriptionProductInfo?: SubscriptionProductInfo;
  discountInformation?: DiscountInformation | null;
  collectibleItemId?: string | null;
  isLimited?: boolean;
};

export const UnifiedPurchaseModalComponent: React.FC<UnifiedPurchaseModalProps> = ({
  translate,
  titleText,
  actionButtonText,
  expectedPrice,
  displayPrice,
  thumbnail,
  assetName,
  assetType,
  assetTypeDisplayName,
  sellerName,
  onAction,
  onSecondaryAction,
  secondaryActionButtonText,
  footerDisclaimerText,
  priceSuffix,
  onCancel,
  loading = false,
  currentRobuxBalance,
  rentalOptionDays = null,
  open = false,
  subscriptionProductInfo,
  discountInformation,
  collectibleItemId = null,
  isLimited = false
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [upsellUuid, setUpsellUuid] = useState<string>();
  const [redirectUrl, setRedirectUrl] = useState<string>();
  const {
    offerSelections,
    resolvedPrice,
    resolvedDiscountInformation,
    resolvedSavingsSummary,
    isPricingLoading,
    selectedOfferIds,
    handleOfferCheckedChange
  } = useMarketplaceOffers({
    collectibleItemId,
    rentalOptionDays,
    expectedPrice,
    isLimitedItem: isLimited,
    open
  });
  /**
   * GUAC `app-policy` kill switch: when true, hide Plus entrypoints (in addition to
   * `isPlusSubscriptionRolloutEnabled` from page meta).
   */
  const [plusEntrypointsDisabledByPolicy, setPlusEntrypointsDisabledByPolicy] = useState(false);

  // Eagerly resolve a paymentSession on modal open so the analytics events and
  // the Subscribe redirect URL all carry the same id. `false` means: prefer a
  // cached, non-expired session; otherwise the hook creates one in the
  // background. By the time the user clicks the upsell banner the session is
  // almost always already available.
  const paymentSession = usePaymentSession(false);
  const paymentSessionId = paymentSession?.id;
  const flowMetadata = useMemo((): Record<string, string> => {
    return paymentSessionId ? { paymentSessionId } : {};
  }, [paymentSessionId]);

  useEffect(() => {
    let cancelled = false;
    guacService
      .getDisableRobloxPlusEntrypoints()
      .then(disabled => {
        if (!cancelled && disabled) {
          setPlusEntrypointsDisabledByPolicy(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveExpectedPrice = resolvedPrice ?? expectedPrice;
  const effectiveDiscountInformation =
    resolvedDiscountInformation !== undefined ? resolvedDiscountInformation : discountInformation;

  const hideRobloxPlusEntrypoints =
    plusEntrypointsDisabledByPolicy || !isPlusSubscriptionRolloutEnabled();

  const isFreeTrial =
    subscriptionProductInfo?.eligibleOffers?.some(
      (o: SubscriptionOffer) => o.offerType === 'FreeTrial'
    ) ?? false;

  const normalizedDiscount = useMemo(
    () =>
      effectiveDiscountInformation?.originalPrice &&
      effectiveDiscountInformation.originalPrice > effectiveExpectedPrice
        ? normalizeDiscountInformation(effectiveDiscountInformation)
        : null,
    [effectiveDiscountInformation, effectiveExpectedPrice]
  );

  // Defer `startRobloxPlusUpsellFlow` + VIEW_SHOWN until both the sheet is open
  // and `paymentSession` has resolved, so the event carries the same
  // `paymentSessionId` as the downstream USER_INPUT (subscribe click) and
  // checkout events. A ref guarantees fire-once across open/close cycles even
  // if `flowMetadata` identity changes; reset on close so a re-open emits a
  // fresh VIEW_SHOWN.
  const hasFiredViewShown = useRef(false);
  useEffect(() => {
    if (!sheetOpen) {
      hasFiredViewShown.current = false;
      return;
    }
    if (hasFiredViewShown.current || !paymentSessionId) {
      return;
    }
    hasFiredViewShown.current = true;
    // startRobloxPlusUpsellFlow maps assetType -> the right WEB_*_PLUS_UPSELL
    // context and stores it on the singleton. sendUserPurchaseFlowEvent emits
    // that stored context on the wire (the trigger_context arg here is only a
    // fallback initializer used when no flow has started), so the literal we
    // pass below is essentially dead once the flow is started.
    paymentFlowAnalyticsService.startRobloxPlusUpsellFlow({ assetType });
    const viewMessage = isFreeTrial
      ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
      : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE;
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_SINGLE_ITEM_PLUS_UPSELL,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_UPSELL_BANNER,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      viewMessage,
      flowMetadata
    );
  }, [sheetOpen, paymentSessionId, assetType, isFreeTrial, flowMetadata]);

  const sendAnalyticsEvent = useCallback(
    (isFreeTrialParam: boolean) => {
      const viewMessage = isFreeTrialParam
        ? paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_FREE_TRIAL
        : paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.ROBLOX_PLUS_SUBSCRIBE;
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_SINGLE_ITEM_PLUS_UPSELL,
        false,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_PLUS_UPSELL_BANNER,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        viewMessage,
        flowMetadata
      );
    },
    [flowMetadata]
  );

  const { trackUpsellClick: trackSheetUpsellClick } = useUpsellTracking(
    'UnifiedPurchaseModalUpsellSheet',
    assetType,
    sheetOpen
  );

  const trackSubscriptionButtonClick = useCallback(() => {
    trackSheetUpsellClick();
    sendAnalyticsEvent(isFreeTrial);
  }, [trackSheetUpsellClick, sendAnalyticsEvent, isFreeTrial]);

  const onBannerClick = useCallback(() => {
    setUpsellUuid(paymentFlowAnalyticsService.purchaseFlowUuid);
    setRedirectUrl(window.location.pathname + window.location.hash);
    setSheetOpen(true);
    onCancel?.();
  }, [onCancel]);

  const onSheetClose = useCallback(() => setSheetOpen(false), []);

  useModalShownTracking('UnifiedPurchaseModal', open);

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onOpenChange={(nextOpen: boolean) => {
          if (!nextOpen && onCancel) {
            onCancel();
          }
        }}
        isModal
        size='Large'
        type='Default'
        closeLabel={translate('Action.Close') || 'Close'}
        hasCloseAffordance>
        <DialogContent className='relative unified-purchase-dialog-content'>
          <DialogBody className='gap-xlarge flex flex-col'>
            <div style={{ marginTop: 2 }}>
              <UnifiedPurchaseHeading
                translate={translate}
                titleText={titleText}
                currentRobuxBalance={displayPrice ? undefined : currentRobuxBalance}
              />
            </div>
            <UnifiedProductDetails
              translate={translate}
              thumbnail={thumbnail}
              assetName={assetName}
              expectedPrice={effectiveExpectedPrice}
              displayPrice={displayPrice}
              priceSuffix={priceSuffix}
              rentalOptionDays={rentalOptionDays}
              discountInformation={effectiveDiscountInformation}
            />
            {offerSelections.map(offer => {
              const offerLabelId = `purchase-offer-label-${offer.offerId}`;

              return (
                // eslint-disable-next-line jsx-a11y/label-has-associated-control -- Checkbox is a custom control associated via htmlFor + aria-labelledby
                <label
                  key={offer.offerId}
                  htmlFor={`purchase-offer-checkbox-${offer.offerId}`}
                  className='flex flex-row items-start gap-x-small self-start cursor-pointer'>
                  <Checkbox
                    id={`purchase-offer-checkbox-${offer.offerId}`}
                    aria-labelledby={offerLabelId}
                    placement='Start'
                    size='Small'
                    isChecked={offer.selected}
                    onCheckedChange={(checked: TCheckboxCheckState) => {
                      handleOfferCheckedChange(offer.offerId, checked === true);
                    }}
                    isDisabled={isPricingLoading}
                    data-testid={`purchase-promo-checkbox-${offer.offerId}`}
                  />
                  <EmbeddableText
                    id={offerLabelId}
                    text={offer.localizedText}
                    className='text-body-medium content-default'
                  />
                </label>
              );
            })}
            {normalizedDiscount && normalizedDiscount.savedAmount > 0 && (
              <DiscountPriceDetail
                translate={translate}
                normalizedDiscount={normalizedDiscount}
                savingsSummary={resolvedSavingsSummary}
              />
            )}
          </DialogBody>

          <DialogFooter className='flex flex-col mt-[40px]'>
            <div className='gap-small flex flex-col'>
              <div className='flex flex-row-reverse'>
                <Button
                  variant='Emphasis'
                  className='fill basis-0'
                  onClick={() =>
                    onAction({
                      purchasePrice: effectiveExpectedPrice,
                      ...(selectedOfferIds.length ? { offerIds: selectedOfferIds } : {})
                    })
                  }
                  isDisabled={loading || isPricingLoading}
                  data-testid='purchase-confirm-button'>
                  {actionButtonText}
                </Button>
              </div>
              {onSecondaryAction && secondaryActionButtonText && (
                <div className='flex flex-row-reverse'>
                  <Button
                    variant='Standard'
                    className='fill basis-0'
                    onClick={onSecondaryAction}
                    isDisabled={loading}
                    data-testid='purchase-secondary-button'>
                    {secondaryActionButtonText}
                  </Button>
                </div>
              )}
            </div>
            {!isPlusBenefitDiscount(normalizedDiscount?.discountLines ?? null) &&
              !hideRobloxPlusEntrypoints && (
                <SubscriptionUpsellBanner
                  translate={translate}
                  assetType={assetType}
                  subscriptionProductInfo={subscriptionProductInfo}
                  onBannerClick={onBannerClick}
                />
              )}
            {footerDisclaimerText && (
              <p className='text-body-small content-default' style={{ marginTop: 12 }}>
                {footerDisclaimerText}
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {subscriptionProductInfo && !hideRobloxPlusEntrypoints && (
        <RobloxSubscriptionSheet
          translate={translate}
          open={sheetOpen}
          onClose={onSheetClose}
          subscriptionProductInfo={subscriptionProductInfo}
          isFreeTrial={isFreeTrial}
          upsellUuid={upsellUuid}
          paymentSessionId={paymentSessionId}
          redirectUrl={redirectUrl}
          trackSubscriptionButtonClick={trackSubscriptionButtonClick}
        />
      )}
    </React.Fragment>
  );
};

export default withTranslations(
  UnifiedPurchaseModalComponent,
  translationConfig.purchasingResources
);
