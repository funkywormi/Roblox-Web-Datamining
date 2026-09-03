import { EnvironmentUrls } from "Roblox";
import { urlService } from "core-utilities";
import RouterPath from "../../../enums/RouterPath";

// user-settings-api, parental-controls-api, and parental spend-control URLs used to live here.
// They now live in @rbx/user-settings — import them from there.

export const accountSettingsUrl = EnvironmentUrls.accountSettingsApi;
export const getProfileUrl = (userId: number): string =>
  urlService.getAbsoluteUrl(`/users/${userId}/profile`);

export const settingsRouterPath = {
  accountInfo: urlService.getAbsoluteUrl(`/my/account#!/${RouterPath.Info}`),
  security: urlService.getAbsoluteUrl(`/my/account#!/${RouterPath.Security}`),
  privacy: urlService.getAbsoluteUrl(`/my/account#!/${RouterPath.Privacy}`),
  billing: urlService.getAbsoluteUrl(`/my/account#!/${RouterPath.Billing}`),
  parentalControls: urlService.getAbsoluteUrl(`/my/account#!/${RouterPath.ParentalControls}`),
  appPermissions: urlService.getAbsoluteUrl(`/my/account#!/${RouterPath.AppPermissions}`),
};

export const getRouterAbsolutePath = (routerPath: string): string =>
  urlService.getAbsoluteUrl(`/my/account#!${routerPath}`);

// Account Info
export const accountInfoEndpoint = "/my/settings/json";
export const promotionChannelsEndpoint = `${EnvironmentUrls.accountInformationApi}/v1/promotion-channels`;
export const changeUsernameEndpoint = `${EnvironmentUrls.authApi}/v1/username`;
export const usernameChangePriceEndpoint = `${EnvironmentUrls.authApi}/v1/username/change/price`;
export const validateUsernameEndpoint = `${EnvironmentUrls.authApi}/v1/usernames/validate`;
export const birthdateInfo = urlService.getAbsoluteUrl("/info/birthday");
export const birthdateMoreInfo = "https://help.roblox.com/hc/articles/4412863575316";

export const birthdateUpdateHelpArticle = "https://help.roblox.com/hc/articles/360031323611";

export const buyRobuxUrl = urlService.getAbsoluteUrl("/upgrades/robux");
export const getGenderUrl = `${EnvironmentUrls.usersApi}/v1/gender`;
export const accountCountrySetting = `${accountSettingsUrl}/v1/account/settings/account-country`;
export const emailsUrl = `${accountSettingsUrl}/v1/emails`;

// Account Deletion
export const accountDeactivationEndpoint = `${EnvironmentUrls.apiGatewayUrl}/account-deletion-api/v1/deactivate`;
export const logoutEndpoint = `${EnvironmentUrls.authApi}/v2/logout`;

// Auth
export const changePasswordUrl = `${EnvironmentUrls.authApi}/v2/user/passwords/change`;
export const listCredentialsUrl = `${EnvironmentUrls.authApi}/v1/passkey/ListCredentials`;
export const authMetadataUrl = `${EnvironmentUrls.authApi}/v1/metadata`;

// Parental Controls help articles
export const spendRestrictionsHelpUrl = "https://help.roblox.com/hc/articles/4409125091348";
export const spendingHelpUrl = "https://help.roblox.com/hc/categories/200213820";
export const premiumHelpUrl = "https://help.roblox.com/hc/articles/203312540";
export const subscriptionsHelpUrl = "https://help.roblox.com/hc/articles/20292396051220";

export const getAMPFeatureUrl = (featureName: string): string =>
  `${EnvironmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}`;
export const getAMPFeatureUrlWithNamespace = (featureName: string, namespace: string): string =>
  `${EnvironmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=${featureName}&nameSpace=${namespace}`;

export const omniSearchUrl = `${EnvironmentUrls.apiGatewayUrl}/search-api/omni-search`;

export const getGameDetailsPagePath = (placeId: number): string => `/games/${placeId}`;

export const editChildProfileHelpPageUrl = "https://help.roblox.com/hc/articles/30428367965460";

export const parentDashboardHelpPageUrl = "https://help.roblox.com/hc/articles/30428321333140";

export const childDashboardHelpPageUrl = "https://help.roblox.com/hc/articles/30428248050068";

export const perExperienceScreentimeHelpPageUrl =
  "https://help.roblox.com/hc/articles/30428328969492";
export const personaPageUrl = "https://withpersona.com/legal/privacy-policy";
export const facialCapturePrivacyPageUrl = "https://help.roblox.com/hc/articles/4412863575316";
export const experienceChatHelpPageUrl = "https://help.roblox.com/hc/articles/203313520";
export const presetChatHelpPageUrl = "https://help.roblox.com/hc/articles/203313520";
export const shareActivityUpdatesHelpPageUrl = "https://help.roblox.com/hc/articles/39144167691284";

// Privacy
export const appChatPrivacyEndpoint = "/v1/app-chat-privacy";
export const gameChatPrivacyEndpoint = "/v1/game-chat-privacy";
export const privateMessagePrivacyEndpoint = "/v1/private-message-privacy";
export const inventoryPrivacyEndpoint = "/v1/inventory-privacy";
export const tradePrivacyEndpoint = "/v1/trade-privacy";
export const tradeValueEndpoint = "/v1/trade-value";
export const privacyPolicyLink = urlService.getAbsoluteUrl("/info/privacy");
export const exerciseDataRightPagePath = "/info/exercise-data-rights";
export const supportFormPath = "/support";
export const contactsEndpoint = `${EnvironmentUrls.contactsServiceApi}/v1/contacts`;
export const detailedBlockedUsersUrl = `${accountSettingsUrl}/v1/users/get-detailed-blocked-users`;
export const getUnblockUserEndpointUrl = (userId: number): string =>
  `${EnvironmentUrls.accountSettingsApi}/v1/users/${userId}/unblock`;
export const blockedUsersEndpointUrl = `${EnvironmentUrls.apiGatewayUrl}/user-blocking-api/v1/users/get-blocked-users`;
export const getUnblockUserEndpointUrlV2 = (userId: number): string =>
  `${EnvironmentUrls.apiGatewayUrl}/user-blocking-api/v1/users/${userId}/unblock-user`;
export const chatHelpPageUrl = "https://help.roblox.com/hc/articles/206224956";
export const studioCollaborationHelpPageUrl = "https://help.roblox.com/hc/articles/45695280942228";
export const trustedConnectionsHelpPageUrl = "https://help.roblox.com/hc/articles/37725513985812";
export const rightToAccessHelpPageUrl = "https://help.roblox.com/hc/articles/40630460625556";
export const getForgetUserUrl = (userId: number): string =>
  `${EnvironmentUrls.apiGatewayUrl}/privacy/v1/users/${userId}/forget`;
export const getRequestDataUrl = (userId: number): string =>
  `${EnvironmentUrls.apiGatewayUrl}/privacy/v1/users/${userId}/request-data`;

// Voice and avatar chat
export const getVoiceSettingsUrl = `${EnvironmentUrls.voiceApi}/v1/settings`;
export const spatialVoiceLink = `${EnvironmentUrls.websiteUrl}/info/spatial-voice`;
export const communityStandardsLink = `${EnvironmentUrls.websiteUrl}/info/community-guidelines`;
export const facialAnimationPrivacyLink = `${EnvironmentUrls.websiteUrl}/info/facial-animation-privacy`;
export const animateYourAvatarLink = `${EnvironmentUrls.websiteUrl}/info/animate-your-avatar`;
export const updateVoiceChatEnabledUrl = `${EnvironmentUrls.voiceApi}/v1/settings/user-opt-in`;
export const updateAllowVoiceDataUsageEnabledUrl = `${EnvironmentUrls.voiceApi}/v1/settings/user-opt-in/data-consent`;
export const updateAvatarVideoEnabledUrl = `${EnvironmentUrls.voiceApi}/v1/settings/user-opt-in/avatarvideo`;
export const voiceFAQUrl = `${EnvironmentUrls.websiteUrl}/info/voice-faq`;

// App Permissions
export const getScopesUrl = `${EnvironmentUrls.apiGatewayUrl}/oauth/v1/scopes`;
export const getAuthorizationsUrl = `${EnvironmentUrls.apiGatewayUrl}/oauth/v1/authorizations`;
export const deleteAuthorizationUrl = `${EnvironmentUrls.apiGatewayUrl}/oauth/v1/authorizations/{authorizationId}`;
export const reportOAuthAppUrl = `${EnvironmentUrls.apiGatewayUrl}/abuse-reporting/v1/safety-event`;
export const getDeleteAuthorizationUrl = (authorizationId: string): string => {
  return `${EnvironmentUrls.apiGatewayUrl}/oauth/v1/authorizations/${authorizationId}`;
};

// Email
export const sendVerifyEmailUrl = `${accountSettingsUrl}/v1/email/verify`;
export const getOrUpdateEmailUrl = `${accountSettingsUrl}/v1/email`;

// account information
export const accountInformationPhoneEndpoint = `${EnvironmentUrls.accountInformationApi}/v1/phone`;
export const accountInformationBirthdateEndpoint = `${EnvironmentUrls.usersApi}/v1/birthdate`;

// parent consents (UI-only)
export const getConsentDetailsPageUrl = (consentId: string): string =>
  `/parental-requests?requestType=UpdateUserSetting&source=SettingsPage&consentId=${consentId}&redirectUrl=${encodeURIComponent(
    window.location.href,
  )}`;

export const getTrustedConnectionReviewPageUrl = (consentId: string, sessionId: string): string =>
  `/parental-requests?requestType=AddTrustedConnection&sessionId=${sessionId}&consentId=${consentId}&redirectUrl=${encodeURIComponent(
    window.location.href,
  )}`;

export const getVerificationPageUrl = (childUserId: number): string =>
  `/parental-requests?requestType=UpdateUserSetting&source=SettingsPage&childUserId=${childUserId}&redirectUrl=${encodeURIComponent(
    window.location.href,
  )}`;

// parental friend actions
export const findFriendsEndpointUrl = (userId: number): string => {
  return `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/find`;
};
export const friendsCountEndpointUrl = (userId: number): string => {
  return `${EnvironmentUrls.friendsApi}/v1/users/${userId}/friends/count`;
};
export const getAbuseReportRevampUrl = ({
  targetId,
  submitterId,
  abuseVector,
}: {
  targetId: string;
  submitterId: string;
  abuseVector: string;
}): string => {
  const params = new URLSearchParams({
    targetId,
    submitterId,
    abuseVector,
  });
  return `/report-abuse/?${params.toString()}`;
};
export const getReportUrl = (userId: number): string =>
  urlService.getAbsoluteUrl(
    `/abusereport/userprofile?id=${userId}&redirecturl=${encodeURIComponent(window.location.href)}`,
  );

// Translations settings
export const translationsMoreInfo = "https://en.help.roblox.com/hc/en-us/articles/40269095851284";

// Experience blocking
export const blockedExperiencesEndpointUrl = `${EnvironmentUrls.apiGatewayUrl}/experience-blocking-api/v1/get-blocked-experiences`;

// Experience approvals
export const approvedExperiencesEndpointUrl = `${EnvironmentUrls.apiGatewayUrl}/experience-blocking-api/v1/get-approved-experiences`;
export const gamesEndpointUrl = `${EnvironmentUrls.gamesApi}/v1/games`;
export const ageRecommendationUrl = `${EnvironmentUrls.apiGatewayUrl}/experience-guidelines-service/v1beta1/multi-age-recommendation`;

// Locale API
export const getUserLocalizationLocusEndpoint = `${EnvironmentUrls.localeApi}/v1/locales/user-localization-locus-supported-locales`;
export const setShowRobloxTranslationsEndpoint = `${EnvironmentUrls.localeApi}/v1/locales/set-show-roblox-translations`;

// Age Verification
export const getUndoAgeVerificationEligibilityEndpointUrl = `${EnvironmentUrls.apiGatewayUrl}/age-verification-service/v1/age-verification/undo-age-verification-eligibility`;
export const undoAgeVerificationEndpointUrl = `${EnvironmentUrls.apiGatewayUrl}/age-verification-service/v1/age-verification/undo-age-verification`;
export const acceptPendingDownageEndpointUrl = `${EnvironmentUrls.apiGatewayUrl}/age-verification-service/v1/age-verification/accept-pending-downage`;

// Robux Transfers
export const getRobuxTransferEndpointUrl = (transferRequestId: number | string): string =>
  `${EnvironmentUrls.apiGatewayUrl}/transfer/v1/robux-transfer/transfer/${transferRequestId}`;
