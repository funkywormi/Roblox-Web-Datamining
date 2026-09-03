import { EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';
import { PaymentProvider } from '../types/subscriptionEnums';
import { updateVipServerSubscription } from '../services/privateServerServices';

const { apiGatewayUrl, premiumFeaturesApi } = EnvironmentUrls;

const url = {
  getAbuseReportRevampUrl: ({
    abuseVector,
    submitterId,
    targetId,
    custom
  }: {
    abuseVector: string;
    submitterId: string;
    targetId: string;
    custom?: string;
  }) => {
    const params = new URLSearchParams({
      abuseVector,
      submitterId,
      targetId,
      custom: custom || ''
    });
    return `/report-abuse/?${params.toString()}`;
  },
  getSubscriptions: {
    url: `${apiGatewayUrl}/v1/subscriptions/active-subscription-products`,
    withCredentials: true
  },
  getSubscriptionStatuses: (subscriptionProductTargetKeys: string[]): UrlConfig => ({
    url: `${apiGatewayUrl}/v1/subscriptions/statuses?${subscriptionProductTargetKeys
      .map(key => `subscriptionProductTargetKeys=${key}`)
      .join('&')}`,
    withCredentials: true
  }),
  getSubscriptionMetadata: {
    url: `${apiGatewayUrl}/v1/subscriptions/metadata`,
    withCredentials: true
  },
  getSubscriptionPaymentMethods: (targetKey: string): UrlConfig => ({
    url: `${apiGatewayUrl}/v1/subscriptions/payment-methods/${targetKey}`,
    withCredentials: true
  }),
  purchaseSubscription: (targetKey: string): UrlConfig => ({
    url: `${apiGatewayUrl}/v1/subscriptions/prepare-purchase/${targetKey}/web`,
    withCredentials: true
  }),
  purchaseWithRobux: (subscriptionProductTargetKey: string): UrlConfig => ({
    url: `${apiGatewayUrl}/v1/subscriptions/purchase-with-robux/${subscriptionProductTargetKey}`,
    withCredentials: true
  }),
  getUserPremiumSubscription: (userId: number): UrlConfig => ({
    url: `${premiumFeaturesApi}/v1/users/${userId}/subscriptions/details`,
    withCredentials: true
  }),
  getUserSubscriptions: {
    url: `${apiGatewayUrl}/v1/subscriptions/user`,
    withCredentials: true
  },
  cancelSubscription: (subscriptionProductTargetKey: string): UrlConfig => ({
    url: `${apiGatewayUrl}/v1/subscriptions/${subscriptionProductTargetKey}/cancel`,
    withCredentials: true
  }),
  cancelPremiumSubscription: (userId: number): UrlConfig => ({
    url: `${premiumFeaturesApi}/v1/users/${userId}/subscriptions/cancel`,
    withCredentials: true
  }),
  dismissSubscriptionNotification: (subscriptionProductTargetKey: string): UrlConfig => ({
    url: `${apiGatewayUrl}/v1/subscriptions/${subscriptionProductTargetKey}/dismiss-notification`,
    withCredentials: true
  }),
  updateSubscriptionPaymentProfile: (subscriptionProductTargetKey: string): UrlConfig => ({
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/v1/subscriptions/${subscriptionProductTargetKey}/payment-methods`
  }),
  // Payments related endpoints
  verifyPaymentProfileCreation: (providerPaymentProfileId: string): UrlConfig => ({
    url: `${apiGatewayUrl}/payments-gateway/v1/payment-profile/by-provider-id/${PaymentProvider.STRIPE}/${providerPaymentProfileId}`,
    withCredentials: true
  }),
  getSavedPaymentProfiles: (): UrlConfig => ({
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-profiles`
  }),
  getPaymentProfileSetupUrlConfig: (): UrlConfig => ({
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-profile/prepare`
  }),
  getStripeEnabledForUserConfig: (): UrlConfig => ({
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/stripe/enabled-for-user`
  }),
  updatePaymentProfile: (paymentProfileId: string): UrlConfig => ({
    url: `${apiGatewayUrl}/payments-gateway/v1/payment-profile/${paymentProfileId}`,
    withCredentials: true
  }),
  // Safety related endpoints
  submitSafetyEvent: {
    url: `${apiGatewayUrl}/abuse-reporting/v1/safety-event`,
    retryable: true,
    withCredentials: true
  },
  // Roblox Credit related endpoints
  getUserCreditBalance: (): UrlConfig => ({
    url: `${apiGatewayUrl}/credit-balance/v1/get-credit-balance`,
    withCredentials: true
  }),
  // Users related endpoints
  getUserBirthdateUrlConfig: (): UrlConfig => ({
    withCredentials: true,
    url: `${EnvironmentUrls.usersApi}/v1/birthdate`
  }),
  getSubscriptionResubscribeEligibility: (subscriptionProductTargetKey: string): UrlConfig => ({
    withCredentials: true,
    url: `${apiGatewayUrl}/v1/subscriptions/${subscriptionProductTargetKey}/eligibility`
  }),
  resubscribeSubscription: (subscriptionProductTargetKey: string): UrlConfig => ({
    withCredentials: true,
    url: `${apiGatewayUrl}/v1/subscriptions/${subscriptionProductTargetKey}/resubscribe`
  }),
  updateVipServerSubscription: (privateServerId: string): UrlConfig => ({
    withCredentials: true,
    url: `${EnvironmentUrls.gamesApi}/v1/vip-servers/${privateServerId}/subscription`
  }),
  getMyPrivateServers: (): UrlConfig => ({
    withCredentials: true,
    url: `${EnvironmentUrls.gamesApi}/v1/private-servers/my-private-servers`
  })
};

export default {
  url
};
