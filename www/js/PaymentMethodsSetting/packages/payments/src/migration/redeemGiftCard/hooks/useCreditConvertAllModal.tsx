/* eslint-disable react-hooks/rules-of-hooks */
import { fireEvent } from 'roblox-event-tracker';
import { TranslateFunction } from 'react-utilities';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, createModal, IModalService, TSystemFeedbackService } from 'react-style-guide';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { urlService } from 'core-utilities';
import { COUNTER_METRICS, SYSTEM_FEEDBACK_CONFIG, TRANSLATION_KEYS } from '../constants/constants';
import {
  preparePaymentForCreditConversion,
  processPayment as redeemProcessPayment,
  sendPreparePaymentStatusEvent,
  sendProcessPaymentStatusEvent,
  sendUpdateAddressForCheckoutSessionStatusEvent
} from '../services/redeemGiftCardService';
import usePaymentSession from '../../core/hooks/usePaymentSession';
import { Money } from '../../creditBalancePayment/constants/typeDefinitions';
import { Address } from '../../billingAddressForm/constants/TypeDefinitions';
import createTaxData from '../../core/utils/taxUtils';
import PriceTag from '../../../priceTag/components/PriceTag';
import { TaxDisplay } from '../components/HeuristicConvertedToCredit/TaxDisplay';
import BillingInfoForm from '../../billingAddressForm/App';
import { processPaymentWithCommonHandling, PaymentResult } from '../../core/utils/paymentUtils';
import {
  updateAddressForCheckoutSession,
  processPayment
} from '../../creditBalancePayment/services/CreditBalancePaymentService';
import {
  getEconomicRestrictionErrorMsg,
  isEconomicRestrictionError
} from '../utils/economicRestrictionError';

type CreditConvertAllModalProps = {
  systemFeedbackService: TSystemFeedbackService;
  translate: TranslateFunction;
  onSuccess?: (isCreditConversion: boolean) => void;
};

interface ICreditConvertAllModalService extends IModalService {
  open: (address?: Address) => void;
}

const createCreditConvertAllModal = (): [
  ({ translate, systemFeedbackService, onSuccess }: CreditConvertAllModalProps) => JSX.Element,
  ICreditConvertAllModalService
] => {
  const [Modal, modalService] = createModal();
  const setPrefilledAddressRef = useRef<((address?: Address) => void) | null>(null);
  const preparePaymentRef = useRef<((address?: Address) => Promise<void>) | null>(null);

  const CreditConvertAllModal = ({
    translate,
    systemFeedbackService,
    onSuccess
  }: CreditConvertAllModalProps) => {
    const paymentSession = usePaymentSession();
    const productId = 0;
    const [isTaxFlowEnabled, setIsTaxFlowEnabled] = useState<boolean>(false);
    const [checkoutSessionId, setCheckoutSessionId] = useState<number | undefined>(undefined);
    const [checkoutSessionToken, setCheckoutSessionToken] = useState<string | undefined>(undefined);
    const [taxRate, setTaxRate] = useState<number | undefined>(undefined);
    const [convertedRobuxAmount, setConvertedRobuxAmount] = useState<number>(0);
    const [strikethroughRobuxConversionAmount, setStrikethroughRobuxConversionAmount] = useState<
      number | undefined
    >(undefined);
    const [creditBalance, setCreditBalance] = useState<number>(0);
    const [currencyCode, setCurrencyCode] = useState<string>('');
    const [taxDisplay, setTaxDisplay] = useState<boolean>(false);
    const [tax, setTax] = useState<Money | undefined>(undefined);
    const [taxLoading, setTaxLoading] = useState<boolean>(false);
    const [hasBillingAddress, setHasBillingAddress] = useState(false);
    const [processAddressSave, setProcessAddressSave] = useState<boolean>(false);
    const [isPurchaseLoading, setIsPurchaseLoading] = useState<boolean>(false);
    const [isPurchasable, setIsPurchasable] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [prefilledAddress, setPrefilledAddress] = useState<Address | undefined>(undefined);

    const preparePayment = useCallback(
      async (address?: Address) => {
        try {
          setTaxLoading(true);
          const prepareResult = await preparePaymentForCreditConversion(paymentSession, address);
          const { data: preparePaymentData } = prepareResult;
          if (preparePaymentData.isSuccess) {
            setIsTaxFlowEnabled(preparePaymentData.robloxManagedTax);
            setCheckoutSessionId(preparePaymentData.checkoutSessionId);
            setCheckoutSessionToken(preparePaymentData.providerPayload.CheckoutSessionToken);
            setHasBillingAddress(preparePaymentData.hasBillingAddress);
            if (preparePaymentData.taxRate !== undefined) {
              setTaxRate(preparePaymentData.taxRate);
            }
            setConvertedRobuxAmount(preparePaymentData.providerPayload.RobuxConversionAmount ?? 0);
            setStrikethroughRobuxConversionAmount(
              preparePaymentData.providerPayload.StrikethroughRobuxConversionAmount ?? undefined
            );
            setCreditBalance(preparePaymentData.providerPayload.AvailableCreditBalance ?? 0);
            setCurrencyCode(preparePaymentData.providerPayload.CurrencyCode ?? '');
            setTax(
              createTaxData(
                preparePaymentData.providerPayload.TaxAmount,
                preparePaymentData.providerPayload.CurrencyCode,
                preparePaymentData.hasBillingAddress || address !== undefined
              )
            );
            sendPreparePaymentStatusEvent(
              true,
              preparePaymentData.robloxManagedTax,
              false,
              preparePaymentData.taxRate !== null
            );
          }
        } catch (error) {
          setIsError(true);
        } finally {
          setTaxLoading(false);
        }
      },
      [paymentSession]
    );

    // Store setter and preparePayment in ref for modal service access
    useEffect(() => {
      setPrefilledAddressRef.current = setPrefilledAddress;
      preparePaymentRef.current = preparePayment;
    }, [preparePayment]);

    useEffect(() => {
      let baseValidation;
      if (isError) {
        baseValidation = false;
      } else if (isTaxFlowEnabled) {
        baseValidation = taxDisplay && !taxLoading;
      } else {
        baseValidation = true;
      }

      const balanceValidation = creditBalance > 0 && convertedRobuxAmount > 0;
      setIsPurchasable(baseValidation && balanceValidation);
    }, [creditBalance, convertedRobuxAmount, isTaxFlowEnabled, taxDisplay, taxLoading, isError]);

    const handleAddressUpdate = useCallback(
      async (updatedAddress: Address) => {
        try {
          if (!checkoutSessionId) {
            return;
          }
          setTaxLoading(true);
          const {
            data: {
              providerPayload: {
                AvailableCreditBalance,
                CurrencyCode,
                TaxAmount,
                CheckoutSessionToken,
                RobuxConversionAmount,
                StrikethroughRobuxConversionAmount,
                TotalDue
              },
              taxRate: updatedTaxRate
            }
          } = await updateAddressForCheckoutSession(updatedAddress, checkoutSessionId);

          setConvertedRobuxAmount(RobuxConversionAmount ?? 0);
          setStrikethroughRobuxConversionAmount(StrikethroughRobuxConversionAmount ?? undefined);
          setCreditBalance(AvailableCreditBalance);
          setCurrencyCode(CurrencyCode);
          setTax(createTaxData(TaxAmount, CurrencyCode, true));
          setTaxRate(updatedTaxRate);
          setCheckoutSessionToken(CheckoutSessionToken);
          setTaxLoading(false);
          sendUpdateAddressForCheckoutSessionStatusEvent(true, isTaxFlowEnabled, false);
        } catch (error) {
          setIsError(true);
          sendUpdateAddressForCheckoutSessionStatusEvent(false, isTaxFlowEnabled, false);
        }
      },
      [checkoutSessionId, isTaxFlowEnabled]
    );

    const onTaxDisplayChange = useCallback((displayTax: boolean) => {
      setTaxDisplay(displayTax);
    }, []);

    const showAlert = useCallback(
      (isSuccessful: boolean, productIdParam: number) => {
        const isCreditConversion = !productIdParam;
        if (isSuccessful) {
          systemFeedbackService.success(
            translate(
              isCreditConversion
                ? TRANSLATION_KEYS.ConvertedCreditToRobuxSuccessAlert
                : TRANSLATION_KEYS.RobuxPackagePurchasedSuccessAlert
            )
          );
          if (onSuccess) {
            onSuccess(isCreditConversion);
          }
        } else {
          systemFeedbackService.warning(
            translate(
              isCreditConversion
                ? TRANSLATION_KEYS.ConvertedCreditToRobuxFailedAlert
                : TRANSLATION_KEYS.RobuxPackagePurchasedFailedAlert
            ) ||
              translate(TRANSLATION_KEYS.GenericFailureAlert) ||
              'Something went wrong! Please try again later.',
            SYSTEM_FEEDBACK_CONFIG.TIMEOUT_SHOW_MS,
            SYSTEM_FEEDBACK_CONFIG.TIMEOUT_HIDE_MS
          );
        }
      },
      [systemFeedbackService, translate, onSuccess]
    );

    const alertErrorAndCloseModals = useCallback(
      (warning: string, redirect: boolean) => {
        systemFeedbackService.warning(
          warning,
          SYSTEM_FEEDBACK_CONFIG.TIMEOUT_SHOW_MS,
          SYSTEM_FEEDBACK_CONFIG.TIMEOUT_HIDE_MS
        );
        modalService.close();
        if (redirect) {
          window.location.href = urlService.getAbsoluteUrl('/upgrades/robux');
        }
      },
      [systemFeedbackService]
    );

    const handleConvert = useCallback(async () => {
      if (isTaxFlowEnabled) {
        setProcessAddressSave(true);
      }
      setIsPurchaseLoading(true);
      try {
        if (checkoutSessionToken) {
          await processPaymentWithCommonHandling(
            () =>
              processPayment(
                productId,
                '',
                '',
                checkoutSessionToken,
                paymentSession?.id,
                checkoutSessionId
              ),
            {
              failedStatusPrefix: COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX,
              onStatusError: () => {
                showAlert(false, productId);
                setIsPurchaseLoading(false);
              },
              onSuccess: (result: PaymentResult, isSuccessful: boolean) => {
                showAlert(isSuccessful, productId);
                modalService.close();
              }
            }
          );
        } else {
          // Fallback to original processPayment for credit conversion
          await processPaymentWithCommonHandling(() => redeemProcessPayment(productId), {
            failedStatusPrefix: COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX,
            onStatusError: () => {
              showAlert(false, productId);
              setIsPurchaseLoading(false);
            },
            onSuccess: (result: PaymentResult) => {
              const processedResult = result.data;
              showAlert(processedResult?.isSuccess ?? false, productId);
              modalService.close();
            }
          });
        }
        sendProcessPaymentStatusEvent(true, isTaxFlowEnabled, false);
      } catch (e) {
        sendProcessPaymentStatusEvent(false, isTaxFlowEnabled, false);
        if (isEconomicRestrictionError(e)) {
          alertErrorAndCloseModals(
            getEconomicRestrictionErrorMsg({
              translate,
              violation: e.data.failureReason,
              timeoutDurationInMinutes: e.data.expirationTimeInMinutes
            }),
            false
          );
          fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_ECONOMIC_RESTRICTION);
          return;
        }
        alertErrorAndCloseModals(
          translate(TRANSLATION_KEYS.GenericFailureAlert) ||
            'Something went wrong! Please try again later.',
          true
        );
        fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_UNEXPECTED_EXCEPTION);
      } finally {
        setIsPurchaseLoading(false);
      }
    }, [
      isTaxFlowEnabled,
      checkoutSessionToken,
      paymentSession?.id,
      checkoutSessionId,
      showAlert,
      alertErrorAndCloseModals,
      translate
    ]);

    return (
      <Modal
        id='convert-credit-modal'
        title={translate(TRANSLATION_KEYS.ConvertCreditToRobuxHeading) || 'Convert credit to Robux'}
        onNeutral={() => modalService.close()}
        body={[
          <div key='order-summary' className='order-summary bold'>
            {translate(TRANSLATION_KEYS.OrderSummaryLabel) || 'Order Summary'}
          </div>,
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
                {convertedRobuxAmount >
                  (strikethroughRobuxConversionAmount ??
                    Math.floor(convertedRobuxAmount / 1.25)) && (
                  <span className='high-cogs-robux-amount-inline'>
                    <span
                      className='icon-robux-gray-16x16'
                      style={{ transform: 'translateY(-2px)' }}
                    />
                    {strikethroughRobuxConversionAmount ?? Math.floor(convertedRobuxAmount / 1.25)}
                  </span>
                )}
              </div>
            </span>
          </div>,
          <div
            key='available-credit'
            className='available-credit d-flex justify-content-between row-pad'>
            <span className='bold'>{translate('Label.AvailableCredit') || 'Available Credit'}</span>
            <PriceTag amount={creditBalance} currencyCode={currencyCode} />
          </div>,
          // Tax flow sections - Only shown when tax flow is enabled
          isTaxFlowEnabled && (
            <React.Fragment key='tax-flow-sections'>
              <TaxDisplay
                key='tax-line'
                translate={translate}
                tax={tax}
                taxRate={taxRate}
                isLoading={taxLoading}
                taxDisplay={taxDisplay}
              />
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
            </React.Fragment>
          ),
          <div key='divider' className='rbx-divider' />,
          <div
            key='remaining-balance'
            className='remaining-balance d-flex justify-content-between row-pad'>
            <span className='bold'>
              {translate(TRANSLATION_KEYS.RemainingBalance) || 'Remaining balance'}
            </span>
            <PriceTag amount={0} currencyCode={currencyCode} />
          </div>,
          isTaxFlowEnabled && (
            <div key='billing-info-section' className='billing-info-section'>
              <BillingInfoForm
                processAddressSave={processAddressSave}
                onUpdateAddress={handleAddressUpdate}
                prefilledAddress={prefilledAddress}
                onTaxDisplayChange={onTaxDisplayChange}
                triggeringContext={
                  paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE
                }
              />
            </div>
          ),
          <div
            key='modal-footer-buttons'
            className='modal-footer-buttons d-flex justify-content-between mt-4'>
            {isPurchaseLoading ? (
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
        closeable
      />
    );
  };

  // Create custom modal service that accepts address parameter
  const customModalService: ICreditConvertAllModalService = {
    open: (address?: Address) => {
      // Set prefilled address first
      if (setPrefilledAddressRef.current) {
        setPrefilledAddressRef.current(address);
      }

      if (preparePaymentRef.current) {
        // eslint-disable-next-line no-void
        void preparePaymentRef.current(address);
      }

      modalService.open();
    },
    close: () => modalService.close()
  };

  return [CreditConvertAllModal, customModalService];
};

export default createCreditConvertAllModal;
