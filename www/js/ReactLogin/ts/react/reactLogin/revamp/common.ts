import { useMutation } from '@tanstack/react-query';
import { AccountSwitcherService } from 'Roblox';
import { cryptoUtil, dataStores } from 'core-roblox-utilities';
import { TranslateFunction, useTranslation } from 'react-utilities';
import {
  getExperienceAffiliateReferralUrl,
  getLinkCode,
  getLinkType
} from '../../reactLanding/utils/affiliateLinksUtils';
import { qualifiedLogin } from '../../reactLanding/services/affiliateLinksService';
import { navigateToPage } from '../../common/utils/browserUtils';
import { login } from '../services/loginService';
import {
  getRedirectUrl,
  incrementEphemeralCounter,
  mapErrorCodeToEphemeralEvent,
  mapLoginErrorCodeToTranslationKey
} from '../utils/loginUtils';
import { errorCodes, eventCounters, loginCustomEvent } from '../constants/loginConstants';
import { CredentialType, TLoginParams, TLoginResponse } from '../../common/types/loginTypes';
import { isAccountSwitcherAvailable } from '../../accountSwitcher/utils/accountSwitcherUtils';
import {
  showEmptyBlobRequiredModal,
  showMaxLoggedInAccountsModal
} from '../../reactLanding/revamp/utils/authErrorModalUtils';

import {
  LoginCredential,
  backToLogin,
  finishLogin,
  startSelectAccount,
  start2sv,
  startSecurityQuestions,
  startSecurityNotification
} from './loginState';
import { parseSecurityQuestionsData, parseUsersData } from '../../common/utils/errorParsingUtils';
import { sendAccountSelectorLoadEvent, sendOtpLoginErrorEvent } from '../services/eventService';
import { FeatureLoginPage } from '../../common/constants/translationConstants';
import { parseErrorCode } from '../../common/utils/requestUtils';

export type LoginMutationOptions = {
  onMagicLinkLoginError?: () => void;
};

const navigateAfterLogin = (): void => {
  const returnUrl = getRedirectUrl();
  const affiliateLink = getExperienceAffiliateReferralUrl(returnUrl);
  if (affiliateLink) {
    const linkCode = getLinkCode(affiliateLink);
    const linkType = getLinkType(affiliateLink);
    qualifiedLogin({
      referralUrl: affiliateLink ?? '',
      linkId: linkCode,
      linkType,
      userDidLogIn: true
    });
  }
  navigateToPage(returnUrl);
};

export const finishSuccessfulLogin = (userId: string, accountBlob?: string): void => {
  finishLogin();

  try {
    AccountSwitcherService?.storeAccountSwitcherBlob(accountBlob ?? '');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to save blob.', e);
  }

  // update auth intent store once we have a user
  try {
    dataStores.authIntentDataStore.applyUserAuthIntent(userId);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error applying auth intent data:', e);
  }

  window.dispatchEvent(new CustomEvent(loginCustomEvent, { detail: { userId } }));

  navigateAfterLogin();
};

const buildLoginParams = async ({
  credential,
  userId,
  securityQuestionSessionId,
  securityQuestionRedemptionToken
}: {
  credential: LoginCredential;
  userId?: number;
  securityQuestionSessionId?: string;
  securityQuestionRedemptionToken?: string;
}): Promise<TLoginParams> => {
  //   params = {
  //     ctype: useDefaultCredentialType ? CredentialType.Username : credentialType,
  //   };
  // }

  const { type, value, password } = credential;
  const params: TLoginParams = {
    ctype: type,
    cvalue: value,
    password,
    userId,
    securityQuestionSessionId,
    securityQuestionRedemptionToken
  };

  if (await isAccountSwitcherAvailable()) {
    const accountBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob();
    if (accountBlob) {
      params.accountBlob = accountBlob;
    }
  }

  return params;
};

const handleEmptyAccountSwitchBlobRequired = (
  translate: TranslateFunction,
  credential: LoginCredential,
  isParentError: boolean,
  retryLogin: () => void
): void => {
  showEmptyBlobRequiredModal(translate, retryLogin, {
    origin: 'login',
    isVPCParentFocused: isParentError,
    onCancel: () => {
      backToLogin();
    }
  });
};

const handleLoginError = (
  translate: TranslateFunction,
  credential: LoginCredential,
  error: unknown,
  retryLogin: () => void,
  options: LoginMutationOptions = {}
): void => {
  // // Ignore generic challenge abandons.
  // if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
  //   backToLogin();
  //   return;
  // }
  const errorCode = parseErrorCode(error);
  switch (errorCode) {
    case errorCodes.passwordResetRequired:
      incrementEphemeralCounter(eventCounters.passwordResetRequired);
      startSecurityNotification({ credential });
      return;
    case errorCodes.securityQuestionRequired: {
      const data = parseSecurityQuestionsData(error);
      incrementEphemeralCounter(eventCounters.securityQuestionRequired);
      startSecurityQuestions({ credential, ...data });
      return;
    }
    // case errorCodes.defaultLoginRequired:
    //   handleDefaultLoginRequired();
    //   return;
    case errorCodes.multipleUsersPerCredential: {
      const { users } = parseUsersData(error);
      const userIDsCsv = users.map(user => user.id).join(',');
      sendAccountSelectorLoadEvent(users.length, userIDsCsv, credential.type);
      startSelectAccount({
        credential,
        users
      });
      return;
    }
    case errorCodes.emptyAccountSwitchBlobRequired: {
      handleEmptyAccountSwitchBlobRequired(translate, credential, false, retryLogin);
      return;
    }
    case errorCodes.parentEmptyAccountSwitchBlobRequired: {
      handleEmptyAccountSwitchBlobRequired(translate, credential, true, retryLogin);
      return;
    }
    case errorCodes.maxLoggedInAccountsLimitReached: {
      showMaxLoggedInAccountsModal(translate, () => navigateToPage(getRedirectUrl()));
      return;
    }
    default: {
      incrementEphemeralCounter(mapErrorCodeToEphemeralEvent(errorCode));
      const errorTranslationKey = mapLoginErrorCodeToTranslationKey(errorCode, credential.type);
      if (credential.type === CredentialType.EmailOtpSessionToken) {
        sendOtpLoginErrorEvent(String(errorCode));
      } else if (credential.type === CredentialType.Passkey) {
        // Throw error for passkey to retry the challenge, see: ./steps/Login.tsx
        backToLogin(translate(errorTranslationKey));
        throw error;
      } else if (credential.type === CredentialType.MagicLink) {
        backToLogin();
        options.onMagicLinkLoginError?.();
        return;
      }
      backToLogin(translate(errorTranslationKey));
    }
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useLoginMutation = (options: LoginMutationOptions = {}) => {
  const { translate } = useTranslation();
  const loginMutation = useMutation({
    mutationFn: async (data: {
      credential: LoginCredential;
      userId?: number;
      securityQuestionSessionId?: string;
      securityQuestionRedemptionToken?: string;
    }) => {
      const { credential } = data;
      if (
        [CredentialType.Username, CredentialType.PhoneNumber, CredentialType.Email].includes(
          credential.type
        ) &&
        (credential.value === '' || credential.password === '')
      ) {
        incrementEphemeralCounter(eventCounters.attempt);
        backToLogin(translate(FeatureLoginPage.MessageUsernameAndPasswordRequired));
        return;
      }

      const params = await buildLoginParams(data);
      const secureAuthenticationIntent =
        (await cryptoUtil.generateSecureAuthIntentV2()) ?? undefined;
      const authParams = { ...params, secureAuthenticationIntent };
      let result: TLoginResponse;
      try {
        result = await login(authParams);
      } catch (error: unknown) {
        handleLoginError(
          translate,
          credential,
          error,
          () => {
            loginMutation.mutate({ credential });
          },
          options
        );
        return;
      }

      if (secureAuthenticationIntent) {
        incrementEphemeralCounter(eventCounters.successWithSAI);
      }
      if (dataStores?.authIntentDataStore?.hasUnclaimedAuthIntent()) {
        incrementEphemeralCounter(eventCounters.successWithGameIntent);
      }
      incrementEphemeralCounter(eventCounters.success);

      const challengeId = result.twoStepVerificationData?.ticket;
      const id = result.user.id.toString();
      // Comment below is from older code, not 100% sure what it means
      // TODO: get blob for 2sv account
      if (challengeId != null) {
        start2sv({
          credential,
          userId: id,
          challengeId
        });
      } else {
        finishSuccessfulLogin(id, result.accountBlob);
      }
    }
  });

  return loginMutation;
};
