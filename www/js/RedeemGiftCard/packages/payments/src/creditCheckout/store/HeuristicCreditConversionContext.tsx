/* eslint-disable @typescript-eslint/no-floating-promises */
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  FC,
  PropsWithChildren,
} from "react";
import { TranslateFunction } from "react-utilities";
import { TSystemFeedbackService } from "react-style-guide";
import { urlService } from "core-utilities";
import {
  getNextPurchasableMetadata,
  processPayment as redeemProcessPayment,
  preparePaymentForCreditConversion,
  sendPreparePaymentStatusEvent,
  sendGetNextPurchasableMetadataStatusEvent,
} from "../services/redeemGiftCardService";
import {
  preparePayment,
  updateAddressForCheckoutSession,
  processPayment,
} from "../services/CreditBalancePaymentService";
import type { Address } from "@rbx/payments/billingAddress";
import { usePaymentSession } from "@rbx/payments/services/paymentSession";
import Constants from "../constants/Constants";
import {
  COUNTER_METRICS,
  TRANSLATION_KEYS,
  SYSTEM_FEEDBACK_CONFIG,
} from "../constants/redeemConstants";
import { trackCounter } from "../observability";
import {
  isEconomicRestrictionError,
  getEconomicRestrictionErrorMsg,
} from "../utils/economicRestrictionError";
import {
  createTaxData,
  processPaymentWithCommonHandling,
  PaymentResult,
} from "@rbx/payments/utils";
import { TProcessPayment, TNextPurchasableMetadata } from "../constants/redeemTypeDefinitions";
import { ErrorUtils } from "../utils/errorUtils";
import { createApiCaller } from "../utils/paymentsApiCaller";

/**
 * Private function to handle the specific edge case where:
 * - User is in credit conversion flow
 * - Address update returns InvalidProduct error
 * - System needs to switch from credit conversion to product purchase
 *
 * This function checks if the error indicates CodedExceptionInvalidProduct, and if so,
 * calls get-next-purchasable-metadata with the address to get alternative
 * purchasable options and switches to the appropriate modal.
 *
 * @param error - The error from updateAddressForCheckoutSession
 * @param updatedAddress - The address that was being updated
 * @param getNextPurchasableAndProcessFn - Function to get next purchasable metadata and process it
 * @returns Promise<boolean> - true if this was an InvalidProduct error and switch succeeded, false otherwise
 */
const handleCreditConversionToProductSwitch = async (
  error: unknown,
  updatedAddress: Address,
  getNextPurchasableAndProcessFn: (address?: Address) => Promise<void>,
): Promise<boolean> => {
  if (!ErrorUtils.isInvalidProduct(error)) {
    return false;
  }

  try {
    trackCounter("CreditConversion_SwitchedToProductPurchase");

    await getNextPurchasableAndProcessFn(updatedAddress);

    return true;
  } catch (metadataError) {
    trackCounter("CreditConversion_ProductSwitchFailed");
    return false;
  }
};

// Type definitions for payment result data structures
interface CreditBalancePaymentProviderPayload {
  CheckoutSessionToken?: string;
  TaxAmount?: number;
  CurrencyCode?: string;
  AvailableCreditBalance?: number;
  RobuxConversionAmount?: number;
  ResponseMessage?: string;
  IsSuccessful?: boolean;
}

interface CreditBalancePaymentData {
  isSuccess?: boolean;
  providerPayload?: CreditBalancePaymentProviderPayload;
}

interface CreditBalancePaymentResult extends PaymentResult {
  data?: CreditBalancePaymentData;
}

interface RedeemPaymentResult extends PaymentResult {
  data?: TProcessPayment;
}

interface Money {
  amount: number;
  currencyCode: string;
}

interface HeuristicCreditConversionContextState {
  // Modal state
  isPurchaseModalOpen: boolean;
  isConvertModalOpen: boolean;

  // Loading and error states
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;

  // Product and payment data
  productId: number;
  numberOfPurchase: number;
  creditBalance: number;
  currencyCode: string;
  convertedRobuxAmount: number;
  totalBalanceDue: number;
  robuxAmountInPackage: number;

  // Tax and billing data
  tax: Money | undefined;
  taxRate: number | undefined;
  taxLoading: boolean;
  taxDisplay: boolean;
  isTaxFlowEnabled: boolean;
  checkoutSessionId: number | undefined;
  prefilledAddress: Address | undefined;
  isPurchasable: boolean;

  // Modal actions
  startCreditConversionFlow: (address?: Address) => void;
  closePurchaseModal: () => void;
  closeConvertModal: () => void;

  // Payment actions
  onUpdatedAddress: (address: Address) => Promise<void>;
  onTaxDisplayChange: (displayTax: boolean) => void;
  processPaymentAction: () => Promise<void>;

  // State updates
  updateError: (message: string) => void;
  setSavedUserAddress: (address: Address | undefined) => void;
}

const HeuristicCreditConversionReactContext = createContext<
  HeuristicCreditConversionContextState | undefined
>(undefined);

interface HeuristicCreditConversionContextProps {
  systemFeedbackService: TSystemFeedbackService;
  translate: TranslateFunction;
  onSuccess?: (isCreditConversion: boolean) => void;
}

export const HeuristicCreditConversionContext: FC<
  PropsWithChildren<HeuristicCreditConversionContextProps>
> = ({ children, systemFeedbackService, translate, onSuccess }) => {
  const paymentSession = usePaymentSession();

  // Modal state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Product and payment data
  const [productId, setProductId] = useState(0);
  const [numberOfPurchase, setNumberOfPurchase] = useState(0);
  const [totalBalanceDue, setTotalBalanceDue] = useState(0);
  const [robuxAmountInPackage, setRobuxAmountInPackage] = useState(0);

  // Payment metadata (single source of truth for payment-related data)
  const [paymentMetadata, setPaymentMetadata] =
    useState<CreditBalancePaymentProviderPayload | null>(null);
  const [hasBillingAddress, setHasBillingAddress] = useState(false);

  // Track if current address is from saved settings to avoid over-prefilling
  const [isCurrentAddressFromSaved, setIsCurrentAddressFromSaved] = useState(false);

  // Tax and billing data
  const [taxAmount, setTaxAmount] = useState<number | undefined>(undefined);
  const [taxRate, setTaxRate] = useState<number | undefined>(undefined);
  const [taxDisplay, setTaxDisplay] = useState(false);
  const [taxLoading, setTaxLoading] = useState(false);
  const [isPurchasable, setIsPurchasable] = useState(false);
  const [isTaxFlowEnabled, setIsTaxFlowEnabled] = useState<boolean>(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState<number | undefined>(undefined);
  const [checkoutSessionToken, setCheckoutSessionToken] = useState<string | undefined>(undefined);
  const [prefilledAddress, setPrefilledAddress] = useState<Address | undefined>(undefined);
  const [isValidAddress, setIsValidAddress] = useState(true);

  // Payments API caller with error handling, retry logic, and user feedback
  const apiCaller = useMemo(
    () => createApiCaller(systemFeedbackService, translate),
    [systemFeedbackService, translate],
  );

  const alertErrorAndCloseModals = useCallback(
    (warning: string, redirect: boolean) => {
      systemFeedbackService.warning(
        warning,
        SYSTEM_FEEDBACK_CONFIG.TIMEOUT_SHOW_MS,
        SYSTEM_FEEDBACK_CONFIG.TIMEOUT_HIDE_MS,
      );
      setIsPurchaseModalOpen(false);
      setIsConvertModalOpen(false);
      if (redirect) {
        window.location.href = urlService.getAbsoluteUrl("/upgrades/robux");
      }
    },
    [systemFeedbackService],
  );

  const alertGenericErrorAndCloseModals = useCallback(() => {
    alertErrorAndCloseModals(
      translate(TRANSLATION_KEYS.GenericFailureAlert) ||
        "Something went wrong! Please try again later.",
      true,
    );
  }, [alertErrorAndCloseModals, translate]);

  const showAlert = useCallback(
    (isSuccessful: boolean, productIdParam: number) => {
      const isCreditConversion = !productIdParam;
      if (isSuccessful) {
        systemFeedbackService.success(
          translate(
            isCreditConversion
              ? TRANSLATION_KEYS.ConvertedCreditToRobuxSuccessAlert
              : TRANSLATION_KEYS.RobuxPackagePurchasedSuccessAlert,
          ),
        );
        if (onSuccess) {
          onSuccess(isCreditConversion);
        }
      } else {
        systemFeedbackService.warning(
          translate(
            isCreditConversion
              ? TRANSLATION_KEYS.ConvertedCreditToRobuxFailedAlert
              : TRANSLATION_KEYS.RobuxPackagePurchasedFailedAlert,
          ) ||
            translate(TRANSLATION_KEYS.GenericFailureAlert) ||
            "Something went wrong! Please try again later.",
          SYSTEM_FEEDBACK_CONFIG.TIMEOUT_SHOW_MS,
          SYSTEM_FEEDBACK_CONFIG.TIMEOUT_HIDE_MS,
        );
      }
    },
    [systemFeedbackService, translate, onSuccess],
  );

  // Helper function to update payment metadata (preserves existing fields)
  const updatePaymentMetadata = useCallback(
    (providerPayload: CreditBalancePaymentProviderPayload, hasBillingAddressFlag = false) => {
      // Extract TaxAmount to set in separate state
      const { TaxAmount, ...otherPayload } = providerPayload;

      // Set tax amount separately
      if (TaxAmount !== undefined) {
        setTaxAmount(TaxAmount);
      }

      // Merge with existing metadata to preserve fields
      setPaymentMetadata(prev => ({ ...prev, ...otherPayload }));
      setHasBillingAddress(hasBillingAddressFlag);

      // Set checkout session token if provided (still needed as separate state)
      if (providerPayload.CheckoutSessionToken !== undefined) {
        setCheckoutSessionToken(providerPayload.CheckoutSessionToken);
      }
    },
    [setPaymentMetadata, setHasBillingAddress, setCheckoutSessionToken, setTaxAmount],
  );

  // Helper function to handle common payment preparation logic
  const processPaymentPreparation = useCallback(
    (preparePaymentData: {
      robloxManagedTax: boolean;
      checkoutSessionId: number;
      providerPayload: CreditBalancePaymentProviderPayload;
      hasBillingAddress: boolean;
      taxRate?: number;
    }) => {
      setIsTaxFlowEnabled(preparePaymentData.robloxManagedTax);
      setCheckoutSessionId(preparePaymentData.checkoutSessionId);

      // Set tax rate from top-level response
      if (preparePaymentData.taxRate !== undefined) {
        setTaxRate(preparePaymentData.taxRate);
      }

      // Directly update payment metadata (eliminating duplication)
      if (preparePaymentData.providerPayload.CurrencyCode) {
        updatePaymentMetadata(
          preparePaymentData.providerPayload,
          preparePaymentData.hasBillingAddress,
        );
      }
    },
    [setIsTaxFlowEnabled, setCheckoutSessionId, updatePaymentMetadata],
  );

  // Helper function to prepare payment for product purchases
  const preparePaymentForProduct = useCallback(
    async (metadata: TNextPurchasableMetadata, address?: Address) => {
      if (metadata.productId === 0) {
        return null;
      }

      const prepareResult = await apiCaller.call(
        () =>
          preparePayment(
            metadata.productId,
            Constants.PaymentMethod.Credit,
            paymentSession,
            address,
          ),
        "PreparePayment",
      );

      const { data: preparePaymentData } = prepareResult;
      if (preparePaymentData.isSuccess) {
        processPaymentPreparation(preparePaymentData);

        // Balance Due should be the product price (before tax)
        if (preparePaymentData.selectedProduct?.price !== undefined) {
          setTotalBalanceDue(preparePaymentData.selectedProduct.price);
        }

        sendPreparePaymentStatusEvent(
          true,
          preparePaymentData.robloxManagedTax,
          true,
          preparePaymentData.taxRate !== null,
        );
        return preparePaymentData.checkoutSessionId;
      }

      return null;
    },
    [paymentSession, processPaymentPreparation, setTotalBalanceDue, apiCaller],
  );

  // Helper function to prepare payment for credit conversion
  const preparePaymentForConversion = useCallback(
    async (address?: Address) => {
      const prepareResult = await apiCaller.call(
        () => preparePaymentForCreditConversion(paymentSession, address),
        "PreparePaymentForCreditConversion",
      );

      const { data: preparePaymentData } = prepareResult;

      if (preparePaymentData.isSuccess) {
        processPaymentPreparation(preparePaymentData);
        sendPreparePaymentStatusEvent(
          true,
          preparePaymentData.robloxManagedTax,
          false,
          preparePaymentData.taxRate !== null,
        );
        return preparePaymentData.checkoutSessionId;
      }

      return null;
    },
    [paymentSession, processPaymentPreparation, apiCaller],
  );

  // Helper function to open the appropriate modal based on flow type
  const openModalForFlow = useCallback(
    (metadata: TNextPurchasableMetadata) => {
      if (metadata.productId !== 0) {
        setIsPurchaseModalOpen(true);
        setIsConvertModalOpen(false);
        trackCounter("GetNextPurchasable_Success", { type: "productPurchase" });
      } else {
        setIsConvertModalOpen(true);
        setIsPurchaseModalOpen(false);
        trackCounter("GetNextPurchasable_Success", { type: "conversion" });
      }
    },
    [setIsPurchaseModalOpen, setIsConvertModalOpen],
  );

  // Helper function to handle insufficient credit balance scenario
  const handleInsufficientCredit = useCallback(
    (balance: number) => {
      setIsConvertModalOpen(false);
      setIsPurchaseModalOpen(false);
      // Only update balance - preserve other metadata fields
      setPaymentMetadata(prev => (prev ? { ...prev, AvailableCreditBalance: balance } : null));
      trackCounter("GetNextPurchasable_CreditBalanceZero");
    },
    [setIsConvertModalOpen, setIsPurchaseModalOpen, setPaymentMetadata],
  );

  // Helper function to initialize state from metadata
  const initializeFromMetadata = useCallback(
    (metadata: TNextPurchasableMetadata) => {
      // Set initial state from metadata
      setProductId(metadata.productId);

      // For product purchases, set initial values from metadata (may be updated by prepare payment)
      if (metadata.productId !== 0) {
        if (metadata.robuxAmountProductGrant) {
          setRobuxAmountInPackage(metadata.robuxAmountProductGrant);
        }
        if (metadata.balanceDue) {
          setTotalBalanceDue(metadata.balanceDue);
        }
      }
    },
    [setProductId, setRobuxAmountInPackage, setTotalBalanceDue],
  );

  // Helper function to process metadata and open the appropriate modal
  const processMetadataAndOpenModal = useCallback(
    async (metadata: TNextPurchasableMetadata, addressForUpdate?: Address) => {
      // Only prefill if address is provided AND it's not from saved settings
      const shouldPrefill = addressForUpdate && !isCurrentAddressFromSaved;
      setPrefilledAddress(shouldPrefill ? addressForUpdate : undefined);

      // Check for insufficient credit balance scenario
      if (
        metadata.creditBalance === 0 ||
        (metadata.productId === 0 && metadata.robuxConversionAmount === 0)
      ) {
        handleInsufficientCredit(metadata.creditBalance);
        return;
      }

      // Initialize state from metadata
      initializeFromMetadata(metadata);
      const isProductPurchase = metadata.productId !== 0;

      try {
        // Prepare payment and get checkout session ID, passing address to eliminate updateaddress call

        if (isProductPurchase) {
          await preparePaymentForProduct(metadata, addressForUpdate);
        } else {
          await preparePaymentForConversion(addressForUpdate);
        }

        // Open appropriate modal only if prepare payment succeeded
        openModalForFlow(metadata);
      } catch (error) {
        // Handle prepare payment failures gracefully
        // Error banner already shown by apiCaller, just log metrics
        sendPreparePaymentStatusEvent(false, isTaxFlowEnabled, isProductPurchase);
        trackCounter("GetNextPurchasable_Unexpected");
      }
    },
    [
      isCurrentAddressFromSaved,
      initializeFromMetadata,
      handleInsufficientCredit,
      openModalForFlow,
      preparePaymentForProduct,
      preparePaymentForConversion,
      isTaxFlowEnabled,
    ],
  );

  // Helper function that combines getting next purchasable metadata and processing it
  const getNextPurchasableAndProcess = useCallback(
    async (addressForUpdate?: Address) => {
      const result = await apiCaller.callWithRetry(
        () => getNextPurchasableMetadata(addressForUpdate),
        "GetNextPurchasable",
        COUNTER_METRICS.GET_NEXT_PURCHASABLE_FAILED_STATUS_CODE_PREFIX,
      );

      if (result.status !== 200) {
        sendGetNextPurchasableMetadataStatusEvent(false);
        throw new Error(`Get next purchasable metadata failed with status ${result.status}`);
      }

      sendGetNextPurchasableMetadataStatusEvent(true);
      await processMetadataAndOpenModal(result.data, addressForUpdate);
    },
    [apiCaller, processMetadataAndOpenModal],
  );

  const getNextPurchasable = useCallback(
    async (addressForUpdate?: Address) => {
      setIsLoading(true);
      try {
        await getNextPurchasableAndProcess(addressForUpdate);
      } catch (e) {
        trackCounter("GetNextPurchasable_Unexpected");
      } finally {
        setIsLoading(false);
      }
    },
    [getNextPurchasableAndProcess],
  );

  useEffect(() => {
    const creditBalance = paymentMetadata?.AvailableCreditBalance ?? 0;
    const robuxConversionAmount = paymentMetadata?.RobuxConversionAmount ?? 0;

    let baseValidation;
    if (isError) {
      baseValidation = false;
    } else if (isTaxFlowEnabled) {
      baseValidation = taxDisplay && !taxLoading;
    } else {
      baseValidation = true;
    }

    let balanceValidation;
    if (productId === 0) {
      // Conversion validation: need credit to convert and a valid conversion amount
      balanceValidation = creditBalance > 0 && robuxConversionAmount > 0;
    } else {
      // Product purchase validation: need enough credit to buy the product
      balanceValidation = creditBalance >= totalBalanceDue;
    }

    setIsPurchasable(baseValidation && balanceValidation);
  }, [
    taxLoading,
    taxDisplay,
    paymentMetadata?.AvailableCreditBalance,
    paymentMetadata?.RobuxConversionAmount,
    totalBalanceDue,
    isValidAddress,
    isError,
    productId,
    isTaxFlowEnabled,
  ]);

  const onTaxDisplayChange = useCallback((displayTax: boolean) => {
    setTaxDisplay(displayTax);
  }, []);

  const onUpdatedAddress = useCallback(
    async (updatedAddress: Address) => {
      // Only reset tax-related fields when updating address
      setIsValidAddress(true);
      if (!checkoutSessionId) {
        return;
      }

      try {
        setTaxLoading(true);
        const {
          data: {
            providerPayload: {
              AvailableCreditBalance,
              CurrencyCode,
              TaxAmount,
              CheckoutSessionToken,
              RobuxConversionAmount,
              TotalDue,
            },
            taxRate: updatedTaxRate,
          },
        } = await apiCaller.callAddressUpdate(
          () => updateAddressForCheckoutSession(updatedAddress, checkoutSessionId),
          COUNTER_METRICS.UPDATE_ADDRESS_FAILED_STATUS_CODE_PREFIX,
        );

        // Check if available credit is sufficient for the total due
        if (AvailableCreditBalance < TotalDue) {
          // Special logic when credit is insufficient

          // Call get-next-purchasable-metadata with the current billing address
          // to potentially get different purchasable options that fit within available credit
          // Pass the address to preserve user's manual input when switching modals
          try {
            await getNextPurchasableAndProcess(updatedAddress);
          } catch (metadataError) {
            // TODO: Handle error case - possibly show generic insufficient credit message
            // For now, we'll let the insufficient credit scenario continue normally
          }

          // Do not update modal values when credit is insufficient
          setTaxLoading(false);
          // TODO: Show user feedback about insufficient credit
          // TODO: Possibly trigger alternative payment flow or close modal
          return;
        }

        // Use helper function to update common payment metadata only if credit is sufficient
        updatePaymentMetadata(
          {
            AvailableCreditBalance,
            CurrencyCode,
            TaxAmount,
            CheckoutSessionToken,
            RobuxConversionAmount,
          },
          true, // Address updates always have billing address
        );
        // Set tax rate from top-level response
        if (updatedTaxRate !== undefined) {
          setTaxRate(updatedTaxRate);
        }
        setTaxLoading(false);

        // Parent state will be updated after successful payment completion
      } catch (error) {
        // Try to handle the credit conversion to product switch scenario for InvalidProduct error from updateAddressForCheckoutSession
        if (
          await handleCreditConversionToProductSwitch(
            error,
            updatedAddress,
            getNextPurchasableAndProcess,
          )
        ) {
          return;
        }

        // Error handling and user feedback handled by apiCaller
        // Set local state for UI purposes
        setTaxLoading(false);

        // Set error state to disable the button
        setIsError(true);
        setErrorMessage(
          translate(TRANSLATION_KEYS.GenericFailureAlert) ||
            "Something went wrong! Please try again later.",
        );
      }
    },
    [
      checkoutSessionId,
      updatePaymentMetadata,
      getNextPurchasableAndProcess,
      setIsValidAddress,
      translate,
      apiCaller,
    ],
  );

  // Helper function to handle common payment success/failure logic
  const handlePaymentSuccess = useCallback(
    async (isSuccessful: boolean, _responseMessage: string) => {
      const paymentType = productId !== 0 ? "productPurchase" : "conversion";

      if (isSuccessful) {
        const isProductPurchase = productId !== 0;

        if (isProductPurchase) {
          // For product purchases, check for next purchasable options
          await getNextPurchasable();
        } else {
          // For credit conversions, close the modal since balance will be 0
          setIsConvertModalOpen(false);
        }

        setNumberOfPurchase(numberOfPurchase + 1);
        trackCounter("ProcessPayment_Redirected");
      } else {
        setIsPurchaseModalOpen(false);
        setIsConvertModalOpen(false);
        trackCounter("ProcessPayment_Unsuccessful", { type: paymentType });
      }
    },
    [
      getNextPurchasable,
      numberOfPurchase,
      setNumberOfPurchase,
      setIsPurchaseModalOpen,
      setIsConvertModalOpen,
      productId,
    ],
  );

  const processPaymentAction = useCallback(async () => {
    setIsLoading(true);
    try {
      if (checkoutSessionToken) {
        await processPaymentWithCommonHandling(
          () =>
            processPayment(
              productId,
              "",
              "",
              checkoutSessionToken,
              paymentSession?.id,
              checkoutSessionId,
            ),
          {
            failedStatusPrefix: COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX,
            onStatusError: () => {
              showAlert(false, productId);
              setIsLoading(false);
            },
            onSuccess: async (result: CreditBalancePaymentResult, isSuccessful: boolean) => {
              const providerPayload = result.data?.providerPayload;
              showAlert(isSuccessful, productId);
              await handlePaymentSuccess(isSuccessful, providerPayload?.ResponseMessage || "");
            },
          },
        );
      } else {
        // Fallback to original processPayment for credit conversion
        await processPaymentWithCommonHandling(() => redeemProcessPayment(productId), {
          failedStatusPrefix: COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX,
          onStatusError: () => {
            showAlert(false, productId);
            setIsLoading(false);
          },
          onSuccess: async (result: RedeemPaymentResult) => {
            const processedResult = result.data;
            // For redeem payment, success is determined by both isSuccess and providerPayload.IsSuccessful
            const actuallySuccessful =
              (processedResult?.isSuccess && processedResult?.providerPayload?.IsSuccessful) ??
              false;
            showAlert(processedResult?.isSuccess ?? false, productId);
            await handlePaymentSuccess(
              actuallySuccessful,
              processedResult?.providerPayload?.ResponseMessage || "",
            );
          },
        });
      }
    } catch (e) {
      if (isEconomicRestrictionError(e)) {
        alertErrorAndCloseModals(
          getEconomicRestrictionErrorMsg({
            translate,
            violation: e.data.failureReason,
            timeoutDurationInMinutes: e.data.expirationTimeInMinutes,
          }),
          false,
        );
        trackCounter("ProcessPayment_EconomicRestriction");
        return;
      }
      alertGenericErrorAndCloseModals();
      trackCounter("ProcessPayment_Unexpected");
    } finally {
      setIsLoading(false);
    }
  }, [
    checkoutSessionToken,
    productId,
    paymentSession,
    checkoutSessionId,
    showAlert,
    alertErrorAndCloseModals,
    alertGenericErrorAndCloseModals,
    translate,
    handlePaymentSuccess,
  ]);

  const startCreditConversionFlow = useCallback(
    (addressForUpdate?: Address) => {
      setNumberOfPurchase(0);
      // Clear any previous error state when starting new flow
      setIsError(false);
      setErrorMessage("");
      getNextPurchasable(addressForUpdate);
      setNumberOfPurchase(1);
    },
    [getNextPurchasable],
  );

  const closePurchaseModal = useCallback(() => {
    setIsPurchaseModalOpen(false);
    trackCounter("ProductPurchase_CancelClicked");
  }, []);

  const closeConvertModal = useCallback(() => {
    setIsConvertModalOpen(false);
    trackCounter("Conversion_CancelClicked");
  }, []);

  const updateError = useCallback((message: string): void => {
    setIsError(true);
    setErrorMessage(message);
  }, []);

  const handleSavedAddressLoaded = useCallback((address: Address | undefined) => {
    setIsCurrentAddressFromSaved(address !== undefined);
  }, []);

  const contextValue = useMemo(
    () => ({
      // Modal state
      isPurchaseModalOpen,
      isConvertModalOpen,

      // Loading and error states
      isLoading,
      isError,
      errorMessage,

      // Product and payment data
      productId,
      numberOfPurchase,
      creditBalance: paymentMetadata?.AvailableCreditBalance ?? 0, // Derived from metadata
      currencyCode: paymentMetadata?.CurrencyCode ?? "",
      convertedRobuxAmount: paymentMetadata?.RobuxConversionAmount ?? 0, // Derived from metadata
      totalBalanceDue,
      robuxAmountInPackage,

      // Tax and billing data
      tax: paymentMetadata?.CurrencyCode
        ? createTaxData(taxAmount, paymentMetadata.CurrencyCode, hasBillingAddress)
        : undefined,
      taxRate,
      taxLoading,
      taxDisplay,
      isTaxFlowEnabled,
      checkoutSessionId,
      prefilledAddress,
      isPurchasable,

      // Modal actions
      startCreditConversionFlow,
      closePurchaseModal,
      closeConvertModal,

      // Payment actions
      onUpdatedAddress,
      onTaxDisplayChange,
      processPaymentAction,

      // State updates
      updateError,
      setSavedUserAddress: handleSavedAddressLoaded,
    }),
    [
      isPurchaseModalOpen,
      isConvertModalOpen,
      isLoading,
      isError,
      errorMessage,
      productId,
      numberOfPurchase,
      paymentMetadata, // Single source of truth
      hasBillingAddress,
      taxAmount,
      taxRate,
      taxLoading,
      taxDisplay,
      totalBalanceDue,
      robuxAmountInPackage,
      isTaxFlowEnabled,
      checkoutSessionId,
      prefilledAddress,
      isPurchasable,
      startCreditConversionFlow,
      closePurchaseModal,
      closeConvertModal,
      onUpdatedAddress,
      onTaxDisplayChange,
      processPaymentAction,
      updateError,
      handleSavedAddressLoaded,
    ],
  );

  return (
    <HeuristicCreditConversionReactContext.Provider value={contextValue}>
      {children}
    </HeuristicCreditConversionReactContext.Provider>
  );
};

export const useHeuristicCreditConversionData = (): HeuristicCreditConversionContextState => {
  const context = useContext(HeuristicCreditConversionReactContext);
  if (context === undefined) {
    throw new Error(
      "useHeuristicCreditConversionData must be used within a HeuristicCreditConversionContext",
    );
  }
  return context;
};
