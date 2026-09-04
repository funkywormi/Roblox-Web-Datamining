import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@rbx/foundation-ui';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import logoutService from '../services/logoutService';
import { defaultRedirect } from '../utils/browserUtils';
import { accountSwitcherConfig } from '../../accountSwitcher/translation.config';

import '../../../../css/accountSwitcher/loggedInU13Interstitial.scss';

const interstitialTranslationKeys = {
  title: 'Header.SignOutToContinue',
  body: {
    login: 'Description.SignOutToLogIn',
    createAccount: 'Description.SignOutToCreateAccount'
  },
  signOut: 'Action.SignOut',
  backToHome: 'Action.BackToHome',
  logoutError: 'Description.PleaseTryAgainLater'
};

// DialogContent forwards Radix content props, but this Foundation version omits them from its type.
const DialogContentWithAutoFocus = DialogContent as React.ComponentType<
  React.ComponentProps<typeof DialogContent> & {
    onOpenAutoFocus: (event: Event) => void;
  }
>;

export type LoggedInU13InterstitialProps = {
  context: keyof typeof interstitialTranslationKeys.body;
  translate: WithTranslationsProps['translate'];
};

export const shouldShowLoggedInU13Interstitial = (
  isAuthenticated: boolean,
  isUnder13: boolean,
  isVerifiedParentConsentSignup = false
): boolean => isAuthenticated && isUnder13 && !isVerifiedParentConsentSignup;

export const LoggedInU13Interstitial = ({
  context,
  translate
}: LoggedInU13InterstitialProps): JSX.Element => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasLogoutError, setHasLogoutError] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    setHasLogoutError(false);

    try {
      await logoutService.logout();
    } catch {
      setHasLogoutError(true);
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog
      open
      isModal
      size='Medium'
      type='Default'
      hasCloseAffordance={false}
      hasMarginTop
      hasMarginBottom={false}>
      <DialogContentWithAutoFocus
        className='logged-in-u13-interstitial-dialog'
        onOpenAutoFocus={(event: Event) => {
          event.preventDefault();
        }}>
        <DialogBody className='logged-in-u13-interstitial-body flex flex-col gap-xsmall'>
          <DialogTitle className='logged-in-u13-interstitial-title text-heading-small content-emphasis'>
            {translate(interstitialTranslationKeys.title)}
          </DialogTitle>
          <p className='text-body-medium content-default'>
            {translate(interstitialTranslationKeys.body[context])}
          </p>
        </DialogBody>
        {hasLogoutError && (
          <DialogBody className='logged-in-u13-interstitial-error'>
            <p className='text-error' role='alert'>
              {translate(interstitialTranslationKeys.logoutError)}
            </p>
          </DialogBody>
        )}
        <DialogFooter className='logged-in-u13-interstitial-footer flex flex-col gap-small'>
          <Button
            type='button'
            variant='Emphasis'
            size='Medium'
            aria-label={translate(interstitialTranslationKeys.signOut)}
            aria-busy={isLoggingOut}
            isDisabled={isLoggingOut}
            isLoading={isLoggingOut}
            onClick={() => {
              // eslint-disable-next-line no-void
              void handleLogout();
            }}>
            {translate(interstitialTranslationKeys.signOut)}
          </Button>
          <Button
            type='button'
            variant='ActionUtility'
            size='Medium'
            isDisabled={isLoggingOut}
            onClick={defaultRedirect}>
            {translate(interstitialTranslationKeys.backToHome)}
          </Button>
        </DialogFooter>
      </DialogContentWithAutoFocus>
    </Dialog>
  );
};

export default withTranslations(LoggedInU13Interstitial, accountSwitcherConfig);
