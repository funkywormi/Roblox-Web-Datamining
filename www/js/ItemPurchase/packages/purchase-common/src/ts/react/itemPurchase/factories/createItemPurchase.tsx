import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { queryClient } from '@rbx/core-scripts/react';
import { Snackbar } from '@rbx/foundation-ui';
import paymentFlowAnalyticsService from '@rbx/core-scripts/payments-flow';
// TODO(Next): ItemPurchaseUpsellService is a window.Roblox global; swap to the local
// itemPurchaseUpsellService, which itself needs its GUAC/barrel deps de-globaled first.
import { ItemPurchaseUpsellService } from '@rbx/legacy-webapp-types/Roblox';
import * as AccountIntegrityChallengeService from '@rbx/account-security/challenge/runtime';
import { userId, isAuthenticated } from '@rbx/core-scripts/meta/user';
import { generateRandomUuid } from '@rbx/core-lib/uuid';
import { getMetaData } from '../util/itemPurchaseUtil';
import getSubscriptionProductInfoForModal from '../../utils/getSubscriptionProductInfoForModal';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import itemPurchaseService from '../services/itemPurchaseService';
import itemDetailsService from '../services/itemDetailsService';
import createPurchaseConfirmationModal from './createPurchaseConfirmationModal';
import type { CustomPurchaseConfirmationModalProps } from './createPurchaseConfirmationModal';
import createPurchaseVerificationModal from './createPurchaseVerificationModal';
import createInsufficientFundsModal from './createInsufficientFundsModal';
import createTransactionFailureModal from './createTransactionFailureModal';
import createPriceChangedModal from './createPriceChangedModal';
import TwoStepVerificationModal from '../components/TwoStepVerificationModal';
import createUnifiedPurchaseVerificationModal from './createUnifiedPurchaseVerificationModal';
import {
  listAvailableSubscriptionProductsV2,
  ProductType
} from '../../services/subscriptionsApiV2Service';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';
import type { DiscountInformation } from '../../components/discountInformation';
import type {
  DeveloperProductPurchaseErrorResponse,
  DeveloperProductPurchaseResponse,
  GamePassPurchaseResponse,
  PrepareFiatSubscriptionPurchaseResponse,
  PurchaseErrorDetails,
  PurchaseErrorResponse,
  SubscriptionWithRobuxPurchaseResponse
} from '../types/purchase';

const { resources, errorTypeIds, errorStatusText, events, violationLabels } = itemPurchaseConstants;

type HandleErrorArgs = PurchaseErrorDetails & { onDecline?: () => void };

interface ConfirmationData {
  assetIsWearable?: boolean;
  transactionVerb?: string;
  itemDelayed?: boolean;
  expectedPrice?: number;
  onDecline: () => void;
}

export interface HandlePurchaseArgs {
  params: Record<string, unknown>;
  handleError: (args: HandleErrorArgs) => void;
  setLoading: (loading: boolean) => void;
  openConfirmation: (data: ConfirmationData) => void;
  closeAll: () => void;
}

interface UpsellTargetData {
  assetType: string;
  assetTypeDisplayName: string;
  expectedCurrency?: number;
  expectedPrice?: number;
  expectedSellerId: number;
  itemName: string;
  itemType: string;
  productId: number | null;
  userassetId: number;
  placeproductpromotionId: number;
  isPrivateServer: boolean;
  isPlace: boolean;
  collectibleItemId: string | null;
  collectibleItemInstanceId: string | null;
  collectibleProductId: string | null;
  subscriptionTargetKey: string | null;
  rentalOptionDays: number | null;
}

interface UpsellErrorObject {
  shortfallPrice?: number;
  currentCurrency?: number;
  isPlace?: boolean;
}

interface UpsellItemDetail {
  expectedItemPrice?: number;
  assetName?: string;
  isLimited?: boolean;
  buyButtonElementDataset?: UpsellTargetData;
  thumbnail?: React.ReactNode;
  priceSuffix?: string;
  discountInformation?: DiscountInformation | null;
}

// The global's declared signature lags the runtime (extra args, returns a promise).
interface ItemPurchaseUpsellServiceRuntime {
  startItemUpsellProcess: (
    errorObject: UpsellErrorObject,
    itemDetail: UpsellItemDetail,
    startOriginalFlowCallback: () => void,
    itemPurchaseDataElementMap?: { userBalanceRobux: string; imageurl: string; alerturl: string },
    shouldShowUnifiedPurchaseModal?: boolean
  ) => Promise<unknown>;
  showExceedLargestInsufficientRobuxModal?: (
    shortfallPrice: number | undefined,
    targetData: UpsellTargetData,
    startOriginalFlowCallback: () => void,
    itemPurchaseDataElementMap: undefined,
    shouldShowUnifiedPurchaseModal: boolean
  ) => void;
}

const upsellService = ItemPurchaseUpsellService as unknown as
  | ItemPurchaseUpsellServiceRuntime
  | undefined;

type SnackbarIcon = React.ComponentProps<typeof Snackbar>['icon'];

interface Feedback {
  key: string;
  type: string;
  message?: string;
}

export interface ItemPurchaseProps {
  assetName: string;
  assetType?: string;
  assetTypeDisplayName?: string;
  productId?: number | null;
  expectedCurrency?: number;
  expectedPrice?: number | null;
  expectedSellerId: number;
  expectedPromoId?: number;
  userAssetId?: number;
  thumbnail: React.ReactNode;
  sellerName: string;
  sellerType?: string | null;
  showSuccessBanner?: boolean;
  isPlace?: boolean;
  isPrivateServer?: boolean;
  handlePurchase?: ((args: HandlePurchaseArgs) => void) | null;
  onPurchaseSuccess?: () => void;
  collectibleItemId?: string | null;
  collectibleItemInstanceId?: string | null;
  collectibleProductId?: string | null;
  isLimited?: boolean;
  customProps?: Record<string, unknown>;
  rentalOptionDays?: number | null;
  saleLocationId?: number | null;
  discountInformation?: DiscountInformation | null;
  subscriptionTargetKey?: string | null;
  subscriptionPaymentProvider?: string;
  subscriptionSecondaryPaymentProvider?: string;
  subscriptionTitle?: string;
  primaryActionButtonText?: string;
  secondaryActionButtonText?: string;
  subscriptionFooterDisclaimer?: string;
  subscriptionCancelPath?: string;
  displayPrice?: string;
  priceSuffix?: string;
  deepLinkId?: string | null;
}

export interface CustomPurchaseVerificationModalProps {
  assetName: string;
  assetType: string;
  expectedPrice: number;
  thumbnail: React.ReactNode;
  sellerName: string;
  loading: boolean;
  onAction: () => void;
  [customProp: string]: unknown;
}

interface CreateItemPurchaseOptions {
  customPurchaseVerificationModal?: React.ComponentType<CustomPurchaseVerificationModalProps>;
  customPurchaseConfirmationModal?: React.ComponentType<CustomPurchaseConfirmationModalProps>;
  customPurchaseVerificationModalService?: { open: () => void; close: () => void };
  forceUnifiedModal?: boolean;
}

export default function createItemPurchase({
  customPurchaseVerificationModal,
  customPurchaseConfirmationModal,
  customPurchaseVerificationModalService,
  forceUnifiedModal = false
}: CreateItemPurchaseOptions = {}): [React.ComponentType<ItemPurchaseProps>, { start: () => void }] {
  const { userRobuxBalance } = getMetaData();
  const [
    PurchaseVerificationModal,
    purchaseVerificationModalService
  ] = createPurchaseVerificationModal();
  const [
    UnifiedPurchaseVerificationModal,
    unifiedPurchaseVerificationModalService
  ] = createUnifiedPurchaseVerificationModal();
  const [InsufficientFundsModal, insufficientFundsModalService] = createInsufficientFundsModal();
  const [
    PurchaseConfirmationModal,
    purchaseConfirmationModalService
  ] = createPurchaseConfirmationModal({
    customPurchaseConfirmationModal
  });

  const [PriceChangedModal, priceChangedModalService] = createPriceChangedModal();

  const [TransactionFailureModal, transactionFailureModalService] = createTransactionFailureModal();

  let itemUpsellProcessParams: {
    errorObject: UpsellErrorObject;
    itemDetail: UpsellItemDetail;
    startOriginalFlowCallback: () => void;
    shouldShowUnifiedPurchaseModal?: boolean;
  } = {
    errorObject: {},
    itemDetail: {},
    startOriginalFlowCallback: () => null
  };
  const startOriginalFlowWhenNewFlowFailed = () => {
    if (!itemUpsellProcessParams.itemDetail.buyButtonElementDataset) {
      return;
    }
    paymentFlowAnalyticsService.startRobuxUpsellFlow(
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.assetType,
      !!itemUpsellProcessParams.itemDetail.buyButtonElementDataset.userassetId,
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.isPrivateServer,
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.isPlace,
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.productId?.toString()
    );
    insufficientFundsModalService.open();
  };
  const insufficientFundsModalServiceWrapper = (
    shortfallPrice: number | undefined,
    targetData: UpsellTargetData,
    shouldShowUnifiedPurchaseModal: boolean
  ) => () => {
    if (upsellService?.showExceedLargestInsufficientRobuxModal) {
      upsellService.showExceedLargestInsufficientRobuxModal(
        shortfallPrice,
        targetData,
        startOriginalFlowWhenNewFlowFailed,
        undefined,
        shouldShowUnifiedPurchaseModal
      );
    } else {
      startOriginalFlowWhenNewFlowFailed();
    }
  };
  const openInsufficientRobuxModal = () => {
    if (upsellService && itemUpsellProcessParams?.itemDetail?.expectedItemPrice) {
      if ((userRobuxBalance ?? 0) - itemUpsellProcessParams.itemDetail.expectedItemPrice >= 0) {
        startOriginalFlowWhenNewFlowFailed();
        return;
      }
      try {
        const isSubscription =
          itemUpsellProcessParams.itemDetail.buyButtonElementDataset?.assetType === 'Subscription';
        const customAjaxData = isSubscription
          ? {
              userBalanceRobux: String(Number.isFinite(userRobuxBalance) ? userRobuxBalance : 0),
              imageurl: '',
              alerturl: ''
            }
          : undefined;
        upsellService.startItemUpsellProcess(
          itemUpsellProcessParams.errorObject,
          itemUpsellProcessParams.itemDetail,
          itemUpsellProcessParams.startOriginalFlowCallback,
          customAjaxData,
          itemUpsellProcessParams.shouldShowUnifiedPurchaseModal
        ).catch(() => {
          // startItemUpsellProcess invokes the fallback callback before
          // rejecting; catch here to prevent unhandled promise rejection.
        });
        window.EventTracker.fireEvent(events.NEW_UPSELL_FROM_REACT_BUY_BUTTON);
      } catch (e) {
        window.EventTracker.fireEvent(events.NEW_UPSELL_FAILED_DUE_TO_ERROR);
        startOriginalFlowWhenNewFlowFailed();
      }
    } else {
      window.EventTracker.fireEvent(events.NEW_UPSELL_FAILED_DUE_TO_LOADING);
      startOriginalFlowWhenNewFlowFailed();
    }
  };
  const getEconomicRestrictionErrorMsg = (
    translate: PurchaseTranslate,
    violation: string | undefined,
    timeoutDurationInMinutes: number
  ) => {
    const timeoutInHours = Math.ceil(timeoutDurationInMinutes / 60);
    if (timeoutInHours > 24) {
      const timeoutInDays = Math.ceil(timeoutInHours / 24);
      return translate('Text.EconomicRestrictionsDaysGeneral', {
        violation: translate((violationLabels as Record<string, string>)[violation ?? ''] ?? 'Label.Sublabel.FraudPaymentAbuse'),
        day: timeoutInDays
      });
    }
    return translate('Text.EconomicRestrictionsHoursGeneral', {
      violation: translate((violationLabels as Record<string, string>)[violation ?? ''] ?? 'Label.Sublabel.FraudPaymentAbuse'),
      hour: timeoutInHours
    });
  };
  function ItemPurchase({
    translate,
    assetName,
    assetType: assetTypeProp,
    assetTypeDisplayName = '',
    productId = null,
    expectedCurrency,
    expectedPrice: expectedPriceProp,
    expectedSellerId,
    expectedPromoId = 0,
    userAssetId = 0,
    thumbnail,
    sellerName,
    sellerType = null,
    showSuccessBanner = false,
    // for place purchase
    isPlace = false,
    isPrivateServer = false,
    handlePurchase = null,
    onPurchaseSuccess = () => null,
    collectibleItemId = null,
    collectibleItemInstanceId = null,
    collectibleProductId = null,
    isLimited = false,
    customProps = {},
    rentalOptionDays = null,
    saleLocationId = null,
    discountInformation = null,
    // for subscription purchase
    subscriptionTargetKey = null,
    subscriptionPaymentProvider = '',
    subscriptionSecondaryPaymentProvider = '',
    subscriptionTitle = '',
    primaryActionButtonText = '',
    secondaryActionButtonText = '',
    subscriptionFooterDisclaimer = '',
    subscriptionCancelPath = '',
    displayPrice = '',
    priceSuffix = '',
    deepLinkId = null
  }: ItemPurchaseProps & { translate: PurchaseTranslate }) {
    // Some callers (BuyItem) omit assetType or pass a nullish price; forwarded to children unchanged.
    const assetType = assetTypeProp as string;
    const expectedPrice = expectedPriceProp as number;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{
      title?: string;
      message?: string;
      onDecline?: () => void;
    } | null>(null);
    const [newPrice, setNewPrice] = useState<number | null>(null);
    // Preserve legacy behavior: an unknown balance yields NaN (not 0), so the
    // insufficient-funds gate (`robuxNeeded > 0`) stays false until the balance loads.
    const [robuxNeeded, setRobuxNeeded] = useState(expectedPrice - (userRobuxBalance ?? NaN));
    const [confirmData, setConfirmData] = useState<ConfirmationData | null>(null);
    const [currentRobuxBalance, setCurrentRobuxBalance] = useState<number | undefined>(userRobuxBalance);
    const [idempotencyKey] = useState(() => generateRandomUuid());

    const [isTwoStepVerificationActive, setIsTwoStepVerificationActive] = useState(false);
    const startTwoStepVerification = () => setIsTwoStepVerificationActive(true);
    const stopTwoStepVerification = () => setIsTwoStepVerificationActive(false);
    const [enableTwoStepVerificationBanner, setEnableTwoStepVerificationBanner] = useState(false);
    const [shouldShowUnifiedPurchaseModal, setShouldShowUnifiedPurchaseModal] = useState(false);

    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const showFeedback = useCallback((type: string, message?: string) => setFeedback({ key: `${type}-${Date.now()}`, type, message }), []);
    const systemFeedbackService = useMemo(() => ({
      success: (message?: string) => showFeedback('success', message),
      warning: (message?: string) => showFeedback('warning', message),
      loading: (message?: string) => showFeedback('loading', message),
      clear: () => setFeedback(null)
    }), [showFeedback]);

    const [twoStepFeedback, setTwoStepFeedback] = useState<Feedback | null>(null);
    const showTwoStepFeedback = useCallback((type: string, message?: string) => setTwoStepFeedback({ key: `${type}-${Date.now()}`, type, message }), []);
    const twoStepVerificationSystemFeedbackService = useMemo(() => ({
      success: (message?: string) => showTwoStepFeedback('success', message),
      warning: (message?: string) => showTwoStepFeedback('warning', message),
      loading: (message?: string) => showTwoStepFeedback('loading', message),
      clear: () => setTwoStepFeedback(null)
    }), [showTwoStepFeedback]);

    const { data: subscriptionProductInfo = null } = useQuery({
      queryKey: ['list-available-subscription-products', userId()],
      queryFn: () => listAvailableSubscriptionProductsV2(ProductType.Blackbird, false),
      select: ({ products }) => products[0] ?? null,
      enabled: shouldShowUnifiedPurchaseModal,
      retry: 1,
      retryDelay: 100
    });

    const getCurrentUserBalance = () => {
      const currentUserId = userId();
      if (currentUserId === null) {
        return;
      }
      itemDetailsService
        .getCurrentUserBalance(currentUserId)
        .then((result) => {
          const { robux } = result.data;
          setCurrentRobuxBalance(robux);
          setRobuxNeeded(expectedPrice - robux);
        })
        .catch(() => {
          setCurrentRobuxBalance(undefined);
        });
    };
    useEffect(() => {
      const metaBalance = getMetaData().userRobuxBalance;
      if (isAuthenticated() && !Number.isFinite(metaBalance)) {
        getCurrentUserBalance();
      } else {
        setCurrentRobuxBalance(metaBalance);
        setRobuxNeeded(expectedPrice - (metaBalance ?? NaN));
      }
    }, [productId, expectedPrice, expectedSellerId]);

    useEffect(() => {
      if (isTwoStepVerificationActive) {
        setEnableTwoStepVerificationBanner(true);
      }
    }, [isTwoStepVerificationActive]);

    useEffect(() => {
      if (!isAuthenticated()) {
        return;
      }
      setShouldShowUnifiedPurchaseModal(true);
    }, []);

    const closeAll = () => {
      if (customPurchaseVerificationModalService) {
        customPurchaseVerificationModalService.close();
      } else if (shouldShowUnifiedPurchaseModal) {
        unifiedPurchaseVerificationModalService.close();
      } else {
        purchaseVerificationModalService.close();
      }
      priceChangedModalService.close();
    };

    const generateNewItemUpsellProcessParams = (
      shortfallPrice: number | undefined,
      price: number | undefined
    ) => {
      const targetData: UpsellTargetData = {
        assetType,
        assetTypeDisplayName,
        expectedCurrency,
        expectedPrice: price,
        expectedSellerId,
        itemName: assetName,
        itemType: assetType,
        productId,
        userassetId: userAssetId,
        placeproductpromotionId: expectedPromoId,
        isPrivateServer,
        isPlace,
        collectibleItemId,
        collectibleItemInstanceId,
        collectibleProductId,
        subscriptionTargetKey,
        rentalOptionDays
      };
      itemUpsellProcessParams = {
        errorObject: {
          shortfallPrice,
          currentCurrency: expectedCurrency,
          isPlace
        },
        itemDetail: {
          expectedItemPrice: price,
          assetName,
          isLimited,
          buyButtonElementDataset: targetData,
          thumbnail,
          priceSuffix,
          discountInformation
        },
        startOriginalFlowCallback: insufficientFundsModalServiceWrapper(
          shortfallPrice,
          targetData,
          shouldShowUnifiedPurchaseModal
        ),
        shouldShowUnifiedPurchaseModal
      };
    };

    const handleError = ({
      showDivId,
      title,
      errorMsg: message,
      price: currentPrice,
      shortfallPrice,
      onDecline
    }: HandleErrorArgs) => {
      if (showDivId === errorTypeIds.transactionFailure) {
        setError({ title, message, onDecline });
        transactionFailureModalService.open();
      } else if (showDivId === errorTypeIds.insufficientFunds) {
        setRobuxNeeded(shortfallPrice ?? 0);
        generateNewItemUpsellProcessParams(shortfallPrice, currentPrice);
        openInsufficientRobuxModal();
      } else if (showDivId === errorTypeIds.priceChanged) {
        setNewPrice(currentPrice ?? null);
        priceChangedModalService.open();
      }
    };

    const handlePurchaseUnavailable = () => {
      closeAll();
      handleError({
        title: translate(resources.errorOccuredHeading),
        errorMsg: translate(resources.purchasingUnavailableMessage),
        showDivId: errorTypeIds.transactionFailure
      });
    };

    const openConfirmation = (data: ConfirmationData) => {
      setConfirmData(data);
      purchaseConfirmationModalService.open();
    };

    /** @param {number} price expected price displayed to the user */
    const purchaseDeveloperProduct = (price: number) => {
      const request = {
        expectedPrice: price,
        saleLocationType: 'Website',
        saleLocationId,
        idempotencyKey
      };
      if (productId === null) {
        handlePurchaseUnavailable();
        return;
      }
      setLoading(true);
      itemPurchaseService
        .purchaseDeveloperProduct(productId, request)
        .then(response => {
          const data = response.data;
          if (data.FailureReason !== undefined && data.ExpirationTimeInMinutes !== undefined) {
            // Economic Restrictions
            setLoading(false);
            closeAll();
            handleError({
              title: translate(resources.economicRestrictionsErrorHeading),
              errorMsg: getEconomicRestrictionErrorMsg(
                translate,
                data.FailureReason,
                data.ExpirationTimeInMinutes
              ),
              showDivId: errorTypeIds.transactionFailure
            });
            return;
          }

          setLoading(false);
          closeAll();
          if (!data.purchased && data.reason === 'TwoStepVerificationRequired') {
            startTwoStepVerification();
          } else if (!data.purchased) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else {
            onPurchaseSuccess();
            if (showSuccessBanner) {
              systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
              return;
            }
            openConfirmation({
              assetIsWearable: false,
              transactionVerb: '',
              onDecline: () => {
                window.location.reload();
              }
            });
          }
        })
        .catch((errorRes: DeveloperProductPurchaseErrorResponse | undefined) => {
          console.debug(errorRes);
          setLoading(false);
          closeAll();
          const errorCode = errorRes?.data?.errorCode;
          if (
            errorRes &&
            errorRes.status === 500 &&
            errorCode === errorTypeIds.pendingProductsLimitExceeded
          ) {
            handleError({
              title: translate(resources.pendingDeveloperProductLimitReachedHeading),
              errorMsg: translate(resources.pendingDeveloperProductLimitReachedMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else if (!errorRes || errorRes?.status === 400) {
            // bad request
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.purchasingUnavailableMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else if (errorRes.status === 429) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
              // We dont reload here since it's already rate limited
            });
          } else {
            // generic error
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          }
        });
    };

    /** @param {number} price expected price displayed to the user */
    const purchaseGamePass = (price: number) => {
      const request = {
        expectedPrice: price,
        idempotencyKey
      };

      if (productId === null) {
        handlePurchaseUnavailable();
        return;
      }
      setLoading(true);
      itemPurchaseService
        .purchaseGamePass(productId, request)
        .then(response => {
          const data = response.data;
          if (data.failureReason !== undefined && data.expirationTimeInMinutes !== undefined) {
            // Economic Restrictions
            setLoading(false);
            closeAll();
            handleError({
              title: translate(resources.economicRestrictionsErrorHeading),
              errorMsg: getEconomicRestrictionErrorMsg(
                translate,
                data.failureReason,
                data.expirationTimeInMinutes
              ),
              showDivId: errorTypeIds.transactionFailure
            });
            return;
          }

          setLoading(false);
          closeAll();
          if (!data.purchased && data.reason === 'TwoStepVerificationRequired') {
            startTwoStepVerification();
          } else if (!data.purchased) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else {
            onPurchaseSuccess();
            if (showSuccessBanner) {
              systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
              return;
            }
            openConfirmation({
              assetIsWearable: false,
              transactionVerb: data.transactionVerb,
              onDecline: () => {
                window.location.reload();
              }
            });
          }
        })
        .catch((errorRes: PurchaseErrorResponse | undefined) => {
          console.debug(errorRes);
          setLoading(false);
          closeAll();
          if (!errorRes || errorRes?.status === 400) {
            // bad request
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.purchasingUnavailableMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else if (errorRes.status === 429) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
              // We dont reload here since it's already rate limited
            });
          } else {
            // generic error
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          }
        });
    };

    /** @param {number} price expected price displayed to the user */
    const purchaseRegularItem = (price: number) => {
      const params: Record<string, unknown> = {
        expectedCurrency,
        expectedPrice: price,
        expectedSellerId
      };
      if (expectedPromoId > 0) {
        params.expectedPromoId = expectedPromoId;
      }
      if (userAssetId > 0) {
        params.userAssetId = userAssetId;
      }

      if (handlePurchase) {
        handlePurchase({ params, handleError, setLoading, openConfirmation, closeAll });
        return;
      }

      if (productId === null) {
        handlePurchaseUnavailable();
        return;
      }
      setLoading(true);
      itemPurchaseService
        .purchaseItem(productId, params)
        .then(({ data }) => {
          if (data.FailureReason !== undefined && data.ExpirationTimeInMinutes !== undefined) {
            // Economic Restrictions
            setLoading(false);
            closeAll();
            handleError({
              title: translate(resources.economicRestrictionsErrorHeading),
              errorMsg: getEconomicRestrictionErrorMsg(
                translate,
                data.FailureReason,
                data.ExpirationTimeInMinutes
              ),
              showDivId: errorTypeIds.transactionFailure
            });
            return;
          }
          console.debug(data);
          const { statusCode, assetIsWearable, transactionVerb } = data;

          setLoading(false);
          closeAll();
          if (!data.purchased && data.reason === 'TwoStepVerificationRequired') {
            startTwoStepVerification();
          } else if (statusCode === 500) {
            handleError(data);
          } else {
            onPurchaseSuccess();
            if (showSuccessBanner) {
              systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
              return;
            }
            openConfirmation({
              assetIsWearable,
              transactionVerb,
              onDecline: () => {
                window.location.reload();
              }
            });
          }
        })
        .catch((errorRes: PurchaseErrorResponse | undefined) => {
          console.debug(errorRes);
          setLoading(false);
          closeAll();
          if (!errorRes || errorRes?.statusText === errorStatusText.badRequest) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.purchasingUnavailableMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          } else {
            if (errorRes.status === 429) {
              handleError({
                title: translate(resources.errorOccuredHeading),
                errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
                showDivId: errorTypeIds.transactionFailure
                // We dont reload here since it's already rate limited
              });
            }
            try {
              handleError(JSON.parse(errorRes?.statusText ?? '') as HandleErrorArgs);
            } catch (err) {
              handleError({ errorMsg: errorRes?.statusText });
            }
          }
        });
    };

    /**
     * @param {number} price expected price displayed to the user
     * @param {string[] | undefined} offerIds selected marketplace offer ids
     */
    const purchaseCollectibleItem = async (
      targetCollectibleItemId: string,
      price: number,
      offerIds?: string[]
    ) => {
      const params: Record<string, unknown> = {
        collectibleItemId,
        expectedCurrency,
        expectedPrice: price,
        expectedPurchaserId: userId(),
        expectedPurchaserType: 'User',
        rentalOptionDays,
        expectedSellerId,
        expectedSellerType: sellerType,
        idempotencyKey
      };
      if (collectibleItemInstanceId) {
        params.collectibleItemInstanceId = collectibleItemInstanceId;
      }
      if (collectibleProductId) {
        params.collectibleProductId = collectibleProductId;
      }
      if (offerIds?.length) {
        params.offerIds = offerIds;
      }
      if (deepLinkId) {
        params.deepLinkId = deepLinkId;
      }

      if (handlePurchase) {
        handlePurchase({ params, handleError, setLoading, openConfirmation, closeAll });
        return;
      }

      setLoading(true);
      const serviceHandler = collectibleItemInstanceId
        ? itemPurchaseService.purchaseCollectibleItemInstance
        : itemPurchaseService.purchaseCollectibleItem;
      try {
        const response = await serviceHandler(targetCollectibleItemId, params);
        const { data } = response;
        if (data.failureReason !== undefined && data.expirationTimeInMinutes !== undefined) {
          // Economic Restrictions
          setLoading(false);
          closeAll();
          handleError({
            title: translate(resources.economicRestrictionsErrorHeading),
            errorMsg: getEconomicRestrictionErrorMsg(
              translate,
              data.failureReason,
              data.expirationTimeInMinutes
            ),
            showDivId: errorTypeIds.transactionFailure
          });
          return;
        }

        const { transactionVerb } = data;
        setLoading(false);
        closeAll();
        // some APIs use different status code name
        const statusCode = data.statusCode ?? data.status;
        if ((typeof statusCode === 'number' && statusCode >= 400) || data?.purchased === false) {
          if (data?.purchased === false && data?.reason === 'TwoStepVerificationRequired') {
            startTwoStepVerification();
          } else if (data?.purchased === false && data?.purchaseResult === 'Flooded') {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
              // We dont reload here since it's already flooded
            });
          } else if (data.errorMessage === 'InsufficientBalance') {
            insufficientFundsModalService.open();
          } else {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.purchasingUnavailableMessage),
              showDivId: errorTypeIds.transactionFailure,
              // Reload the page so user can see latest state
              onDecline: () => {
                window.location.reload();
              }
            });
          }
        } else {
          onPurchaseSuccess();
          if (showSuccessBanner) {
            systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
            return;
          }
          openConfirmation({
            assetIsWearable: true,
            transactionVerb,
            itemDelayed: data?.pending,
            // Use the actual charged price (discounted via cart-pricing offers) so the
            // post-purchase balance reflects the discount rather than the catalog price.
            expectedPrice: price ?? expectedPrice,
            onDecline: () => {
              window.location.reload();
            }
          });
        }
      } catch (e) {
        const errorRes = e as PurchaseErrorResponse | undefined;
        console.debug(errorRes);

        if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(e)) {
          // Show purchase dialogue again if captcha is abandoned
          setLoading(false);
          return;
        }

        setLoading(false);
        closeAll();

        if (!errorRes || errorRes?.statusText === errorStatusText.badRequest) {
          handleError({
            title: translate(resources.errorOccuredHeading),
            errorMsg: translate(resources.purchasingUnavailableMessage),
            showDivId: errorTypeIds.transactionFailure
          });
        } else {
          if (errorRes.status === 429) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
              // We dont reload here since it's already rate limited
            });
          }
          try {
            handleError(JSON.parse(errorRes?.statusText ?? '') as HandleErrorArgs);
          } catch (err) {
            handleError({ errorMsg: errorRes?.statusText });
          }
        }
      }
    };

    /** @param {number} price expected price displayed to the user (priceInRobux for Robux subscriptions)
     *  @param {string} [paymentProviderOverride] optional override for the payment provider */
    const purchaseSubscription = (price: number, paymentProviderOverride?: string) => {
      const provider = paymentProviderOverride || subscriptionPaymentProvider;
      if (subscriptionTargetKey === null) {
        handlePurchaseUnavailable();
        return;
      }
      setLoading(true);

      if (provider === 'Robux') {
        let balance = 0;
        if (Number.isFinite(currentRobuxBalance)) {
          balance = currentRobuxBalance ?? 0;
        } else if (Number.isFinite(userRobuxBalance)) {
          balance = userRobuxBalance ?? 0;
        }
        if (balance < price) {
          setLoading(false);
          closeAll();
          const shortfall = price - balance;
          generateNewItemUpsellProcessParams(shortfall, price);
          openInsufficientRobuxModal();
          return;
        }
        itemPurchaseService
          .purchaseSubscriptionWithRobux(subscriptionTargetKey, {
            priceInRobux: price,
            // Stable idempotency key for retries — minted once per purchase intent.
            idempotencyKey
          })
          .then(response => {
            const data = response.data;
            setLoading(false);
            closeAll();
            if (data.isSuccess) {
              onPurchaseSuccess();
              if (showSuccessBanner) {
                systemFeedbackService.success(translate(resources.purchaseCompleteHeading));
              } else {
                openConfirmation({
                  assetIsWearable: false,
                  transactionVerb: '',
                  onDecline: () => {
                    window.location.reload();
                  }
                });
              }
            } else {
              handleError({
                title: translate(resources.errorOccuredHeading),
                errorMsg: data.errorMessage || translate(resources.generalPurchaseErrorMessage),
                showDivId: errorTypeIds.transactionFailure
              });
            }
          })
          .catch((errorRes: PurchaseErrorResponse | undefined) => {
            setLoading(false);
            closeAll();
            if (errorRes?.status === 429) {
              handleError({
                title: translate(resources.errorOccuredHeading),
                errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
                showDivId: errorTypeIds.transactionFailure
              });
            } else {
              handleError({
                title: translate(resources.errorOccuredHeading),
                errorMsg: translate(resources.generalPurchaseErrorMessage),
                showDivId: errorTypeIds.transactionFailure
              });
            }
          });
        return;
      }

      // Stripe / CreditBalance flow
      itemPurchaseService
        .prepareFiatSubscriptionPurchase(subscriptionTargetKey, {
          stripeCancelUrlPathName: subscriptionCancelPath,
          paymentProvider: provider
        })
        .then(response => {
          const data = response.data;

          if (data.invalidReason) {
            setLoading(false);
            closeAll();
            const [, violation, timeoutDurationInMinutes] = data.invalidReason.split('/');
            handleError({
              title: translate(resources.economicRestrictionsErrorHeading),
              errorMsg:
                getEconomicRestrictionErrorMsg(
                  translate,
                  violation,
                  parseInt(timeoutDurationInMinutes ?? '', 10)
                ) || translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
            return;
          }

          if (provider === 'Stripe' && data.providerPayload) {
            const payload = JSON.parse(data.providerPayload) as { CheckoutUrl?: string };
            if (payload.CheckoutUrl) {
              setLoading(false);
              window.location.href = payload.CheckoutUrl;
            }
          } else if (provider === 'CreditBalance' && data.providerPayload) {
            setLoading(false);
            window.location.href = `/upgrades/redeem?ap=0&subscriptionTargetKey=${subscriptionTargetKey}`;
          } else {
            setLoading(false);
            closeAll();
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          }
        })
        .catch((errorRes: PurchaseErrorResponse | undefined) => {
          setLoading(false);
          closeAll();
          if (errorRes?.status === 429) {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.floodcheckFailureMessage, { throttleTime: 1 }),
              showDivId: errorTypeIds.transactionFailure
            });
          } else {
            handleError({
              title: translate(resources.errorOccuredHeading),
              errorMsg: translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
          }
        });
    };

    /**
     * @param {number} price expected price displayed to the user
     * @param {string[] | undefined} offerIds selected marketplace offer ids
     */
    const purchaseItem = (price: number, offerIds?: string[]) => {
      if (collectibleItemId) {
        purchaseCollectibleItem(collectibleItemId, price, offerIds);
      } else if (assetType === 'Product') {
        purchaseDeveloperProduct(price);
      } else if (assetType === 'Game Pass') {
        purchaseGamePass(price);
      } else if (assetType === 'Subscription') {
        purchaseSubscription(price);
      } else {
        purchaseRegularItem(price);
      }
    };

    let purchaseVerificationModal;
    if (customPurchaseVerificationModal) {
      purchaseVerificationModal = React.createElement(customPurchaseVerificationModal, {
        ...{
          assetName,
          assetType,
          expectedPrice,
          thumbnail,
          sellerName,
          loading,
          onAction: () => purchaseItem(expectedPrice),
          ...customProps
        }
      });
    } else if (shouldShowUnifiedPurchaseModal) {
      const secondaryAction =
        assetType === 'Subscription' && subscriptionSecondaryPaymentProvider
          ? () => {
              purchaseSubscription(expectedPrice, subscriptionSecondaryPaymentProvider);
              return false;
            }
          : undefined;
      purchaseVerificationModal = (
        <UnifiedPurchaseVerificationModal
          {...{
            title: subscriptionTitle || undefined,
            expectedPrice,
            displayPrice,
            thumbnail,
            assetName,
            assetType,
            assetTypeDisplayName,
            sellerName,
            isPlace,
            loading,
            currentRobuxBalance,
            rentalOptionDays,
            onAction: ({ purchasePrice, offerIds }: { purchasePrice?: number; offerIds?: string[] } = {}) => {
              purchaseItem(purchasePrice ?? expectedPrice, offerIds);
              return false;
            },
            primaryActionButtonText,
            onSecondaryAction: secondaryAction,
            secondaryActionButtonText,
            footerDisclaimerText: subscriptionFooterDisclaimer || undefined,
            priceSuffix: priceSuffix || undefined,
            subscriptionProductInfo: getSubscriptionProductInfoForModal(
              assetType,
              displayPrice,
              subscriptionProductInfo
            ),
            discountInformation: discountInformation || undefined,
            collectibleItemId: collectibleItemId || undefined,
            isLimited: isLimited || false
          }}
        />
      );
    } else {
      purchaseVerificationModal = (
        <PurchaseVerificationModal
          {...{
            expectedPrice,
            displayPrice,
            thumbnail,
            assetName,
            assetType,
            assetTypeDisplayName,
            sellerName,
            isPlace,
            loading,
            collectibleItemId,
            collectibleItemInstanceId,
            currentRobuxBalance,
            onAction: () => {
              purchaseItem(expectedPrice);
              return false;
            }
          }}
        />
      );
    }

    if (robuxNeeded > 0 && upsellService) {
      generateNewItemUpsellProcessParams(robuxNeeded, newPrice ?? expectedPrice);
    }

    return (
      <React.Fragment>
        <TwoStepVerificationModal
          translate={translate}
          isTwoStepVerificationActive={isTwoStepVerificationActive}
          stopTwoStepVerification={stopTwoStepVerification}
          systemFeedbackService={twoStepVerificationSystemFeedbackService}
        />
        <InsufficientFundsModal robuxNeeded={robuxNeeded} />
        {(!robuxNeeded || robuxNeeded <= 0) && purchaseVerificationModal}
        {error && (
          <TransactionFailureModal
            title={error.title ?? ''}
            message={error.message ?? ''}
            onDecline={error.onDecline}
          />
        )}
        {newPrice != null && (
          <PriceChangedModal
            {...{
              expectedPrice,
              currentPrice: newPrice,
              loading,
              onAction: () => {
                purchaseItem(newPrice);
                return false;
              }
            }}
          />
        )}
        {confirmData && (
          <PurchaseConfirmationModal
            {...{
              thumbnail,
              assetName,
              assetType,
              assetTypeDisplayName,
              sellerName,
              isPlace,
              isPrivateServer,
              expectedPrice: newPrice || expectedPrice,
              currentRobuxBalance,
              ...confirmData,
              shouldShowUnifiedPurchaseCompletionModal: shouldShowUnifiedPurchaseModal
            }}
          />
        )}
        {showSuccessBanner && feedback?.message && (
          <Snackbar
            key={feedback.key}
            title={feedback.message}
            icon={(feedback.type === 'success' ? 'icon-filled-check' : 'icon-filled-warning') as SnackbarIcon}
            onClose={() => setFeedback(null)}
            closeIconAriaLabel={translate("Action.Close")}
            shouldAutoDismiss
          />
        )}
        {enableTwoStepVerificationBanner && twoStepFeedback?.message && (
          <Snackbar
            key={twoStepFeedback.key}
            title={twoStepFeedback.message}
            icon={(twoStepFeedback.type === 'success' ? 'icon-filled-check' : 'icon-filled-warning') as SnackbarIcon}
            onClose={() => setTwoStepFeedback(null)}
            closeIconAriaLabel={translate("Action.Close")}
            shouldAutoDismiss
          />
        )}
      </React.Fragment>
    );
  }

  // The .NET / window.RobloxItemPurchase surface always self-wraps a TranslationProviderSCC scoped
  // to `purchasingNamespaces`; nested purchase modals self-source their own (also purchasing)
  // namespaces. A caller-supplied `translate` is deliberately dropped here (`_callerTranslate`): the
  // old `withTranslations` HOC always overwrote it, and several .NET consumers (gameStore GamePass,
  // DeveloperProductCard, game-play-button RobuxPurchaseButton, DeveloperProductDetailsBuyButton)
  // pass their own core-scripts translator scoped to their page's namespaces — forwarding it would
  // resolve ItemPurchase's own strings against the wrong namespaces. The injected Next.js path has
  // no callers yet; when the avatar->Next.js migration needs host injection it will add an
  // explicitly named prop rather than reusing the ambiguous `translate`.
  const ItemPurchaseWithProvider = ({ translate: _callerTranslate, ...props }: ItemPurchaseProps & { translate?: unknown }) => (
    <QueryClientProvider client={queryClient}>
      <SelfProvidedTranslate
        namespaces={purchasingNamespaces}
        useTranslate={usePurchasingTranslate}
        render={t => <ItemPurchase {...props} translate={t} />}
      />
    </QueryClientProvider>
  );

  return [
    ItemPurchaseWithProvider,
    {
      start: () => {
        // try open verification view or insufficient funds
        // modal depending if user has enough robux
        if (customPurchaseVerificationModalService) {
          customPurchaseVerificationModalService.open();
        } else {
          unifiedPurchaseVerificationModalService.open();
        }
        openInsufficientRobuxModal();
      }
    }
  ];
}
