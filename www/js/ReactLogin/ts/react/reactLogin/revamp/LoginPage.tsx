/* eslint-disable @typescript-eslint/no-shadow */
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { AccountSwitcherService } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import { dataStores } from 'core-roblox-utilities';
import { Loading } from 'react-style-guide';
import LeftRightLayout from '../../reactLanding/revamp/LeftRightLayout';
import LoginForm from './LoginForm';
import bg from '../../../../images/landing/game_grid.webp';
import './main.css';
import useLoggedInUsers from '../../common/hooks/useLoggedInUsers';
import {
  sendAuthPageLoadEvent,
  sendAvailableAccountsForSwitchingOnPageLoadEvent
} from '../services/eventService';
import useRedirectHomeIf from '../../common/hooks/useRedirectHomeIf';
import { AUTH_ERROR_MODAL_CONTAINER_ID } from '../../reactLanding/revamp/utils/authErrorModalUtils';
import { startLogin, startSwitchAccount, useLogin } from './loginState';
import SwitchAccount from './steps/SwitchAccount';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { getMagicLinkTokenFromQueryString } from './magicLinkLoginUtils';

const { lrLoginForm } = EVENT_CONSTANTS.context;

const LeftContent = () => {
  const { loggedInUsers, isGettingLoggedInUsers } = useLoggedInUsers(
    !(authenticatedUser?.isAuthenticated ?? false) // shouldFetchUserInfo only if not authenticated
  ); // TODO: use useQuery in this hook
  const [
    isAccountSwitchingEnabledForBrowser,
    isAccountSwitcherHookCompleted
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false, false];

  const loadingAccounts = isGettingLoggedInUsers || !isAccountSwitcherHookCompleted;
  const isMagicLinkLogin = useRef(Boolean(getMagicLinkTokenFromQueryString())).current;
  const step = useLogin(({ step }) => step);
  const canSwitchAccounts =
    !loadingAccounts &&
    !isMagicLinkLogin &&
    isAccountSwitchingEnabledForBrowser &&
    !authenticatedUser.isAuthenticated &&
    Boolean(loggedInUsers?.usersAvailableForSwitching?.length);

  useEffect(() => {
    if (!loadingAccounts) {
      if (canSwitchAccounts) {
        // If available, log available accounts that user can switch into
        const userIds = loggedInUsers.usersAvailableForSwitching.map(user => user.id).join(',');
        sendAuthPageLoadEvent(lrLoginForm, EVENT_CONSTANTS.field.accountSwitcher);
        sendAvailableAccountsForSwitchingOnPageLoadEvent(userIds);
        startSwitchAccount();
      } else {
        startLogin({
          switchAccount: loggedInUsers.isAccountLimitReached ? 'limit-reached' : undefined
        });
      }
    }
  }, [loadingAccounts, canSwitchAccounts, loggedInUsers]);

  useRedirectHomeIf(
    authenticatedUser.isAuthenticated &&
      isAccountSwitcherHookCompleted &&
      !isAccountSwitchingEnabledForBrowser &&
      !isMagicLinkLogin
  );

  switch (step) {
    case 'loading':
      return (
        <div className='height-full flex items-center'>
          <Loading />
        </div>
      );
    case 'switch-account':
      return <SwitchAccount loggedInUsers={loggedInUsers} />;
    case 'login':
    case 'otp':
    case 'xdl':
    case 'select-account':
    case 'security-questions':
    case 'security-notification':
    case '2sv':
    case 'finish':
    default:
      return <LoginForm />;
  }
};

const LoginPage = (): JSX.Element => {
  useEffect(() => {
    sendAuthPageLoadEvent(lrLoginForm);
  }, []);

  useEffect(() => {
    try {
      const {
        authIntentDataStore: { saveGameIntentFromReturnUrl }
      } = dataStores;
      saveGameIntentFromReturnUrl();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('intent saving error: ', e);
    }
  }, []);

  return (
    <div className='login-revamp-container'>
      <LeftRightLayout
        className='bg-surface-0 justify-center'
        style={{ width: '100%', minHeight: '100vh' }}
        left={
          <div
            className={classNames(
              'flex flex-col gap-xlarge size-full',
              'padding-top-[var(--size-2200)] padding-x-xlarge medium:padding-x-[var(--size-1200)] large:padding-x-[var(--size-1600)]'
            )}>
            <LeftContent />
          </div>
        }
        right={
          <div className='relative size-full clip'>
            <img
              className='absolute size-full select-none'
              style={{ objectFit: 'cover', opacity: 0.7 }}
              src={bg}
              alt=''
              draggable={false}
            />
          </div>
        }
      />
      <div id={AUTH_ERROR_MODAL_CONTAINER_ID} />
    </div>
  );
};

export default LoginPage;
