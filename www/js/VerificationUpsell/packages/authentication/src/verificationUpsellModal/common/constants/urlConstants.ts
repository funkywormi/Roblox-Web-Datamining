import environmentUrls from "@rbx/environment-urls";

const { accountSettingsApi, authApi, apiGatewayUrl, accountInformationApi } = environmentUrls;

const getPhonePrefixesConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/phone-number-api/v1/phone-prefix-list`,
});

const getAllPhonePrefixesConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/phone-number-api/v1/phone-prefix-list?showAllPrefixes=true`,
});

const getEmailUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountSettingsApi}/v1/email`,
});

const getEmailVerificationUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountSettingsApi}/v1/email/verify`,
});

const getMetadataV2UrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${authApi}/v2/metadata`,
});

const setPhoneNumberConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountInformationApi}/v1/phone`,
});

const deletePhoneNumberConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountInformationApi}/v1/phone/delete`,
});

const verifyPhoneNumberConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountInformationApi}/v1/phone/verify`,
});

const resendCodeToPhoneNumberConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${accountInformationApi}/v1/phone/resend`,
});

const getPhoneDiscoverabilityPageMetadataConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/user-settings-api/v1/user-settings/metadata`,
});

const setPhoneDiscoverabilityConsentConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/user-settings-api/v1/user-settings`,
});

const supportPageUrl = "https://en.help.roblox.com/hc/articles/203313350";

export {
  getPhonePrefixesConfig,
  getAllPhonePrefixesConfig,
  getEmailUrlConfig,
  getEmailVerificationUrlConfig,
  getMetadataV2UrlConfig,
  setPhoneNumberConfig,
  deletePhoneNumberConfig,
  verifyPhoneNumberConfig,
  resendCodeToPhoneNumberConfig,
  getPhoneDiscoverabilityPageMetadataConfig,
  setPhoneDiscoverabilityConsentConfig,
  supportPageUrl,
};
