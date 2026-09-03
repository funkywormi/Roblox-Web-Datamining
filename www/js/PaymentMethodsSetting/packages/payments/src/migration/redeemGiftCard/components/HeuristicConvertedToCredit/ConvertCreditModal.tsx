/* eslint-disable react/no-danger */
import React, { useState, useEffect, useCallback } from 'react';
import { createModal, Button } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { fireApiErrorCounters } from '../../../core/utils/errorEventUtils';
import { TRANSLATION_KEYS } from '../../constants/constants';
import PriceTag from '../../../../priceTag/components/PriceTag';
import BillingInfoForm from '../../../billingAddressForm/App';
import { Address } from '../../../billingAddressForm/constants/TypeDefinitions';
import { useHeuristicCreditConversionData } from '../../store/HeuristicCreditConversionContext';
import generateRobuxConversionMessage from './robuxConversionUtils';
import { TaxDisplay } from './TaxDisplay';
import translationConfig from '../../translation.config';
import '../../../css/redeemGiftCard/redeemGiftCard.scss';
import {
  sendProcessPaymentStatusEvent,
  sendUpdateAddressForCheckoutSessionStatusEvent
} from '../../services/redeemGiftCardService';

type ConvertCreditModalProps = WithTranslationsProps;

const [Modal, modalService] = createModal();

const ConvertCreditModal: React.FC<ConvertCreditModalProps> = ({ translate }) => {
  const {
    isConvertModalOpen,
    isLoading,
    isPurchasable,
    creditBalance,
    currencyCode,
    convertedRobuxAmount,
    numberOfPurchase,
    tax,
    taxRate,
    taxLoading,
    taxDisplay,
    isTaxFlowEnabled,
    onUpdatedAddress,
    onTaxDisplayChange,
    processPaymentAction,
    closeConvertModal,
    prefilledAddress,
    setSavedUserAddress
  } = useHeuristicCreditConversionData();

  const [processAddressSave, setProcessAddressSave] = useState<boolean>(false);

  // Control modal visibility based on context state
  useEffect(() => {
    if (isConvertModalOpen) {
      modalService.open();
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
        true,
        isTaxFlowEnabled
          ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITH_TAX
          : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITHOUT_TAX,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN
      );
    } else {
      modalService.close();
    }
  }, [isConvertModalOpen, isTaxFlowEnabled]);

  const triggerFiatCreditRendering = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('price-tag:render', {
        detail: {
          targetSelector: '.fiat-price-tag'
        }
      })
    );
  }, []);

  const handleAddressUpdate = useCallback(
    async (updatedAddress: Address) => {
      try {
        await onUpdatedAddress(updatedAddress);
        sendUpdateAddressForCheckoutSessionStatusEvent(true, isTaxFlowEnabled, false);
      } catch (error) {
        sendUpdateAddressForCheckoutSessionStatusEvent(false, isTaxFlowEnabled, false);
        fireApiErrorCounters('CreditConversion', 'UpdateAddress', error);
      }
    },
    [isTaxFlowEnabled, onUpdatedAddress]
  );

  const handleConvert = useCallback(() => {
    if (isTaxFlowEnabled) {
      setProcessAddressSave(true);
    }
    processPaymentAction().catch(error => {
      sendProcessPaymentStatusEvent(false, isTaxFlowEnabled, false);
      fireApiErrorCounters('CreditConversion', 'ProcessPaymentAction', error);
    });
    sendProcessPaymentStatusEvent(true, isTaxFlowEnabled, false);
  }, [isTaxFlowEnabled, processPaymentAction]);

  return (
    <Modal
      id='convert-credit-modal'
      title={translate(TRANSLATION_KEYS.ConvertCreditToRobuxModalHeading)}
      onClose={closeConvertModal}
      onNeutral={closeConvertModal}
      body={[
        // Tax flow sections - Only shown when tax flow is enabled
        isTaxFlowEnabled && (
          <React.Fragment key='tax-flow-sections'>
            <div key='order-summary' className='order-summary bold'>
              {translate(TRANSLATION_KEYS.OrderSummaryLabel) || 'Order Summary'}
            </div>
            <div key='purchase-banner' className='purchase-banner'>
              <span className='purchase-text'>
                {translate(TRANSLATION_KEYS.RobuxPurchasedLabel) || 'Robux purchased'}
              </span>
              <span className='robux-amount-container'>
                <div className='robux-amount'>
                  <span className='low-cogs-robux-amount-inline'>
                    <span className='icon-robux-28x28' style={{ transform: 'translateY(-2px)' }} />
                    {convertedRobuxAmount}
                  </span>
                  {convertedRobuxAmount > 5 && (
                    <span className='high-cogs-robux-amount-inline'>
                      <span
                        className='icon-robux-gray-16x16'
                        style={{ transform: 'translateY(-2px)' }}
                      />
                      {Math.floor(convertedRobuxAmount / 1.25)}
                    </span>
                  )}
                </div>
                <div className='robux-amount-text'>
                  {translate(TRANSLATION_KEYS.IncludesUpToTwentyFivePercentMoreRobuxLabel) ||
                    'Includes up to 25% more Robux'}
                </div>
              </span>
            </div>
            <div
              key='available-credit'
              className='available-credit d-flex justify-content-between row-pad'>
              <span className='bold'>
                {translate('Label.AvailableCredit') || 'Available Credit'}
              </span>
              <PriceTag amount={creditBalance} currencyCode={currencyCode} />
            </div>
            <div
              key='convertible-credit'
              className='convertible-credit d-flex justify-content-between row-pad'>
              <span className='bold'>
                {translate(TRANSLATION_KEYS.ConvertibleCredit) || 'Convertible Credit'}
              </span>
              <PriceTag
                amount={creditBalance - (taxDisplay && tax ? tax.amount : 0)}
                currencyCode={currencyCode}
              />
            </div>
            <TaxDisplay
              key='tax-line'
              translate={translate}
              tax={tax}
              taxRate={taxRate}
              isLoading={taxLoading}
              taxDisplay={taxDisplay}
            />
            <div key='divider' className='rbx-divider' />
            <div className='remaining-balance d-flex justify-content-between row-pad'>
              <span className='bold'>
                {translate(TRANSLATION_KEYS.RemainingBalance) || 'Remaining Balance'}
              </span>
              <PriceTag amount={0} currencyCode={currencyCode} />
            </div>
            <div key='billing-info-section' className='billing-info-section'>
              <BillingInfoForm
                processAddressSave={processAddressSave}
                onUpdateAddress={handleAddressUpdate}
                onTaxDisplayChange={onTaxDisplayChange}
                prefilledAddress={prefilledAddress}
                onSavedAddressLoaded={setSavedUserAddress}
                triggeringContext={
                  paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE
                }
              />
            </div>
          </React.Fragment>
        ),
        !isTaxFlowEnabled && (
          <div
            key={`conversion-message-${convertedRobuxAmount}-${creditBalance}`}
            className='conversion-message'
            style={{ marginTop: '12px' }}
            dangerouslySetInnerHTML={{
              __html: generateRobuxConversionMessage(
                translate,
                numberOfPurchase,
                convertedRobuxAmount,
                creditBalance,
                currencyCode
              )
            }}
            ref={triggerFiatCreditRendering}
          />
        ),

        <div
          key='modal-footer-buttons'
          className='modal-footer-buttons d-flex justify-content-between mt-4'>
          {isLoading ? (
            <button
              type='button'
              className='btn-growth-md btn-full-width mr-2 loading-button-container'
              disabled>
              <span className='loading-button-text'>
                {translate(TRANSLATION_KEYS.ConvertToRobuxAction)}
              </span>
              <span className='spinner spinner-sm loading-button-spinner' />
            </button>
          ) : (
            <Button
              variant={Button.variants.growth}
              size={Button.sizes.medium}
              width={Button.widths.full}
              onClick={handleConvert}
              isDisabled={!isPurchasable}
              className='mr-2'>
              {translate(TRANSLATION_KEYS.ConvertToRobuxAction)}
            </Button>
          )}
        </div>
      ]}
      actionButtonShow={false}
      size='md'
    />
  );
};

export default withTranslations(ConvertCreditModal, translationConfig);
export { modalService as convertCreditModalService };
