import React, { useEffect, useRef } from 'react';
import { WithTranslationsProps } from 'react-utilities';
import { AccountSwitcherService } from 'Roblox';
import { TLoggedInUsers } from '../../common/types/accountSwitcherTypes';

export type loginAccountSwitcherProps = {
  containerId: string;
  titleText?: string;
  helpText?: string;
  onAccountSwitched: () => void;
  handleAddAccount: () => void;
  suppressAddAccountRow?: boolean;
  removeInvalidActiveUser: boolean;
  isModal?: boolean;
  translate: WithTranslationsProps['translate'];
  loggedInUsers?: TLoggedInUsers;
};

export const LoginAccountSwitcher = ({
  containerId,
  titleText,
  helpText,
  onAccountSwitched,
  handleAddAccount,
  suppressAddAccountRow,
  removeInvalidActiveUser,
  isModal,
  translate,
  loggedInUsers
}: loginAccountSwitcherProps): JSX.Element => {
  const hasRenderedAccountSwitcherRef = useRef(false);
  const LoginAccountSwitcherParameters = {
    containerId,
    titleText,
    helpText,
    onAccountSwitched,
    handleAddAccount,
    suppressAddAccountRow,
    removeInvalidActiveUser,
    isModal,
    translate,
    loggedInUsers
  };

  const [
    isAccountSwitchingEnabledForBrowser
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false];

  useEffect(() => {
    if (isAccountSwitchingEnabledForBrowser && !hasRenderedAccountSwitcherRef.current) {
      hasRenderedAccountSwitcherRef.current = true;
      // eslint-disable-next-line no-void
      void AccountSwitcherService?.renderAccountSwitcher(LoginAccountSwitcherParameters);
    }
  }, [LoginAccountSwitcherParameters, isAccountSwitchingEnabledForBrowser]);

  return <div id={containerId} />;
};

export default LoginAccountSwitcher;
