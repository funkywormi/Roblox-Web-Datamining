import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";

export const getSignupRedirUrl = () => getAbsoluteUrl("/account/signupredir");
export const getHomeUrl = () => getAbsoluteUrl("/home");
export const getWebsiteUrl = () => environmentUrls.websiteUrl;
export const getLogoutUrl = () => `${environmentUrls.authApi}/v2/logout`;
export const getRefreshSessionUrl = () => `${environmentUrls.authApi}/v2/session/refresh`;
export const getRootUrl = () => getAbsoluteUrl("/");
export const getUnreadPrivateMessagesCountUrl = () =>
  `${environmentUrls.privateMessagesApi}/v1/messages/unread/count`;
export const getUserCurrencyUrl = (userId: number) =>
  `${environmentUrls.economyApi}/v1/users/${userId}/currency`;
export const getTradeStatusCountUrl = () => `${environmentUrls.tradesApi}/v1/trades/inbound/count`;
export const getFriendsRequestCountUrl = () =>
  `${environmentUrls.friendsApi}/v1/user/friend-requests/count`;
export const getLoginUrl = () => getAbsoluteUrl("/login");
export const getNewLoginUrl = () => getAbsoluteUrl("/newLogin");
export const getAccountSwitchingSignUpUrl = () => getAbsoluteUrl("/CreateAccount");
export const getCreditBalanceForNavigationUrl = () =>
  `${environmentUrls.apiGatewayUrl}/credit-balance/v1/get-credit-balance-for-navigation`;
export const getSignedVngShopUrl = () =>
  `${environmentUrls.apiGatewayUrl}/vng-payments/v1/getVngShopUrl`;
export const getRobuxBadgeUrl = () => `${environmentUrls.apiGatewayUrl}/robuxbadge/v1/robuxbadge`;
export const getPasskeyStartRegistrationUrl = () =>
  `${environmentUrls.authApi}/v1/passkey/StartRegistration`;
export const getPasskeyFinishRegistrationUrl = () =>
  `${environmentUrls.authApi}/v1/passkey/FinishRegistration`;
export const getSilentUpgradeAvailableUrl = () =>
  `${environmentUrls.authApi}/v1/passkey/su-eligibility`;
