import { buildCreditCheckoutUrl } from '../../../core/constants/websiteConstants';
import {
  HttpServiceError,
  Subscription,
  StripeProviderPayload,
  DevSubscriptionEconomicRestrictionResponse,
  PurchaseWithRobuxResponse
} from '../../../core/types/serviceTypes';
import {
  purchaseSubscription,
  purchaseWithRobux
} from '../../../core/services/subscriptionServices';
import trackerClient, {
  SubscriptionPurchaseEventType,
  SubscriptionViewName,
  SubscriptionInputType
} from './logging';
import { PaymentProvider } from '../../../core/types/subscriptionEnums';
import { ViolationLabel } from './ErrorMessaging';

export const isRobuxSubscription = (subscription: Subscription): boolean =>
  subscription.priceInRobux != null && subscription.priceInRobux > 0;

export const purchaseWebSubscription = async (
  generalErrorCallback: () => void,
  failureCallback: (serviceError: HttpServiceError) => void,
  economicRestrictionCallback: (response: DevSubscriptionEconomicRestrictionResponse) => void,
  onRedirectAction: () => void,
  subscription: Subscription,
  purchaseFlowUuid: string,
  pathName: string,
  paymentProvider: string
): Promise<void> => {
  try {
    const response = await purchaseSubscription({
      targetKey: subscription.subscriptionTargetKey,
      stripeCancelUrlPathName: pathName,
      paymentProvider
    });

    if (response.invalidReason !== undefined && response.invalidReason !== null) {
      const { invalidReason } = response;
      // Expected format: "EconomicRestrictions/{failureReason}/{expirationTimeInMinutes}"
      const [
        invalidReasonNamespace,
        extractedFailureReason,
        expirationTimeInMinutesString
      ] = invalidReason.split('/');

      if (
        invalidReasonNamespace !== 'EconomicRestrictions' ||
        !Object.values(ViolationLabel).includes(extractedFailureReason as ViolationLabel) ||
        expirationTimeInMinutesString === undefined
      ) {
        return;
      }
      const failureReason: ViolationLabel = extractedFailureReason as ViolationLabel;
      const expirationTimeInMinutes = parseInt(expirationTimeInMinutesString, 10);

      economicRestrictionCallback({
        failureReason,
        expirationTimeInMinutes
      });
      return;
    }

    if (paymentProvider === PaymentProvider.STRIPE && response.providerPayload) {
      const payload: StripeProviderPayload = JSON.parse(
        response.providerPayload
      ) as StripeProviderPayload;

      if (payload.CheckoutUrl) {
        trackerClient.sendExperienceSubscriptionEvent(
          purchaseFlowUuid,
          SubscriptionPurchaseEventType.VIEW_SHOWN,
          SubscriptionViewName.STRIPE_CHECKOUT,
          subscription,
          SubscriptionInputType.SUBSCRIBE
        );
        onRedirectAction();
        window.location.href = payload.CheckoutUrl;
      }
    } else if (paymentProvider === PaymentProvider.CREDITBALANCE && response.providerPayload) {
      trackerClient.sendExperienceSubscriptionEvent(
        purchaseFlowUuid,
        SubscriptionPurchaseEventType.VIEW_SHOWN,
        SubscriptionViewName.CREDIT_BALANCE_CHECKOUT,
        subscription,
        SubscriptionInputType.SUBSCRIBE
      );
      onRedirectAction();
      window.location.href = buildCreditCheckoutUrl(subscription.subscriptionTargetKey);
    } else {
      generalErrorCallback();
    }
  } catch (error) {
    const serviceError = error as HttpServiceError;
    if (serviceError.status === 500) {
      generalErrorCallback();
    }
    failureCallback(serviceError);
  }
};

export const purchaseRobuxWebSubscription = async (
  successCallback: () => void,
  generalErrorCallback: (errorMessage: string) => void,
  failureCallback: (serviceError: HttpServiceError) => void,
  subscription: Subscription,
  purchaseFlowUuid: string
): Promise<void> => {
  try {
    const response: PurchaseWithRobuxResponse = await purchaseWithRobux({
      subscriptionProductTargetKey: subscription.subscriptionTargetKey,
      priceInRobux: subscription.priceInRobux ?? 0
    });

    if (response.isSuccess) {
      trackerClient.sendExperienceSubscriptionEvent(
        purchaseFlowUuid,
        SubscriptionPurchaseEventType.VIEW_SHOWN,
        SubscriptionViewName.PURCHASE_MODAL,
        subscription,
        SubscriptionInputType.SUBSCRIBE
      );
      successCallback();
    } else {
      generalErrorCallback(response.errorMessage);
    }
  } catch (error) {
    const serviceError = error as HttpServiceError;
    if (serviceError.status === 500) {
      generalErrorCallback('');
    }
    failureCallback(serviceError);
  }
};

export default { purchaseSubscription };
