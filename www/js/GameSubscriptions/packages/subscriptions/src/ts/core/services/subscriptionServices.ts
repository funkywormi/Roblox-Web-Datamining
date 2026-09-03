import { EnvironmentUrls } from 'Roblox';
import { httpService, UrlConfig } from 'core-utilities';
import {
  Configuration,
  SubscriptionsV2Api,
  Subscription,
  ProductType
} from '@rbx/client-subscriptions-api/v1';
import serviceConstants from '../constants/serviceConstants';
import {
  GetSubscriptionStatusesRequest,
  GetSubscriptionStatusesResponse,
  GetSubscriptionsRequest,
  GetSubscriptionsResponse,
  GetSubscriptionResubscribeEligibilityRequest,
  GetSubscriptionResubscribeEligibilityResponse,
  GetUserSubscriptionsRequest,
  GetUserSubscriptionsResponse,
  HttpServiceError,
  PremiumFeatureResponse,
  SubscriptionMetadata,
  SubscriptionPurchaseRequest,
  SubscriptionPurchaseResponse,
  GetSubscriptionPaymentMethodsResponse,
  CreditBalance,
  ResubscribeSubscriptionRequest,
  PurchaseWithRobuxRequest,
  PurchaseWithRobuxResponse
} from '../types/serviceTypes';
import { UserSubscription } from '../types/userSubscription';
import { PremiumSubscription } from '../types/premiumSubscription';
import { normalizeSubscriptionPaymentProvider } from '../utils/normalizeSubscriptionPaymentProvider';

export const getSubscriptions = async (
  params: GetSubscriptionsRequest
): Promise<GetSubscriptionsResponse> => {
  try {
    const { data } = await httpService.get<GetSubscriptionsResponse>(
      serviceConstants.url.getSubscriptions,
      {
        ...params
      }
    );

    return data;
  } catch (error) {
    return {
      subscriptionProductsInfo: []
    };
  }
};

export const getSubscriptionsStatuses = async (
  params: GetSubscriptionStatusesRequest
): Promise<GetSubscriptionStatusesResponse> => {
  try {
    const { data } = await httpService.get<GetSubscriptionStatusesResponse>(
      serviceConstants.url.getSubscriptionStatuses(params.subscriptionProductTargetKeys)
    );
    return data;
  } catch (error) {
    return { subscriptionStatuses: {} };
  }
};

export const purchaseSubscription = async (
  params: SubscriptionPurchaseRequest
): Promise<SubscriptionPurchaseResponse> => {
  const { data } = await httpService.post<SubscriptionPurchaseResponse>(
    serviceConstants.url.purchaseSubscription(params.targetKey),
    {
      ...params
    }
  );
  return data;
};

export const purchaseWithRobux = async (
  params: PurchaseWithRobuxRequest
): Promise<PurchaseWithRobuxResponse> => {
  const { subscriptionProductTargetKey, priceInRobux } = params;
  const urlConfig: UrlConfig = serviceConstants.url.purchaseWithRobux(
    subscriptionProductTargetKey
  );
  const { data } = await httpService.post<PurchaseWithRobuxResponse>(urlConfig, {
    priceInRobux
  });
  return data;
};

export const getSubscriptionMetadata = async (): Promise<SubscriptionMetadata> => {
  const { data } = await httpService.get<SubscriptionMetadata>(
    serviceConstants.url.getSubscriptionMetadata
  );
  return data;
};

export const getPaymentMethodsForPurchase = async (
  targetKey: string
): Promise<GetSubscriptionPaymentMethodsResponse> => {
  const { data } = await httpService.get<GetSubscriptionPaymentMethodsResponse>(
    serviceConstants.url.getSubscriptionPaymentMethods(targetKey)
  );
  return data;
};

/**
 * Gets a user's premium subscription, or null if not subscribed.
 * @param userId User to get premium details for
 */
export const getUserPremiumSubscription = async (
  userId: number
): Promise<PremiumSubscription | null> => {
  const urlConfig = serviceConstants.url.getUserPremiumSubscription(userId);
  try {
    const result = await httpService.get<PremiumFeatureResponse>(urlConfig);

    const subscriptionPrice = result.data.price
      ? {
          amount: result.data.price.amount,
          currencyCode: result.data.price.currency.currencyCode
        }
      : null;

    const product = result.data.subscriptionProductModel;
    return {
      premiumFeatureId: product.premiumFeatureId,
      robuxStipendAmount: product.robuxStipendAmount,
      expiration: new Date(product.expiration),
      renewal: new Date(product.renewal),
      created: new Date(product.created),
      purchasePlatform: product.purchasePlatform,
      name: product.subscriptionName,
      price: subscriptionPrice,
      subscriptionProviderName: 'Roblox',
      subscriptionTargetKey: `PRM-${product.premiumFeatureId}`,
      // paymentProvider filled from getUserSubscriptions (PRM row) when the API returns one
      showLowBalanceNotification: false,
      paymentProfileId: ''
    };
  } catch (e) {
    const error = e as HttpServiceError;
    if (error.status === 404) {
      // Endpoint returns 404 for not subscribed
      return null;
    }
    throw e;
  }
};

/**
 * Gets the user's subscriptions
 * @param expirationTimestampStart Start period of expiration times to search, inclusive
 * @param expirationTimestampEnd End period of expiration times to search, exclusive
 * @returns User's subscriptions that expire within the given time period
 */
export const getUserSubscriptions = async (
  expirationTimestampStart?: Date,
  expirationTimestampEnd?: Date
): Promise<UserSubscription[]> => {
  const urlConfig = serviceConstants.url.getUserSubscriptions;
  let subscriptions: UserSubscription[] = [];
  let hasMore = true;
  let cursor: string | undefined;

  // Keep getting subscriptions until we get all
  // This will pretty much only ever run in one loop, unless someone buys > 20 subscriptions
  while (hasMore) {
    const request: GetUserSubscriptionsRequest = {
      resultsPerPage: 20,
      cursor,
      expirationTimestampMsStart: expirationTimestampStart ? expirationTimestampStart.getTime() : 0,
      expirationTimestampMsEnd: expirationTimestampEnd ? expirationTimestampEnd.getTime() : 0
    };
    // No way to run in parallel since we need to get the cursor to do the next request
    // eslint-disable-next-line no-await-in-loop
    const result = await httpService.get<GetUserSubscriptionsResponse>(urlConfig, request);
    const rows = result.data?.subscriptions ?? [];
    const convertedSubscriptions: UserSubscription[] = rows.map(subscription => ({
      subscriptionTargetKey: subscription.subscriptionTargetKey,
      name: subscription.name,
      description: subscription.description,
      subscriptionProviderName: subscription.subscriptionProviderName,
      iconImageAssetId: subscription.imageAssetId,
      price: subscription.price,
      priceInRobux: subscription.priceInRobux ?? null,
      subscriptionPeriod: subscription.subscriptionPeriod,
      expiration: new Date(subscription.expirationTimestampMs),
      renewal: new Date(subscription.nextRenewalTimestampMs),
      purchasePlatform: subscription.purchasePlatform,
      cardInfo: subscription.paymentProfileCardInfo ?? undefined,
      providerId: subscription.providerId,
      paymentProvider: normalizeSubscriptionPaymentProvider(subscription.paymentProvider),
      showLowBalanceNotification: subscription.showLowBalanceNotification,
      paymentProfileId: subscription.paymentProfileId
    }));
    subscriptions = [...subscriptions, ...convertedSubscriptions];
    hasMore = result.data?.hasMore ?? false;
    cursor = result.data?.cursor;
  }
  return subscriptions;
};

/**
 * Cancels the user's subscription. Throws exception on failure.
 * @param subscriptionTargetKey The subscription to cancel
 */
export const cancelUserSubscription = async (subscriptionTargetKey: string): Promise<void> => {
  const urlConfig = serviceConstants.url.cancelSubscription(subscriptionTargetKey);
  await httpService.post(urlConfig);
};

/**
 * Dismisses the notification for a user's subscription. Throws exception on failure.
 */
export const dismissSubscriptionNotification = async (
  subscriptionTargetKey: string
): Promise<void> => {
  const urlConfig = serviceConstants.url.dismissSubscriptionNotification(subscriptionTargetKey);
  await httpService.post(urlConfig);
};

/**
 * Cancels the user's premium subscription. Throws exception on failure.
 * @param userId User to cancel subscription for. Must match logged in user.
 */
export const cancelPremiumSubscription = async (userId: number): Promise<void> => {
  const urlConfig = serviceConstants.url.cancelPremiumSubscription(userId);
  await httpService.post(urlConfig);
};

export const getUserCreditBalance = async (): Promise<CreditBalance> => {
  const urlConfig = serviceConstants.url.getUserCreditBalance();
  const { data } = await httpService.get<CreditBalance>(urlConfig);
  return data;
};

export const updateSubscriptionPaymentProfile = async (
  subscriptionProductTargetKey: string,
  paymentProfileId: string
): Promise<void> => {
  const urlConfig = serviceConstants.url.updateSubscriptionPaymentProfile(
    subscriptionProductTargetKey
  );
  await httpService.post(urlConfig, { paymentProfileId });
};

export const getSubscriptionResubscribeEligibility = async (
  params: GetSubscriptionResubscribeEligibilityRequest
): Promise<GetSubscriptionResubscribeEligibilityResponse> => {
  try {
    const { data } = await httpService.get<GetSubscriptionResubscribeEligibilityResponse>(
      serviceConstants.url.getSubscriptionResubscribeEligibility(
        params.subscriptionProductTargetKey
      )
    );
    return data;
  } catch (error) {
    return { canResubscribe: false };
  }
};

export const resubscribeSubscription = async (
  params: ResubscribeSubscriptionRequest
): Promise<void> => {
  const urlConfig = serviceConstants.url.resubscribeSubscription(
    params.subscriptionProductTargetKey
  );
  await httpService.post(urlConfig);
};

const subscriptionsV2Api = new SubscriptionsV2Api(
  new Configuration({
    basePath: `${EnvironmentUrls.apiGatewayUrl}/subscriptions`,
    credentials: 'include'
  })
);

/**
 * Gets user subscriptions using the V2 endpoint.
 * @param productType Product type to filter by (e.g., 'CurrencySubscription')
 * @returns Array of V2 subscription objects
 */
export const listSubscriptionsV2 = async (productType: ProductType): Promise<Subscription[]> => {
  try {
    const response = await subscriptionsV2Api.subscriptionsV2ListSubscriptions({
      productType,
      expirationTimestampMsStart: Date.now(),
      resultsPerPage: 100
    });
    return response.subscriptions ?? [];
  } catch (error) {
    return [];
  }
};

export default {
  getSubscriptions,
  getSubscriptionsStatuses,
  getUserSubscriptions,
  getUserPremiumSubscription,
  getUserCreditBalance,
  cancelUserSubscription,
  cancelPremiumSubscription,
  getSubscriptionResubscribeEligibility,
  resubscribeSubscription,
  listSubscriptionsV2,
  purchaseWithRobux
};
