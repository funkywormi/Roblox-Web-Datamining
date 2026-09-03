/* eslint-disable react/jsx-no-literals */
import React, { useState, useEffect, useCallback } from 'react';
import { createModal, Button } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { fireApiErrorCounters } from '../../../core/utils/errorEventUtils';
import { TRANSLATION_KEYS, LOW_COGS_ROBUX_PACKAGE_MAP } from '../../constants/constants';
import PriceTag from '../../../../priceTag/components/PriceTag';
import BillingInfoForm from '../../../billingAddressForm/App';
import { Address } from '../../../billingAddressForm/constants/TypeDefinitions';
import { useHeuristicCreditConversionData } from '../../store/HeuristicCreditConversionContext';
import translationConfig from '../../translation.config';
import { TaxDisplay } from './TaxDisplay';
import '../../../css/redeemGiftCard/redeemGiftCard.scss';
import {
  sendUpdateAddressForCheckoutSessionStatusEvent,
  sendProcessPaymentStatusEvent
} from '../../services/redeemGiftCardService';

type PurchasePackageModalProps = WithTranslationsProps;

const [Modal, modalService] = createModal();

const PurchasePackageModal: React.FC<PurchasePackageModalProps> = ({ translate }) => {
  const {
    isPurchaseModalOpen,
    isLoading,
    creditBalance,
    totalBalanceDue,
    currencyCode,
    numberOfPurchase,
    robuxAmountInPackage,
    tax,
    taxRate,
    taxLoading,
    taxDisplay,
    isTaxFlowEnabled,
    onUpdatedAddress,
    onTaxDisplayChange,
    processPaymentAction,
    closePurchaseModal,
    prefilledAddress,
    isPurchasable,
    setSavedUserAddress
  } = useHeuristicCreditConversionData();

  const [processAddressSave, setProcessAddressSave] = useState<boolean>(false);

  // Control modal visibility based on context state
  useEffect(() => {
    if (isPurchaseModalOpen) {
      modalService.open();
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
        true,
        isTaxFlowEnabled
          ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITH_TAX
          : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITHOUT_TAX,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN
      );
    } else {
      modalService.close();
    }
  }, [isPurchaseModalOpen, isTaxFlowEnabled]);

  const handleAddressUpdate = useCallback(
    async (updatedAddress: Address) => {
      try {
        await onUpdatedAddress(updatedAddress);
        sendUpdateAddressForCheckoutSessionStatusEvent(true, isTaxFlowEnabled, true);
      } catch (error) {
        sendUpdateAddressForCheckoutSessionStatusEvent(false, isTaxFlowEnabled, true);
        fireApiErrorCounters('CreditConversion', 'UpdateAddress', error);
      }
    },
    [onUpdatedAddress, isTaxFlowEnabled]
  );

  const handlePurchase = useCallback(() => {
    if (isTaxFlowEnabled) {
      setProcessAddressSave(true);
    }
    processPaymentAction().catch(error => {
      sendProcessPaymentStatusEvent(false, isTaxFlowEnabled, true);
      fireApiErrorCounters('CreditConversion', 'ProcessPaymentAction', error);
    });
    sendProcessPaymentStatusEvent(true, isTaxFlowEnabled, true);
  }, [isTaxFlowEnabled, processPaymentAction]);

  return (
    <Modal
      id='purchase-product-modal'
      title={translate(TRANSLATION_KEYS.BuyRobuxWithCreditModalHeading)}
      onClose={closePurchaseModal}
      onNeutral={closePurchaseModal}
      body={
        <div className='d-flex flex-direction-column'>
          {isTaxFlowEnabled && (
            <React.Fragment key='purchase-banner-sections'>
              <div className='order-summary bold'>
                {translate(TRANSLATION_KEYS.OrderSummaryLabel) || 'Order Summary'}
              </div>
              <div className='purchase-banner'>
                <span className='purchase-text'>
                  {translate(TRANSLATION_KEYS.RobuxPurchasedLabel) || 'Robux purchased'}
                </span>
                <span className='robux-amount-container'>
                  <div className='robux-amount'>
                    <span className='low-cogs-robux-amount-inline'>
                      <span
                        className='icon-robux-28x28'
                        style={{ transform: 'translateY(-2px)' }}
                      />
                      {robuxAmountInPackage}
                    </span>
                    <span className='high-cogs-robux-amount-inline'>
                      <span
                        className='icon-robux-gray-16x16'
                        style={{ transform: 'translateY(-2px)' }}
                      />
                      {LOW_COGS_ROBUX_PACKAGE_MAP[robuxAmountInPackage]}
                    </span>
                  </div>
                  <div className='robux-amount-text'>
                    {translate(TRANSLATION_KEYS.IncludesUpToTwentyFivePercentMoreRobuxLabel) ||
                      'Includes up to 25% more Robux'}
                  </div>
                </span>
              </div>
            </React.Fragment>
          )}
          <div className='available-credit d-flex justify-content-between row-pad'>
            <span className='bold'>{translate('Label.AvailableCredit') || 'Available Credit'}</span>
            <PriceTag amount={creditBalance} currencyCode={currencyCode} />
          </div>

          <div className='balance-due d-flex justify-content-between row-pad'>
            <span className='bold'>
              {/* TODO: Add Label.BalanceDueWithoutColon translation key instead of string replacement */}
              {/* https://roblox.atlassian.net/browse/PAY-12066 */}
              {(translate(TRANSLATION_KEYS.BalanceDueLabel) || 'Balance Due:').replace(':', '')}
            </span>
            <PriceTag amount={totalBalanceDue * -1} currencyCode={currencyCode} />
          </div>

          {/* Tax Display - Only shown when tax flow is enabled */}
          <TaxDisplay
            visible={isTaxFlowEnabled}
            translate={translate}
            tax={tax}
            taxRate={taxRate}
            isLoading={taxLoading}
            taxDisplay={taxDisplay}
          />

          <div className='rbx-divider' />

          {/* Credit After Transaction */}
          <div className='remaining-balance d-flex justify-content-between row-pad'>
            <span className='bold'>
              {translate(TRANSLATION_KEYS.RemainingBalance) || 'Remaining Balance'}
            </span>
            <PriceTag
              amount={creditBalance - totalBalanceDue - (taxDisplay && tax ? tax.amount : 0)}
              currencyCode={currencyCode}
            />
          </div>
          {!isTaxFlowEnabled && (
            <div className='purchase-prompt'>
              {numberOfPurchase === 1
                ? translate(TRANSLATION_KEYS.LargestPackageYouCanBuyStep1Message) ||
                  'Largest package you can buy with your available credit:'
                : translate(TRANSLATION_KEYS.NextLargestPackageStep2Message)}
              {/* Manual adjustment: -2px translateY for better visual alignment despite not being mathematically centered */}
              <span className='robux-amount-inline'>
                {' '}
                <span className='icon-robux-16x16' style={{ transform: 'translateY(-2px)' }} />
                {robuxAmountInPackage}
              </span>
              {'. '}
              {translate(
                TRANSLATION_KEYS.ConvertCreditToRobuxMessageTwentyFivePercentMoreStandalone
              )}
            </div>
          )}

          {/* Billing Information Section - Only shown when tax flow is enabled */}
          {isTaxFlowEnabled && (
            <React.Fragment key='tax-flow-sections'>
              <div className='billing-info-section'>
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
          )}

          <div className='modal-footer-buttons d-flex justify-content-between mt-4'>
            {isLoading ? (
              <button
                type='button'
                className='btn-growth-md btn-full-width mr-2 loading-button-container'
                disabled>
                <span className='loading-button-text'>{translate(TRANSLATION_KEYS.BuyAction)}</span>
                <span className='spinner spinner-sm loading-button-spinner' />
              </button>
            ) : (
              <Button
                variant={Button.variants.growth}
                size={Button.sizes.medium}
                width={Button.widths.full}
                onClick={handlePurchase}
                isDisabled={!isPurchasable}
                className='mr-2'>
                {translate(TRANSLATION_KEYS.BuyAction)}
              </Button>
            )}
          </div>
        </div>
      }
      actionButtonShow={false}
    />
  );
};

export default withTranslations(PurchasePackageModal, translationConfig);
export { modalService as purchasePackageModalService };
