import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-utilities';
import { Button, Divider, Icon } from '@rbx/foundation-ui';
import UsernameInput from '../../reactLanding/revamp/components/UsernameInput';
import PasswordInput from '../../reactLanding/revamp/components/PasswordInput';
import { startOtp, startXdl, setIdentifier, setPassword, useLogin } from './loginState';
import {
  accountSwitchingSignupUrl,
  loginFormStrings,
  otpOrigin,
  urlConstants
} from '../constants/loginConstants';
import { getOtpMetadata } from '../../common/services/otpService';
import { buildSignupRedirUrl, navigateToPage } from '../../common/utils/browserUtils';
import { showMaxLoggedInAccountsModal } from '../../reactLanding/revamp/utils/authErrorModalUtils';
import {
  sendLoginButtonClickEvent,
  sendOtpLoginButtonClickEvent,
  sendXdlButtonClickEvent,
  sendAuthFormInteractionEvent,
  sendAuthButtonClickEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { CredentialType } from '../../common/types/loginTypes';
import { getCredentialType, getRedirectUrl } from '../utils/loginUtils';
import { useLoginMutation } from './common';
import { getMagicLinkTokenFromQueryString, magicLinkTokenQueryParam } from './magicLinkLoginUtils';
import MagicLinkLoginErrorModal from './MagicLinkLoginErrorModal';
import Login2sv from './steps/2sv';
import Login from './steps/Login';
import Otp from './steps/Otp';
import SecurityQuestions from './steps/SecurityQuestions';
import SecurityNotification from './steps/SecurityNotification';
import SelectAccount from './steps/SelectAccount';
import Xdl, { xdlListener, XdlModalContainer } from './steps/Xdl';

const { lrLoginForm } = EVENT_CONSTANTS.context;
const { username, password: passwordField, OTP } = EVENT_CONSTANTS.field;
const {
  login: loginBtn,
  xdl,
  forgotCredentials,
  createAccount,
  showPassword,
  hidePassword
} = EVENT_CONSTANTS.btn;
const { focused, unfocused } = EVENT_CONSTANTS.state;

// Does not handle:
// - korea flow
// - vpc flow

// Used to override styling from css/vendors/bootstrap/_forms.scss
// To not affect the other, old sign up form, we only want to load this styling if this new
// component is being rendered. So, we dynamically inject the stylesheet below.
const styleFix = `
label {
  margin-bottom: 0;
}
h3 {
  text-transform: none;
}`;

const LoginForm = (): JSX.Element => {
  const magicLinkToken = useRef(getMagicLinkTokenFromQueryString()).current;
  const [isMagicLinkLoginErrorModalOpen, setIsMagicLinkLoginErrorModalOpen] = useState(false);
  const isOtpEnabled = useQuery({
    queryKey: ['otp-metadata'],
    queryFn: () => getOtpMetadata(otpOrigin),
    placeholderData: {
      OtpCodeLength: 100,
      IsOtpEnabled: true
    }
  });

  const { translate } = useTranslation();
  const { identifier, password, errorMessage, ...loginState } = useLogin();
  const login = useLoginMutation({
    onMagicLinkLoginError: () => setIsMagicLinkLoginErrorModalOpen(true)
  });

  const inProgress = login.isPending || loginState.step !== 'login';
  const isAccountLimitReached = loginState.switchAccount === 'limit-reached';
  const isDisabled = inProgress || isAccountLimitReached;

  const createAccountUrl =
    loginState.switchAccount === 'adding-account'
      ? `${accountSwitchingSignupUrl}?${new URLSearchParams({
          returnUrl: getRedirectUrl()
        }).toString()}`
      : buildSignupRedirUrl();

  const forgotCredentialsParams =
    identifier === '' ? '' : `?${new URLSearchParams({ identifier }).toString()}`;

  useEffect(() => {
    if (isAccountLimitReached) {
      showMaxLoggedInAccountsModal(translate, () => navigateToPage(getRedirectUrl()));
    }
  }, [isAccountLimitReached, translate]);

  useEffect(() => {
    // Redeem a magic-link token by submitting it once, exactly like a normal
    // credential submit. LoginForm only mounts once the login step is active and
    // stays mounted across later steps, so a mount-only effect fires exactly once
    // at the right time; a failed redemption falls through to the standard login
    // error handling instead of auto-retrying.
    if (!magicLinkToken) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(magicLinkTokenQueryParam);
    const remainingSearch = searchParams.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${remainingSearch ? `?${remainingSearch}` : ''}${
        window.location.hash
      }`
    );

    login.mutate({
      credential: {
        type: CredentialType.MagicLink,
        value: magicLinkToken,
        password: magicLinkToken
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: in the future this should be moved to the `Xdl` step.
  // We have to add it here, since there is no callback to tell when the cross device login is cancelled or errors.
  // So, we have to keep the listener always active while the login step is displayed.
  useEffect(() => {
    const listener = xdlListener(login);
    window.addEventListener('OnCrossDeviceCodeValidated', listener);
    return () => {
      window.removeEventListener('OnCrossDeviceCodeValidated', listener);
    };
  }, [login]);

  return (
    <React.Fragment>
      <style>{styleFix}</style>
      <div className='flex flex-col gap-xsmall'>
        <h2 className='content-emphasis text-heading-large padding-none'>
          {loginState.switchAccount === 'adding-account'
            ? translate(loginFormStrings.HeadingAddAccount)
            : translate(loginFormStrings.HeadingSignIn)}
        </h2>
        <span className='content-default text-body-large'>
          {translate(loginFormStrings.HeaderJumpBackIn)}
        </span>
      </div>
      <form
        className='flex flex-col gap-xlarge'
        onSubmit={e => {
          e.preventDefault();
          if (isDisabled) {
            return;
          }
          sendLoginButtonClickEvent();
          sendAuthButtonClickEvent(loginBtn, '', lrLoginForm);
          const credential = { type: getCredentialType(identifier), value: identifier, password };
          login.mutate({ credential });
        }}>
        <div className='flex flex-col gap-medium'>
          <UsernameInput
            label={translate(loginFormStrings.LabelUsernameEmailOrPhone)}
            placeholder={translate(loginFormStrings.LabelUsernameEmailOrPhone)}
            autoComplete='username webauthn'
            id='login-username'
            name='username'
            value={identifier}
            isSignup={false}
            reserveErrorSpace={false}
            onChange={setIdentifier}
            hasError={errorMessage != null}
            isDisabled={isDisabled}
            onFocus={() => sendAuthFormInteractionEvent(lrLoginForm, username, focused)}
            onBlur={() => sendAuthFormInteractionEvent(lrLoginForm, username, unfocused)}
          />
          <PasswordInput
            label={translate(loginFormStrings.LabelPassword)}
            placeholder={translate(loginFormStrings.LabelPassword)}
            id='login-password'
            name='password'
            autoComplete='current-password'
            value={password}
            onChange={setPassword}
            error={errorMessage}
            isDisabled={isDisabled}
            onFocus={() => sendAuthFormInteractionEvent(lrLoginForm, passwordField, focused)}
            onBlur={() => sendAuthFormInteractionEvent(lrLoginForm, passwordField, unfocused)}
            onShowPassword={() => sendAuthButtonClickEvent(showPassword, '', lrLoginForm)}
            onHidePassword={() => sendAuthButtonClickEvent(hidePassword, '', lrLoginForm)}
          />
        </div>
        <div className='flex flex-col gap-medium'>
          <Button
            isLoading={inProgress}
            isDisabled={isAccountLimitReached}
            size='Medium'
            variant='Emphasis'
            type='submit'
            formNoValidate>
            {translate(loginFormStrings.ActionSignInSentenceCase)}
          </Button>
          <Button
            size='Medium'
            variant='ActionUtility'
            as='a'
            href={`${urlConstants.forgotCredentialsUrl}${forgotCredentialsParams}`}
            isDisabled={isDisabled}
            onClick={() => sendAuthButtonClickEvent(forgotCredentials, '', lrLoginForm)}>
            {translate(loginFormStrings.ActionForgotPasswordOrUsernameQuestion)}
          </Button>
        </div>
        <div className='flex items-center gap-medium'>
          <div className='fill'>
            <Divider />
          </div>
          <span className='content-default text-label-medium'>
            {translate(loginFormStrings.LabelOr)}
          </span>
          <div className='fill'>
            <Divider />
          </div>
        </div>
        <div className='flex flex-col gap-small'>
          {isOtpEnabled.data?.IsOtpEnabled && (
            <Button
              size='Medium'
              variant='Standard'
              isDisabled={isDisabled}
              onClick={() => {
                sendOtpLoginButtonClickEvent();
                sendAuthButtonClickEvent(OTP, '', lrLoginForm);
                startOtp();
              }}>
              <span className='flex items-center gap-small'>
                <Icon name='icon-regular-envelope' />
                {translate(loginFormStrings.ActionEmailACode)}
              </span>
            </Button>
          )}
          <Button
            size='Medium'
            variant='Standard'
            isDisabled={isDisabled}
            onClick={() => {
              sendXdlButtonClickEvent();
              sendAuthButtonClickEvent(xdl, '', lrLoginForm);
              startXdl();
            }}>
            <span className='flex items-center gap-small'>
              <Icon name='icon-regular-squares-grid-qr' />
              {translate(loginFormStrings.AuthenticationQuickSignInLowercase)}
            </span>
          </Button>
          <Button
            size='Medium'
            variant='ActionUtility'
            as='a'
            href={createAccountUrl}
            isDisabled={isDisabled}
            onClick={() => sendAuthButtonClickEvent(createAccount, '', lrLoginForm)}>
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate(loginFormStrings.LabelDontHaveAnAccountCreateOne, {
                  startTag:
                    '<span style="text-decoration: underline; text-decoration-skip-ink: none;">',
                  endTag: '</span>'
                })
              }}
            />
          </Button>
        </div>
      </form>
      {
        // TODO: move the Login form into this component once login is redesigned as mutliple steps
        loginState.step === 'login' ? <Login login={login} /> : null
      }
      {
        // TODO: consider redesigning this as a form step instead of a modal
        loginState.step === 'otp' ? (
          <Otp codeLength={isOtpEnabled.data?.OtpCodeLength ?? 100} />
        ) : null
      }
      {/* TODO: in the future this should be moved to the `Xdl` step. */}
      <XdlModalContainer />
      {
        // TODO: consider redesigning this as a form step instead of a modal
        loginState.step === 'xdl' ? <Xdl /> : null
      }
      {
        // TODO: consider redesigning this as a form step instead of a modal
        loginState.step === 'select-account' ? <SelectAccount {...loginState} /> : null
      }
      {
        // TODO: consider redesigning this as a form step instead of a modal
        loginState.step === 'security-questions' ? <SecurityQuestions {...loginState} /> : null
      }
      {
        // TODO: consider redesigning this as a form step instead of a modal
        loginState.step === 'security-notification' ? (
          <SecurityNotification {...loginState} />
        ) : null
      }
      {
        // TODO: consider redesigning this as a form step instead of a modal
        loginState.step === '2sv' ? <Login2sv {...loginState} /> : null
      }
      <MagicLinkLoginErrorModal
        isOpen={isMagicLinkLoginErrorModalOpen}
        onClose={() => setIsMagicLinkLoginErrorModalOpen(false)}
        translate={translate}
      />
    </React.Fragment>
  );
};

export default LoginForm;
