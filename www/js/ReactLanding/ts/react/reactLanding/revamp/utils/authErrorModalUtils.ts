import { WithTranslationsProps } from 'react-utilities';
import { AccountSwitcherService, NavigationService } from 'Roblox';
import {
  accountLimitErrorStrings,
  accountSwitcherStrings,
  confirmationModalOrigins,
  logoutAllAccountsPlaceholderStrings
} from '../../../accountSwitcher/constants/accountSwitcherConstants';
import {
  deleteAccountSwitcherBlob,
  getStoredAccountSwitcherBlob
} from '../../../accountSwitcher/utils/accountSwitcherUtils';
import { logoutAllLoggedInUsers } from '../../../accountSwitcher/services/accountSwitcherService';
import { sendAuthClientErrorEvent } from '../../../accountSwitcher/services/eventService';
import EVENT_CONSTANTS from '../../../common/constants/eventsConstants';

export const AUTH_ERROR_MODAL_CONTAINER_ID = 'auth-error-modal-container';

type TranslateFn = WithTranslationsProps['translate'];

type AccountSwitcherErrorModalOrigin = 'signup' | 'login';

type AccountSwitcherErrorModalOptions = {
  origin?: AccountSwitcherErrorModalOrigin;
  containerId?: string;
  onCancel?: () => void;
  isVPCParentFocused?: boolean;
};

const getAccountSwitcherErrorModalOrigin = (
  isParent: boolean,
  origin: AccountSwitcherErrorModalOrigin
) => {
  if (origin === 'login') {
    return isParent
      ? confirmationModalOrigins.LoginVpcEmptyBlobRequiredError
      : confirmationModalOrigins.LoginEmptyBlobRequiredError;
  }
  return isParent
    ? confirmationModalOrigins.SignupVpcEmptyBlobRequiredError
    : confirmationModalOrigins.SignupEmptyBlobRequiredError;
};

const getAccountSwitcherErrorBodyText = (
  isParent: boolean,
  origin: AccountSwitcherErrorModalOrigin
) => {
  if (origin === 'login') {
    return isParent
      ? logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpTextParent
      : logoutAllAccountsPlaceholderStrings.LoginConfirmationHelpText;
  }
  return isParent
    ? logoutAllAccountsPlaceholderStrings.SignupConfirmationHelpTextParent
    : logoutAllAccountsPlaceholderStrings.SignupConfirmationHelpText;
};

const getAccountSwitcherErrorContext = (
  isParent: boolean,
  origin: AccountSwitcherErrorModalOrigin
) => {
  if (origin === 'login') {
    return isParent
      ? EVENT_CONSTANTS.context.accountSwitcherVpcLogin
      : EVENT_CONSTANTS.context.accountSwitcherLogin;
  }
  return isParent
    ? EVENT_CONSTANTS.context.accountSwitcherVpcSignup
    : EVENT_CONSTANTS.context.accountSwitcherSignup;
};

const getAccountSwitcherErrorHeaderTextKey = (origin: AccountSwitcherErrorModalOrigin) => {
  return origin === 'login'
    ? logoutAllAccountsPlaceholderStrings.LoginConfirmationHeaderText
    : logoutAllAccountsPlaceholderStrings.SignupConfirmationHeaderText;
};

const getAccountSwitcherErrorPrimaryButtonTextKey = (origin: AccountSwitcherErrorModalOrigin) => {
  return origin === 'login'
    ? logoutAllAccountsPlaceholderStrings.LoginConfirmationButtonText
    : logoutAllAccountsPlaceholderStrings.SignupConfirmationButtonText;
};

const getAccountSwitcherErrorCancelButtonTextKey = (origin: AccountSwitcherErrorModalOrigin) => {
  return origin === 'login'
    ? logoutAllAccountsPlaceholderStrings.LoginConfirmationCancelText
    : logoutAllAccountsPlaceholderStrings.SignupConfirmationCancelText;
};

export const showMaxLoggedInAccountsModal = (
  translate: TranslateFn,
  onRedirectHome: () => void
): void => {
  const ConfirmationModalParameters = {
    containerId: AUTH_ERROR_MODAL_CONTAINER_ID,
    origin: confirmationModalOrigins.SignupAccountLimit,
    localizedTitleText: translate(accountLimitErrorStrings.HeadingAccountLimitReached),
    localizedBodyText: translate(accountLimitErrorStrings.LabelAccountLimitReached),
    localizedPrimaryButtonText: translate(accountLimitErrorStrings.ActionOK),
    primaryButtonCallback: onRedirectHome,
    localizedSecondaryButtonText: translate(accountSwitcherStrings.ActionLogOutAllAccounts),
    secondaryButtonCallback: async () => {
      const blob = getStoredAccountSwitcherBlob();
      if (blob) {
        try {
          await logoutAllLoggedInUsers({ encrypted_users_data_blob: blob });
        } catch (error) {
          sendAuthClientErrorEvent(
            EVENT_CONSTANTS.context.accountSwitcherLimitError,
            EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts
          );
        }
      }
      deleteAccountSwitcherBlob();
      try {
        NavigationService?.logoutAndRedirect();
      } catch (error) {
        window.location.reload();
      }
    },
    isModalDismissable: false
  };
  AccountSwitcherService?.renderBaseConfirmationModal(ConfirmationModalParameters);
};

export const showEmptyBlobRequiredModal = (
  translate: TranslateFn,
  onRetry: () => void,
  options: AccountSwitcherErrorModalOptions = {}
): void => {
  const resolvedIsParent = options.isVPCParentFocused ?? false;
  const origin = options.origin ?? 'signup';
  const containerId = options.containerId ?? AUTH_ERROR_MODAL_CONTAINER_ID;
  const modalOrigin = getAccountSwitcherErrorModalOrigin(resolvedIsParent, origin);

  const bodyText = translate(getAccountSwitcherErrorBodyText(resolvedIsParent, origin));
  const authClientErrorContext = getAccountSwitcherErrorContext(resolvedIsParent, origin);

  const ConfirmationModalParameters = {
    containerId,
    origin: modalOrigin,
    localizedTitleText: translate(getAccountSwitcherErrorHeaderTextKey(origin)),
    localizedBodyText: bodyText,
    localizedPrimaryButtonText: translate(getAccountSwitcherErrorPrimaryButtonTextKey(origin)),
    primaryButtonCallback: async () => {
      const blob = getStoredAccountSwitcherBlob();
      if (blob) {
        try {
          await logoutAllLoggedInUsers({ encrypted_users_data_blob: blob });
        } catch (error) {
          sendAuthClientErrorEvent(
            authClientErrorContext,
            EVENT_CONSTANTS.clientErrorTypes.logoutAllAccountSwitcherAccounts
          );
        }
      }
      deleteAccountSwitcherBlob();
      onRetry();
    },
    localizedSecondaryButtonText: translate(getAccountSwitcherErrorCancelButtonTextKey(origin)),
    ...(options.onCancel ? { secondaryButtonCallback: options.onCancel } : {}),
    isModalDismissable: false
  };
  AccountSwitcherService?.renderBaseConfirmationModal(ConfirmationModalParameters);
};
