import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";

// user-settings-api
export const userSettingsUrl = `${EnvironmentUrls.userSettingsApi}/v1/user-settings`;
export const userSettingsV2Url = `${EnvironmentUrls.userSettingsApi}/v2/user-settings`;
export const userSettingsMetadataUrl = `${userSettingsUrl}/metadata`;
export const userSettingsAndOptionsUrl = `${userSettingsUrl}/settings-and-options`;
export const userSettingsAndOptionsV2Url = `${userSettingsV2Url}/settings-and-options-subset`;
export const accountInsightsUrl = `${EnvironmentUrls.userSettingsApi}/v1/account-insights`;
export const ageGroupUrl = `${accountInsightsUrl}/age-group`;

// billing-api (parental spend controls)
export const getParentalSpendControlsUrl = `${EnvironmentUrls.billingApi}/v1/parental-controls/get-settings`;

// parental-controls-api
export const childrenInfoUrl = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/children-info`;
export const childSettingsUrl = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/child-settings`;
export const childSettingsV2Url = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/child-settings-v2`;
export const parentInfoUrl = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/get-linked-parents`;
export const getWeeklyScreentimeUrl = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/get-weekly-screentime`;
export const getTopWeeklyScreentimeByUniverseUrl = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/get-top-weekly-screentime-by-universe`;
export const getRemoveLinkUrl = (childUserId: number): string =>
  `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/remove-link/${childUserId}`;
export const getParentLinkSettingsUrl = (childUserId: number): string =>
  `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/parent-link-settings/${childUserId}`;
export const grantConsentUrl = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/grant-consent`;

// parental consents (answer flow)
export const parentalControlsConsentEndpoint = `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/parental-controls/consents`;
export const cancelPendingConsentEndpoint = `${EnvironmentUrls.apiGatewayUrl}/child-requests-api/v1/cancel-consent-request`;
export const getAnswerConsentRequestEndpoint = (consentId: string): string =>
  `${EnvironmentUrls.apiGatewayUrl}/parental-controls-api/v1/verified-parental-consent/consent-request/${consentId}`;
