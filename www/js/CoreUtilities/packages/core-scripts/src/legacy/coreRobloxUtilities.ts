import * as boundAuth from "../auth/boundAuth";
import * as crypto from "../auth/crypto";
import * as fido2 from "../auth/fido2";
import * as hba from "../auth/hba";
import * as hybridResponse from "../auth/hybridResponse";
import * as sai from "../auth/secureAuthIntent";
import * as saiv2 from "../auth/secureAuthIntentV2";
import * as deepLink from "../deep-link";
import * as entityUrls from "../entity-url";
import * as eventStream from "../event-stream";
import * as game from "../game";
import hybrid from "../hybrid";
import * as localStorageKeys from "../local-storage/keys";
import * as chat from "../util/chat";
import * as elementVisibility from "../util/elementVisibility";
import * as upsell from "../util/upsell";
import { isGoogleAnalyticsCookieConsentOptIn } from "../cookie";

export const boundAuthTokensHttpUtil = {
  buildConfigBoundAuthToken: boundAuth.buildConfigBoundAuthToken,
  generateBoundAuthToken: boundAuth.generateBoundAuthToken,
  shouldRequestWithBoundAuthToken: boundAuth.shouldRequestWithBoundAuthToken,
};
export const chatService = {
  startDesktopAndMobileWebChat: chat.startDesktopAndMobileWebChat,
};
// Note this does not include `deleteUserCryptoKeyPairUponLogout`, since it is unused.
export const cryptoUtil = {
  ...crypto,
  getHbaMeta: hba.hbaMeta,
  generateSecureAuthIntent: sai.generateSecureAuthIntent,
  generateSecureAuthIntentV2: saiv2.generateSecureAuthIntent,
};
export { default as dataStores } from "../data-store/stores";
export const deepLinkService = {
  parseDeeplink: deepLink.parseDeepLink,
  navigateToDeepLink: deepLink.navigateToDeepLink,
};
export const elementVisibilityService = {
  observeChildrenVisibility: elementVisibility.observeChildrenVisibility,
  observeVisibility: elementVisibility.observeVisibility,
};
export const entityUrl = {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  game: entityUrls.game,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  group: entityUrls.group,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  user: entityUrls.user,
};
export const eventStreamService = {
  eventTypes: eventStream.eventTypes,
  sendEvent: eventStream.sendEvent,
  sendEventWithTarget: eventStream.sendEventWithTarget,
  sendGamePlayEvent: eventStream.sendGamePlayEvent,
  targetTypes: eventStream.targetTypes,
};
export const fido2Util = {
  base64StringToBase64UrlString: fido2.base64StringToBase64UrlString,
  base64UrlStringToBase64String: fido2.base64UrlStringToBase64String,
  convertPublicKeyParametersToStandardBase64: fido2.convertPublicKeyParametersToStandardBase64,
  formatCredentialAuthenticationResponseApp: fido2.formatCredentialAuthenticationResponseApp,
  formatCredentialAuthenticationResponseWeb: fido2.formatCredentialAuthenticationResponseWeb,
  formatCredentialRegistrationResponseApp: fido2.formatCredentialRegistrationResponseApp,
  formatCredentialRegistrationResponseWeb: fido2.formatCredentialRegistrationResponseWeb,
  formatCredentialRequestWeb: fido2.formatCredentialRequestWeb,
};
export const hybridResponseService = {
  FeatureTarget: hybridResponse.FeatureTarget,
  getNativeResponse: hybridResponse.getNativeResponse,
  injectNativeResponse: hybridResponse.injectNativeResponse,
};
export const hybridService = {
  close: hybrid.close,
  launchGame: hybrid.launchGame,
  localization: hybrid.localization,
  navigateToFeature: hybrid.navigateToFeature,
  openUserProfile: hybrid.openUserProfile,
  startChatConversation: hybrid.startChatConversation,
  startWebChatConversation: hybrid.startWebChatConversation,
};
export { initializeGenericChallengeInterceptor } from "../auth/internal/genericChallengeInterceptor";
export const localStorageNames = { friendsDict: localStorageKeys.friendsDict };
export { default as localStorageService } from "../local-storage";
export { default as paymentFlowAnalyticsService } from "../payments-flow";
export const playGameService = {
  buildPlayGameProperties: game.buildPlayGameProperties,
  launchGame: game.launchGame,
};
// export const sessionStorageService = ; // deleted, could not find any references/usages
export const upsellUtil = {
  constants: upsell.constants,
  expireUpsellCookie: upsell.expireUpsellCookie,
  getUpsellUuid: upsell.getUpsellUuid,
  parseUpsellCookie: upsell.parseUpsellCookie,
};
// TODO: remove this once there are no more usages
// eslint-disable-next-line @typescript-eslint/no-deprecated
export { default as userInfoService } from "../util/user";
export type { TSecureAuthIntent } from "../auth/crypto";
// Exposed on CoreRobloxUtilities for WebApps (coreUtilities/entry.ts addExternal("CoreRobloxUtilities", { ...CoreRobloxUtilities }))
export { isGoogleAnalyticsCookieConsentOptIn };
