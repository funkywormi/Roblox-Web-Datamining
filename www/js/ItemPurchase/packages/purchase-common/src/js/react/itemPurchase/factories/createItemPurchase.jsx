import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslations, queryClient } from '@rbx/core-scripts/react';
import { createSystemFeedback } from '@rbx/core-ui/legacy/react-style-guide';
import { paymentFlowAnalyticsService } from '@rbx/core-scripts/legacy/core-roblox-utilities';
import { ItemPurchaseUpsellService, CurrentUser, AccountIntegrityChallengeService } from '@rbx/legacy-webapp-types/Roblox';
import { uuidService } from '@rbx/core-scripts/legacy/core-utilities';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import translationConfig from '../translation.config';
import { getMetaData } from '../util/itemPurchaseUtil';
import getSubscriptionProductInfoForModal from '../../../../ts/react/utils/getSubscriptionProductInfoForModal';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import itemPurchaseService from '../services/itemPurchaseService';
import itemDetailsService from '../services/itemDetailsService';
import createPurchaseConfirmationModal from './createPurchaseConfirmationModal';
import createPurchaseVerificationModal from './createPurchaseVerificationModal';
import createInsufficientFundsModal from './createInsufficientFundsModal';
import createTransactionFailureModal from './createTransactionFailureModal';
import createPriceChangedModal from './createPriceChangedModal';
import TwoStepVerificationModal from '../components/TwoStepVerificationModal';
import createUnifiedPurchaseVerificationModal from './createUnifiedPurchaseVerificationModal';
import {
  listAvailableSubscriptionProductsV2,
  ProductType
} from '../../../../ts/react/services/subscriptionsApiV2Service';

const { resources, errorTypeIds, errorStatusText, events, violationLabels } = itemPurchaseConstants;

export default function createItemPurchase({
  customPurchaseVerificationModal,
  customPurchaseConfirmationModal,
  customPurchaseVerificationModalService,
  forceUnifiedModal = false
} = {}) {
  const { userRobuxBalance } = getMetaData();
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  const [
    TwoStepVerificationSystemFeedback,
    twoStepVerificationSystemFeedbackService
  ] = createSystemFeedback();
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

  let itemUpsellProcessParams = {
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
      itemUpsellProcessParams.itemDetail.buyButtonElementDataset.productId
    );
    insufficientFundsModalService.open();
  };
  const insufficientFundsModalServiceWrapper = (
    shortfallPrice,
    targetData,
    shouldShowUnifiedPurchaseModal
  ) => () => {
    if (
      ItemPurchaseUpsellService &&
      ItemPurchaseUpsellService.showExceedLargestInsufficientRobuxModal
    ) {
      ItemPurchaseUpsellService.showExceedLargestInsufficientRobuxModal(
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
    if (ItemPurchaseUpsellService && itemUpsellProcessParams?.itemDetail?.expectedItemPrice) {
      if (userRobuxBalance - itemUpsellProcessParams?.itemDetail?.expectedItemPrice >= 0) {
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
        ItemPurchaseUpsellService.startItemUpsellProcess(
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
  const getEconomicRestrictionErrorMsg = (translate, violation, timeoutDurationInMinutes) => {
    const timeoutInHours = Math.ceil(timeoutDurationInMinutes / 60);
    if (timeoutInHours > 24) {
      const timeoutInDays = Math.ceil(timeoutInHours / 24);
      return translate('Text.EconomicRestrictionsDaysGeneral', {
        violation: translate(violationLabels[violation] ?? 'Label.Sublabel.FraudPaymentAbuse'),
        day: timeoutInDays
      });
    }
    return translate('Text.EconomicRestrictionsHoursGeneral', {
      violation: translate(violationLabels[violation] ?? 'Label.Sublabel.FraudPaymentAbuse'),
      hour: timeoutInHours
    });
  };
  function ItemPurchase({
    translate,
    assetName,
    assetType,
    assetTypeDisplayName,
    productId,
    expectedCurrency,
    expectedPrice,
    expectedSellerId,
    expectedPromoId,
    userAssetId,
    thumbnail,
    sellerName,
    sellerType,
    showSuccessBanner,
    // for place purchase
    isPlace,
    isPrivateServer,
    handlePurchase,
    onPurchaseSuccess,
    collectibleItemId,
    collectibleItemInstanceId,
    collectibleProductId,
    isLimited,
    customProps,
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
    priceSuffix = ''
  }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newPrice, setNewPrice] = useState(null);
    const [robuxNeeded, setRobuxNeeded] = useState(expectedPrice - userRobuxBalance);
    const [confirmData, setConfirmData] = useState(null);
    const [currentRobuxBalance, setCurrentRobuxBalance] = useState(userRobuxBalance);
    const [idempotencyKey] = useState(() => uuidService.generateRandomUuid());

    const [isTwoStepVerificationActive, setIsTwoStepVerificationActive] = useState(false);
    const startTwoStepVerification = () => setIsTwoStepVerificationActive(true);
    const stopTwoStepVerification = () => setIsTwoStepVerificationActive(false);
    const [enableTwoStepVerificationBanner, setEnableTwoStepVerificationBanner] = useState(false);
    const [shouldShowUnifiedPurchaseModal, setShouldShowUnifiedPurchaseModal] = useState(false);

    const { data: subscriptionProductInfo = null } = useQuery({
      queryKey: ['list-available-subscription-products', CurrentUser.userId],
      queryFn: () => listAvailableSubscriptionProductsV2(ProductType.Blackbird, false),
      select: ({ products }) => products[0] ?? null,
      enabled: shouldShowUnifiedPurchaseModal,
      retry: 1,
      retryDelay: 100
    });

    const getCurrentUserBalance = () => {
      itemDetailsService
        .getCurrentUserBalance(CurrentUser.userId)
        .then((result) => {
          setCurrentRobuxBalance(result.data.robux);
          setRobuxNeeded(expectedPrice - result.data.robux);
        })
        .catch(() => {
          setCurrentRobuxBalance(undefined);
        });
    };
    useEffect(() => {
      const metaBalance = getMetaData().userRobuxBalance;
      if (CurrentUser.isAuthenticated && !Number.isFinite(metaBalance)) {
        getCurrentUserBalance();
      } else {
        setCurrentRobuxBalance(metaBalance);
        setRobuxNeeded(expectedPrice - metaBalance);
      }
    }, [productId, expectedPrice, expectedSellerId]);

    useEffect(() => {
      if (isTwoStepVerificationActive) {
        setEnableTwoStepVerificationBanner(true);
      }
    }, [isTwoStepVerificationActive]);

    useEffect(() => {
      if (!CurrentUser.isAuthenticated) {
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

    const generateNewItemUpsellProcessParams = (shortfallPrice, price) => {
      const targetData = {
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
    }) => {
      if (showDivId === errorTypeIds.transactionFailure) {
        setError({ title, message, onDecline });
        transactionFailureModalService.open();
      } else if (showDivId === errorTypeIds.insufficientFunds) {
        setRobuxNeeded(shortfallPrice);
        generateNewItemUpsellProcessParams(shortfallPrice, currentPrice);
        openInsufficientRobuxModal();
      } else if (showDivId === errorTypeIds.priceChanged) {
        setNewPrice(currentPrice);
        priceChangedModalService.open();
      }
    };

    const openConfirmation = data => {
      setConfirmData(data);
      purchaseConfirmationModalService.open();
    };

    /** @param {number} price expected price displayed to the user */
    const purchaseDeveloperProduct = price => {
      const request = {
        expectedPrice: price,
        saleLocationType: 'Website',
        saleLocationId,
        idempotencyKey
      };
      setLoading(true);
      itemPurchaseService
        .purchaseDeveloperProduct(productId, request)
        .then(response => {
          const { data } = response;
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
        .catch(errorRes => {
          console.debug(errorRes);
          setLoading(false);
          closeAll();
          const errorCode = errorRes.data?.errorCode;
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
    const purchaseGamePass = price => {
      const request = {
        expectedPrice: price,
        idempotencyKey
      };

      setLoading(true);
      itemPurchaseService
        .purchaseGamePass(productId, request)
        .then(response => {
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
        .catch(errorRes => {
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
    const purchaseRegularItem = price => {
      const params = {
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
        .catch(errorRes => {
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
              handleError(JSON.parse(errorRes?.statusText));
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
    const purchaseCollectibleItem = async (price, offerIds) => {
      const params = {
        collectibleItemId,
        expectedCurrency,
        expectedPrice: price,
        expectedPurchaserId: CurrentUser.userId,
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

      if (handlePurchase) {
        handlePurchase({ params, handleError, setLoading, openConfirmation, closeAll });
        return;
      }

      setLoading(true);
      const serviceHandler = collectibleItemInstanceId
        ? itemPurchaseService.purchaseCollectibleItemInstance
        : itemPurchaseService.purchaseCollectibleItem;
      try {
        const response = await serviceHandler(collectibleItemId, params);
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
      } catch (errorRes) {
        console.debug(errorRes);

        if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
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
            handleError(JSON.parse(errorRes?.statusText));
          } catch (err) {
            handleError({ errorMsg: errorRes?.statusText });
          }
        }
      }
    };

    /** @param {number} price expected price displayed to the user (priceInRobux for Robux subscriptions)
     *  @param {string} [paymentProviderOverride] optional override for the payment provider */
    const purchaseSubscription = (price, paymentProviderOverride) => {
      const provider = paymentProviderOverride || subscriptionPaymentProvider;
      setLoading(true);

      if (provider === 'Robux') {
        let balance = 0;
        if (Number.isFinite(currentRobuxBalance)) {
          balance = currentRobuxBalance;
        } else if (Number.isFinite(userRobuxBalance)) {
          balance = userRobuxBalance;
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
            priceInRobux: price
          })
          .then(response => {
            const { data } = response;
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
          .catch(errorRes => {
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
          const { data } = response;

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
                  parseInt(timeoutDurationInMinutes, 10)
                ) || translate(resources.generalPurchaseErrorMessage),
              showDivId: errorTypeIds.transactionFailure
            });
            return;
          }

          if (provider === 'Stripe' && data.providerPayload) {
            const payload = JSON.parse(data.providerPayload);
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
        .catch(errorRes => {
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
    const purchaseItem = (price, offerIds) => {
      if (collectibleItemId) {
        purchaseCollectibleItem(price, offerIds);
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
            onAction: ({ purchasePrice, offerIds } = {}) => {
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

    if (robuxNeeded > 0 && ItemPurchaseUpsellService) {
      generateNewItemUpsellProcessParams(robuxNeeded, newPrice ?? expectedPrice);
    }

    return (
      <React.Fragment>
        <TwoStepVerificationModal
          isTwoStepVerificationActive={isTwoStepVerificationActive}
          stopTwoStepVerification={stopTwoStepVerification}
          systemFeedbackService={twoStepVerificationSystemFeedbackService}
        />
        <InsufficientFundsModal robuxNeeded={robuxNeeded} />
        {(!robuxNeeded || robuxNeeded <= 0) && purchaseVerificationModal}
        {error && (
          <TransactionFailureModal
            title={error.title}
            message={error.message}
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
        {showSuccessBanner && <SystemFeedback />}
        {enableTwoStepVerificationBanner && <TwoStepVerificationSystemFeedback />}
      </React.Fragment>
    );
  }

  ItemPurchase.defaultProps = {
    isPlace: false,
    isPrivateServer: false,
    productId: null,
    assetTypeDisplayName: '',
    expectedPromoId: 0,
    userAssetId: 0,
    showSuccessBanner: false,
    handlePurchase: null,
    onPurchaseSuccess: () => null,
    customProps: {},
    collectibleItemId: null,
    collectibleItemInstanceId: null,
    collectibleProductId: null,
    sellerType: null,
    isLimited: false,
    saleLocationId: null,
    rentalOptionDays: null,
    subscriptionTargetKey: null,
    discountInformation: null,
    subscriptionPaymentProvider: '',
    subscriptionSecondaryPaymentProvider: '',
    subscriptionTitle: '',
    primaryActionButtonText: '',
    secondaryActionButtonText: '',
    subscriptionFooterDisclaimer: '',
    subscriptionCancelPath: '',
    displayPrice: '',
    priceSuffix: '',
    subscriptionProductType: null,
    subscriptionProductId: null
  };

  ItemPurchase.propTypes = {
    translate: PropTypes.func.isRequired,
    productId(props, propName, componentName) {
      const { collectibleItemId, productId, subscriptionTargetKey } = props;
      if (!collectibleItemId && !subscriptionTargetKey && typeof productId !== 'number') {
        return new Error(
          `Invalid prop ${propName} supplied to ${componentName}. Validation failed.`
        );
      }
      return null;
    },
    expectedCurrency: PropTypes.number.isRequired,
    expectedPrice: PropTypes.number.isRequired,
    thumbnail: PropTypes.node.isRequired,
    assetName: PropTypes.string.isRequired,
    assetType: PropTypes.string.isRequired,
    assetTypeDisplayName: PropTypes.string,
    expectedSellerId: PropTypes.number.isRequired,
    sellerName: PropTypes.string.isRequired,
    sellerType: PropTypes.string,
    isPlace: PropTypes.bool,
    isPrivateServer: PropTypes.bool,
    expectedPromoId: PropTypes.number,
    userAssetId: PropTypes.number,
    showSuccessBanner: PropTypes.bool,
    handlePurchase: PropTypes.func,
    onPurchaseSuccess: PropTypes.func,
    customProps: PropTypes.func,
    collectibleItemId: PropTypes.string,
    collectibleItemInstanceId: PropTypes.string,
    collectibleProductId: PropTypes.string,
    isLimited: PropTypes.bool,
    saleLocationId: PropTypes.number,
    rentalOptionDays: PropTypes.number,
    discountInformation: PropTypes.shape({
      originalPrice: PropTypes.number,
      totalDiscountAmount: PropTypes.number,
      totalDiscountPercentage: PropTypes.number,
      discounts: PropTypes.arrayOf(
        PropTypes.shape({
          discountAmount: PropTypes.number,
          discountPercentage: PropTypes.number,
          discountCampaign: PropTypes.string,
          localizedDiscountAttribution: PropTypes.string
        })
      )
    }),
    subscriptionTargetKey: PropTypes.string,
    subscriptionPaymentProvider: PropTypes.string,
    subscriptionSecondaryPaymentProvider: PropTypes.string,
    subscriptionTitle: PropTypes.string,
    primaryActionButtonText: PropTypes.string,
    secondaryActionButtonText: PropTypes.string,
    subscriptionFooterDisclaimer: PropTypes.string,
    subscriptionCancelPath: PropTypes.string,
    displayPrice: PropTypes.string,
    priceSuffix: PropTypes.string,
    subscriptionProductType: PropTypes.string,
    subscriptionProductId: PropTypes.string
  };
  const ItemPurchaseTranslated = withTranslations(
    ItemPurchase,
    translationConfig.purchasingResources
  );
  const ItemPurchaseWithProvider = props => (
    <QueryClientProvider client={queryClient}>
      <ItemPurchaseTranslated {...props} />
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
