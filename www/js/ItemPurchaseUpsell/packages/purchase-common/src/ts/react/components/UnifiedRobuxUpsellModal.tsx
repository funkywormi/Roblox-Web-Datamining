import { RobloxIntlInstance } from '@rbx/legacy-webapp-types/Roblox';
import React, { useCallback, useMemo } from 'react';
import { TranslateFunction } from '@rbx/core-scripts/react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  TCheckboxCheckState
} from '@rbx/foundation-ui';
import UnifiedPurchaseHeading from './UnifiedPurchaseHeading';
import UnifiedProductDetails from './UnifiedProductDetails';
import DiscountPriceDetail from './DiscountPriceDetail';
import EmbeddableText from './EmbeddableText';
import RobuxUpsellPackageDetails from '../../../js/react/itemPurchase/components/RobuxUpsellPackageDetails';
import { LANG_KEYS } from '../../../js/core/services/itemPurchaseUpsellService/constants/upsellConstants';
import useTermsOfUseText from '../hooks/useTermsOfUseText';
import useModalShownTracking from '../hooks/useModalShownTracking';
import useMarketplaceOffers from '../hooks/useMarketplaceOffers';
import { normalizeDiscountInformation } from './discountInformation';
import type { DiscountInformation } from './discountInformation';

export type UnifiedRobuxUpsellActionParams = {
  purchasePrice: number;
  offerIds: string[];
};

export type UnifiedRobuxUpsellModalProps = {
  translate: TranslateFunction;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  assetName: string;
  assetType: string;
  assetTypeDisplayName?: string;
  onAction: () => void;
  onCancel?: () => void;
  loading?: boolean;
  currentRobuxBalance?: number;
  open?: boolean;
  robuxPackageAmount?: number;
  robuxPackagePrice?: string;
  intl: RobloxIntlInstance;
  priceSuffix?: string;
  title?: string;
  discountInformation?: DiscountInformation | null;
  collectibleItemId?: string | null;
  rentalOptionDays?: number | null;
  isLimited?: boolean;
  /** True while a recommended-package re-fetch is in flight (disables the CTA). */
  packageLoading?: boolean;
  /** Fired with the discounted price whenever cart-pricing resolves a new amount. */
  onRefetchPackage?: (discountedPrice: number) => void;
  /** Buy Robux + item flow with the discounted price and selected offers. */
  onAcceptOffers?: (params: UnifiedRobuxUpsellActionParams) => void;
  /** Direct purchase when the discount already makes the item affordable. */
  onDirectPurchase?: (params: UnifiedRobuxUpsellActionParams) => void;
};
const UnifiedRobuxUpsellModal: React.FC<UnifiedRobuxUpsellModalProps> = ({
  translate,
  expectedPrice,
  thumbnail,
  assetName,
  onAction,
  onCancel,
  loading = false,
  currentRobuxBalance,
  open = false,
  robuxPackageAmount,
  robuxPackagePrice,
  intl,
  priceSuffix,
  title,
  discountInformation,
  collectibleItemId = null,
  rentalOptionDays = null,
  isLimited = false,
  packageLoading = false,
  onRefetchPackage,
  onAcceptOffers,
  onDirectPurchase
}) => {
  const handlePriceResolved = useCallback(
    (priceInRobux: number | undefined) => {
      onRefetchPackage?.(priceInRobux ?? expectedPrice);
    },
    [onRefetchPackage, expectedPrice]
  );

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
    open,
    onPriceResolved: handlePriceResolved
  });

  const effectiveExpectedPrice = resolvedPrice ?? expectedPrice;
  const effectiveDiscountInformation =
    resolvedDiscountInformation !== undefined ? resolvedDiscountInformation : discountInformation;

  const normalizedDiscount = useMemo(
    () =>
      effectiveDiscountInformation
        ? normalizeDiscountInformation(effectiveDiscountInformation)
        : null,
    [effectiveDiscountInformation]
  );

  // When the discount drops the price to at/below the user's balance, the user
  // no longer needs to buy Robux: switch to a direct purchase and hide the
  // recommended package.
  const isAffordableWithDiscount =
    currentRobuxBalance != null && effectiveExpectedPrice <= currentRobuxBalance;

  useModalShownTracking('UnifiedRobuxUpsellModal', open);
  const titleText = title ?? translate(LANG_KEYS.buyRobuxAndItemAction);
  const actionButtonText = translate(LANG_KEYS.buy);
  const termsOfUseText = useTermsOfUseText(translate, intl);

  const handleAction = useCallback(() => {
    const params: UnifiedRobuxUpsellActionParams = {
      purchasePrice: effectiveExpectedPrice,
      offerIds: selectedOfferIds
    };
    if (isAffordableWithDiscount && onDirectPurchase) {
      onDirectPurchase(params);
      return;
    }
    if (onAcceptOffers) {
      onAcceptOffers(params);
      return;
    }
    onAction();
  }, [
    effectiveExpectedPrice,
    selectedOfferIds,
    isAffordableWithDiscount,
    onDirectPurchase,
    onAcceptOffers,
    onAction
  ]);

  return (
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
      <DialogContent className='relative width-full'>
        <DialogBody className='gap-large flex flex-col'>
          <div className='margin-bottom-xsmall'>
            <UnifiedPurchaseHeading
              translate={translate}
              titleText={titleText}
              currentRobuxBalance={currentRobuxBalance}
            />
          </div>
          <UnifiedProductDetails
            translate={translate}
            thumbnail={thumbnail}
            assetName={assetName}
            expectedPrice={effectiveExpectedPrice}
            priceSuffix={priceSuffix}
            discountInformation={effectiveDiscountInformation}
          />
          {offerSelections.map(offer => {
            const offerLabelId = `upsell-offer-label-${offer.offerId}`;

            return (
              // eslint-disable-next-line jsx-a11y/label-has-associated-control -- Checkbox is a custom control associated via htmlFor + aria-labelledby
              <label
                key={offer.offerId}
                htmlFor={`upsell-offer-checkbox-${offer.offerId}`}
                className='flex flex-row items-start gap-x-small self-start cursor-pointer'>
                <Checkbox
                  id={`upsell-offer-checkbox-${offer.offerId}`}
                  aria-labelledby={offerLabelId}
                  placement='Start'
                  size='Small'
                  isChecked={offer.selected}
                  onCheckedChange={(checked: TCheckboxCheckState) => {
                    handleOfferCheckedChange(offer.offerId, checked === true);
                  }}
                  isDisabled={isPricingLoading || packageLoading}
                  data-testid={`upsell-promo-checkbox-${offer.offerId}`}
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
          {!isAffordableWithDiscount && robuxPackageAmount != null && robuxPackagePrice != null && (
            <RobuxUpsellPackageDetails robuxAmount={robuxPackageAmount} price={robuxPackagePrice} />
          )}
        </DialogBody>

        <DialogFooter className='gap-small flex flex-col mt-[40px]'>
          <div className='flex flex-col items-center text-center width-full gap-medium'>
            <Button
              variant='Emphasis'
              className='width-full shrink-0'
              onClick={handleAction}
              isDisabled={loading || isPricingLoading || packageLoading}
              data-testid='purchase-confirm-button'>
              {actionButtonText}
            </Button>
            <div className='text-body-small'>{termsOfUseText}</div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedRobuxUpsellModal;
