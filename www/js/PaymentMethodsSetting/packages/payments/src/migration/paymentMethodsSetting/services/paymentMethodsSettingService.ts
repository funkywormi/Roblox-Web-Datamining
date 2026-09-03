import { EnvironmentUrls, Guac } from 'Roblox';
import { AxiosResponse, httpService } from 'core-utilities';
import { fireEvent } from 'roblox-event-tracker';
import { COUNTER_METRICS } from '../constants/constants';
import CurrencyCode from '../../enums/CurrencyCode';
import EnablePurchaseType from '../../enums/EnablePurchaseType';

const getPaymentProfileSetupUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-profile/prepare`
});

export enum PAYMENT_PROVIDER {
  Stripe = 'Stripe'
}

type PaymentProfileSetupResponse = {
  providerPayload: {
    clientSecret: string;
    stripeCustomerEmail: string;
    robloxUserEmail: string;
  };
};

export const getPaymentProfileSetup = async (
  paymentProvider: string
): Promise<AxiosResponse<PaymentProfileSetupResponse>> => {
  const urlConfig = getPaymentProfileSetupUrlConfig();
  return httpService.post(urlConfig, {
    paymentProvider
  });
};

const verifyPaymentProfileCreationUrlConfig = (
  paymentProvider: string,
  providerPaymentProfileId: string
) => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-profile/by-provider-id/${paymentProvider}/${providerPaymentProfileId}`
});

export const verifyPaymentProfileCreation = async (
  paymentProvider: string,
  providerPaymentProfileId: string
): Promise<AxiosResponse> => {
  const urlConfig = verifyPaymentProfileCreationUrlConfig(
    paymentProvider,
    providerPaymentProfileId
  );
  return httpService.get(urlConfig, {
    paymentProvider,
    providerPaymentProfileId
  });
};

const getUserBirthdateUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.usersApi}/v1/birthdate`
});

type GetUserBirthdateResponse = {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
};

export const getUserBirthdate = async (): Promise<AxiosResponse<GetUserBirthdateResponse>> => {
  const urlConfig = getUserBirthdateUrlConfig();
  return httpService.get(urlConfig);
};

const isStripeEnabledForUserConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/stripe/enabled-for-user`
});

type IsStripeEnabledForUserResponse = {
  isPaymentProviderEnabledForUser: boolean;
  isUserVpcApproved: boolean;
};

export const isStripeEnabledForUser = async (): Promise<
  AxiosResponse<IsStripeEnabledForUserResponse>
> => {
  const urlConfig = isStripeEnabledForUserConfig();
  return httpService.get(urlConfig);
};

const getSavedPaymentProfilesUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-profiles`
});

type CardPaymentProfile = {
  id: string;
  providerPayload: {
    paymentProfileType: 'card';
    CardNetwork: string;
    Last4Digits: string;
    ExpMonth: number;
    ExpYear: number;
  };
  lastChargeTime?: number;
  providerPaymentProfileId?: string;
};

type PayPalPaymentProfile = {
  id: string;
  providerPayload: {
    paymentProfileType: 'paypal';
    Email: string;
    BillingAddress: unknown;
  };
  lastChargeTime?: number;
  providerPaymentProfileId?: string;
};

export type SavedPaymentProfile = CardPaymentProfile | PayPalPaymentProfile;

export const getSavedPaymentProfiles = async (): Promise<
  AxiosResponse<Array<SavedPaymentProfile>>
> => {
  const urlConfig = getSavedPaymentProfilesUrlConfig();
  return httpService.get(urlConfig);
};

const updateOrDeleteSavedPaymentProfileUrlConfig = (paymentProfileId: string) => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-profile/${paymentProfileId}`
});

export const deleteSavedPaymentProfile = async (paymentProfileId: string) => {
  const urlConfig = updateOrDeleteSavedPaymentProfileUrlConfig(paymentProfileId);
  return httpService.delete(urlConfig);
};

export const updateCardExpiry = async (
  paymentProfileId: string,
  expirationMonth: number,
  expirationYear: number
): Promise<AxiosResponse> => {
  const urlConfig = updateOrDeleteSavedPaymentProfileUrlConfig(paymentProfileId);
  return httpService.post(urlConfig, { expirationMonth, expirationYear });
};

const updateEnablePurchaseSettingUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.userSettingsApi}/v1/user-settings`
});

export const updateEnablePurchaseSetting = async (
  enablePurchases: EnablePurchaseType
): Promise<AxiosResponse> => {
  const urlConfig = updateEnablePurchaseSettingUrlConfig();
  return httpService.post(urlConfig, { enablePurchases });
};

const getUserPremiumSubscriptionUrlConfig = (userId: number) => {
  return {
    retryable: false,
    withCredentials: true,
    url: `${EnvironmentUrls.premiumFeaturesApi}/v1/users/${userId}/subscriptions`
  };
};

export type UserPremiumSubscriptionResponse = {
  subscriptionProductModel: {
    premiumFeatureId: number;
    subscriptionTypeName: string;
    robuxStipendAmount: number;
    isLifetime: boolean;
    expiration: string;
    renewal: string;
    created: string;
    purchasePlatform: string;
    subscriptionName: string;
  };
};

export const getUserPremiumSubscription = (
  userId: number
): Promise<AxiosResponse<UserPremiumSubscriptionResponse>> => {
  const urlConfig = getUserPremiumSubscriptionUrlConfig(userId);
  return httpService.get(urlConfig);
};

// Get Roblox Credit Balance -------------------------------------------------------------------------------------
type TGetRobuxConversionMetadata = {
  creditBalance: number;
  currencyCode: string;
  robuxConversionAmount: number;
  isConvertAllFlowEnabled: boolean;
};

const getRobuxConversionMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/credit-balance/v1/get-conversion-metadata`
});

export const getRobuxConversionMetadata = async (): Promise<
  AxiosResponse<TGetRobuxConversionMetadata>
> => {
  const urlConfig = getRobuxConversionMetadataUrlConfig();
  return httpService.get<TGetRobuxConversionMetadata>(urlConfig);
};

// Convert Roblox Credit to Robux ---------------------------------------------------------------------------------
export const convertCreditToRobuxUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/process-payment`
});

export const convertCreditToRobux = async () => {
  const body = {
    paymentProviderType: 'Credit'
  };

  const urlConfig = convertCreditToRobuxUrlConfig();
  return httpService.post(urlConfig, body);
};

export const fetchCreditBalance = async (): Promise<
  [boolean, boolean, number, number, string, boolean]
> => {
  let hideCreditSection = false;
  let showConvertButton = false;
  let robuxAmount = 0;
  let balance = 0;
  let currencyCode = 'USD';
  let isConvertAllFlowEnabled = false;

  try {
    fireEvent(COUNTER_METRICS.API.GET_CREDIT_CONVERSION_METADATA_CALLED);
    const getRobuxConversionMetadataResponse = await getRobuxConversionMetadata();
    const conversionMetadata = getRobuxConversionMetadataResponse.data;

    if (conversionMetadata.creditBalance >= 0 && conversionMetadata.currencyCode !== null) {
      balance = conversionMetadata.creditBalance;
      currencyCode = conversionMetadata.currencyCode;
      isConvertAllFlowEnabled = conversionMetadata.isConvertAllFlowEnabled;
    } else {
      hideCreditSection = true;
      fireEvent(COUNTER_METRICS.API.GET_CREDIT_CONVERSION_METADATA_CURRENCY_CODE_NULL);
    }
    if (conversionMetadata.robuxConversionAmount > 0) {
      robuxAmount = conversionMetadata.robuxConversionAmount;
    }

    showConvertButton =
      (conversionMetadata.isConvertAllFlowEnabled && conversionMetadata.creditBalance > 0) ||
      conversionMetadata.robuxConversionAmount > 0;

    fireEvent(COUNTER_METRICS.API.GET_CREDIT_CONVERSION_METADATA_SUCCEEDED);

    return [
      hideCreditSection,
      showConvertButton,
      robuxAmount,
      balance,
      currencyCode,
      isConvertAllFlowEnabled
    ];
  } catch (e) {
    fireEvent(COUNTER_METRICS.API.GET_CREDIT_CONVERSION_METADATA_FAILED);
    throw new Error('Failed to get Robux conversion metadata.');
  }
};

export const getIsPremiumRemovalEnabled = async (): Promise<boolean> => {
  const subscriptionsMetadataUrlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/v1/subscriptions/metadata`
  };

  const metadata = await httpService.get<{ isPaymentMethodChangesEnabled: boolean }>(
    subscriptionsMetadataUrlConfig
  );
  return metadata.data.isPaymentMethodChangesEnabled;
};

export enum SpendingNotificationDescription {
  GlobalTeen = 'globalTeen',
  U13 = 'u13',
  O18 = 'o18'
}

// Parental controls: spend limits --------------------------------------------------------------------------------
export type TSettingsUIPolicyBody = {
  renamePaymentsToSpendingTab: boolean;
  spendingNotificationDescription: SpendingNotificationDescription;
};

export const getSettingsUIPolicy = async (): Promise<TSettingsUIPolicyBody> => {
  return Guac.callBehaviour<TSettingsUIPolicyBody>('account-settings-ui');
};

export type TParentalSpendControlsSettings = {
  monthlySpendLimit: number | null | undefined;
  monthlySpendLimitCurrencyType: CurrencyCode | null | undefined;
  spendNotificationSetting?:
    | 'NotificationsOff'
    | 'NotificationsOnlyOnThresholdPassed'
    | 'NotificationsEveryAmountSpent'
    | string
    | null;
  isSpendNotificationSettingEnabledForUser?: boolean;
};

export const getParentalSpendControlsSettings = async (): Promise<TParentalSpendControlsSettings> => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.billingApi}/v1/parental-controls/get-settings`
  };

  const response = await httpService.get<TParentalSpendControlsSettings>(urlConfig);
  return response.data;
};

export type TOptionValue = {
  optionValue: string;
};

export type TOption = {
  option: TOptionValue;
  requirement?: string;
};

export type TSetting = {
  currentValue?: string;
  options: TOption[];
};

export type TSettingsAndOptionsBody = {
  enablePurchases?: TSetting;
};

export const getSettingsAndOptions = async (): Promise<TSettingsAndOptionsBody> => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.userSettingsApi}/v1/user-settings/settings-and-options`
  };

  const response = await httpService.get<TSettingsAndOptionsBody>(urlConfig);
  const cleanedResponse = { ...response.data };
  Object.entries(response.data).forEach(setting => {
    const [settingName, settingsAndOptions] = setting;
    if (settingsAndOptions?.options === undefined || settingsAndOptions?.options?.length === 0) {
      // If there are no options, remove the setting from the response.
      delete cleanedResponse[settingName as keyof TSettingsAndOptionsBody];
    }
  });
  return cleanedResponse;
};

export type TUserSettingsMetadataBody = {
  displaySpendLimitSettings?: boolean;
};

export const getSettingMetadata = async (): Promise<TUserSettingsMetadataBody> => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.userSettingsApi}/v1/user-settings/metadata`
  };

  const response = await httpService.get<TUserSettingsMetadataBody>(urlConfig);
  return response.data;
};

export enum ParentConsentStatus {
  Pending = 'Pending'
}

export enum ParentConsentType {
  UpdateUserSetting = 'UpdateUserSetting'
}

export type TParentSpendControlsConsentData = {
  monthlySpendLimit: string;
  enablePurchases: string;
};

export type TConsentResponse = {
  id: number;
  consentData?: TParentSpendControlsConsentData;
};

export type TGetConsentsResponse = {
  consents: TConsentResponse[];
  nextCursor?: string;
};

// Helper function to recursively fetch all pending consents
const fetchConsents = async (
  childUserId: number,
  nextCursor: string | undefined = undefined,
  allConsents: TConsentResponse[] = []
) => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/consents`
  };

  try {
    const response = await httpService.get<TGetConsentsResponse>(urlConfig, {
      childUserId,
      consentStatus: ParentConsentStatus.Pending,
      consentType: ParentConsentType.UpdateUserSetting,
      cursor: nextCursor
    });
    const { consents, nextCursor: newCoursor } = response.data;
    allConsents.push(...(consents || []));
    if (newCoursor) {
      await fetchConsents(childUserId, newCoursor, allConsents);
    }
    return allConsents;
  } catch (error) {
    throw new Error('Failed to fetch pending consent requests');
  }
};

export const getPendingSpendLimitConsentRequest = async (
  childUserId: number
): Promise<TConsentResponse | null> => {
  let nextCursor: string | undefined;
  const allConsents: TConsentResponse[] = [];

  // Recursively fetch all pending consents
  await fetchConsents(childUserId, nextCursor, allConsents);

  // Check for spend limit consent
  const consentWithSpendLimits = allConsents.find(
    consent => consent?.consentData?.monthlySpendLimit !== undefined
  );
  return consentWithSpendLimits || null;
};

export const getPendingEnablePurchaseConsentRequest = async (
  childUserId: number
): Promise<TConsentResponse | null> => {
  let nextCursor: string | undefined;
  const allConsents: TConsentResponse[] = [];

  // Recursively fetch all pending consents
  await fetchConsents(childUserId, nextCursor, allConsents);

  // TODO: PAY-9816 Check for EnablePurchase consent
  const consentWithEnablePurchases = allConsents.find(
    consent => consent?.consentData?.enablePurchases !== undefined
  );
  return consentWithEnablePurchases || null;
};

export const cancelPendingConsentRequest = async (consentId: number): Promise<AxiosResponse> => {
  const urlConfig = {
    withCredentials: true,
    url: `${EnvironmentUrls.apiGatewayUrl}/child-requests-api/v1/cancel-consent-request`
  };

  return httpService.post(urlConfig, {
    consentId
  });
};

const getLinkedParentsUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/get-linked-parents`
});

export type TParentInfo = {
  userId: number;
  userName?: string;
  email?: string;
  displayName?: string;
};

export type TGetLinkedParentsResponse = {
  parents: TParentInfo[];
  canAddParent: boolean;
};

export const getLinkedParents = async (): Promise<TGetLinkedParentsResponse> => {
  const urlConfig = getLinkedParentsUrlConfig();
  const response = await httpService.get<TGetLinkedParentsResponse>(urlConfig);
  return response.data;
};

export type GetUserSettingsAddressResponse = {
  address: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };
};

const getUserSettingsAddressConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/user-settings-address`
});

export const getUserSettingsAddress = async (): Promise<
  AxiosResponse<GetUserSettingsAddressResponse>
> => {
  const urlConfig = getUserSettingsAddressConfig();
  const requestBody = {};
  return httpService.get(urlConfig, requestBody);
};

export type UpsertUserSettingsAddressResponse = {};

const deleteUserSettingsAddressConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/user-settings-address`
});

export const deleteUserSettingsAddress = async (): Promise<
  AxiosResponse<UpsertUserSettingsAddressResponse>
> => {
  const urlConfig = deleteUserSettingsAddressConfig();
  const requestBody = {};
  return httpService.patch(urlConfig, requestBody);
};
