/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect } from 'react';
import { useDebounce, useTranslation, WithTranslationsProps } from 'react-utilities';
import { AccountIntegrityChallengeService, AccountSwitcherService } from 'Roblox';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@rbx/foundation-ui';
import { dataStores } from 'core-roblox-utilities';
import { authenticatedUser } from 'header-scripts';
import {
  counters,
  errorCodes,
  urlConstants,
  signupFormStrings,
  validationMessages,
  USER_AGREEMENTS
} from '../constants/signupConstants';
import BirthdayInput from './components/BirthdayInput';
import UsernameInput from './components/UsernameInput';
import UsernameSuggestions from './components/UsernameSuggestions';
import PasswordInput from './components/PasswordInput';
import GenderInput from './components/GenderInput';
import LegalText from './components/LegalText';
import ExitSignupConfirmationDialog from './components/ExitSignupConfirmationDialog';
import {
  useSignup,
  usernameValidationMessage,
  setBirthdayYear,
  setBirthdayMonth,
  setBirthdayDay,
  setUsername,
  setPassword,
  setGender,
  setAgreementIds,
  setMetadataV2,
  constructValidUTCBirthdate
} from './signUpState';
import { intl } from './utils';
import { signupWithParams } from './api';
import {
  getActiveUserBirthdayToPrefillDate,
  getPasswordValidationMessage,
  getReturnUrl
} from '../utils/signupUtils';
import useIntlAuthCompliance from '../../common/hooks/useIntlAuthCompliance';
import useLoggedInUsers from '../../common/hooks/useLoggedInUsers';
import { TSignupParams, Gender } from '../../common/types/signupTypes';
import {
  incrementEphemeralCounter,
  sendSchematizedSignupButtonClickEvent,
  sendUsernameSuggestionShownEvent,
  sendAuthButtonClickEvent,
  sendAuthFormInteractionEvent,
  sendAuthMsgShownEvent,
  sendExitSignupConfirmationShownEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import { parseErrorCode } from '../../common/utils/requestUtils';
import { navigateToPage } from '../../common/utils/browserUtils';
import {
  showMaxLoggedInAccountsModal,
  showEmptyBlobRequiredModal
} from './utils/authErrorModalUtils';
import { getMetadataV2, getUserAgreements } from '../services/signupService';

const { lrSignupForm } = EVENT_CONSTANTS.context;
const {
  birthdayDay,
  birthdayMonth,
  birthdayYear,
  signupUsername,
  signupPassword,
  usernameValid
} = EVENT_CONSTANTS.field;
const {
  genderMale,
  genderFemale,
  showPassword,
  hidePassword,
  usernameSuggestion,
  signIn,
  exitSignupConfirmYes,
  exitSignupConfirmCancel
} = EVENT_CONSTANTS.btn;
const { focused, unfocused, selected, unselected } = EVENT_CONSTANTS.state;

type SignupFieldError = 'birthday' | 'username' | 'password';
type SignupModal =
  | { type: 'maxAccounts' }
  | { type: 'emptyBlob'; isParent: false }
  | { type: 'parentEmptyBlob'; isParent: true };

type SignupError =
  | {
      displayMethod: 'field';
      field: SignupFieldError;
      message: string;
    }
  | {
      displayMethod: 'general';
      message: string;
    }
  | {
      displayMethod: 'modal';
      modal: SignupModal;
    }
  | {
      displayMethod: 'autonavigate';
    };

const extractSignupRequestError = (error: unknown): SignupError | null => {
  const errorCode = parseErrorCode(error);
  switch (errorCode) {
    // case errorCodes.captcha:
    //   handleCaptchaError(error);
    //   return;
    case errorCodes.invalidBirthdate:
      return {
        displayMethod: 'field',
        field: 'birthday',
        message: validationMessages.birthdayInvalid
      };
    case errorCodes.invalidUsername:
      return {
        displayMethod: 'field',
        field: 'username',
        message: validationMessages.usernameInvalid
      };
    case errorCodes.usernameTaken:
      return {
        displayMethod: 'field',
        field: 'username',
        message: validationMessages.usernameAlreadyInUse
      };
    case errorCodes.invalidPassword:
      return {
        displayMethod: 'field',
        field: 'password',
        message: validationMessages.useDifferentPassword
      };
    case errorCodes.passwordSameAsUsername:
      return {
        displayMethod: 'field',
        field: 'password',
        message: validationMessages.passwordContainsUsernameError
      };
    case errorCodes.passwordTooSimple:
      return {
        displayMethod: 'field',
        field: 'password',
        message: validationMessages.passwordTooSimple
      };
    case errorCodes.ageUnder13:
    case errorCodes.ageUnder18:
      return { displayMethod: 'autonavigate' };
    case errorCodes.emptyAccountSwitchBlobRequired:
      return { displayMethod: 'modal', modal: { type: 'emptyBlob', isParent: false } };
    case errorCodes.maxLoggedInAccountsLimitReached:
      return { displayMethod: 'modal', modal: { type: 'maxAccounts' } };
    case errorCodes.parentEmptyAccountSwitchBlobRequired:
      return { displayMethod: 'modal', modal: { type: 'parentEmptyBlob', isParent: true } };
    case errorCodes.insertAcceptancesFailed:
      return { displayMethod: 'general', message: validationMessages.accountCreatedButLoginFailed };
    default:
      // eslint-disable-next-line no-console
      console.error('Unhandled error was fired from signup: ', error);
      // Ignore generic challenge abandons.
      if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
        return null;
      }
      if (
        typeof error === 'object' &&
        (error as Record<string, unknown>).status === errorCodes.tooManyAttepmts
      ) {
        incrementEphemeralCounter(counters.tooManyAttempts);
      }
      return { displayMethod: 'general', message: validationMessages.unknownError };
  }
};

const handleSignupModal = ({
  modal,
  translate,
  onRetrySignup: _onRetrySignup
}: {
  modal: SignupModal;
  translate: WithTranslationsProps['translate'];
  onRetrySignup: () => void;
}): void => {
  switch (modal.type) {
    case 'maxAccounts':
      showMaxLoggedInAccountsModal(translate, () => navigateToPage(getReturnUrl()));
      break;
    case 'emptyBlob':
      showEmptyBlobRequiredModal(translate, _onRetrySignup, {
        isVPCParentFocused: false
      });
      break;
    case 'parentEmptyBlob':
      showEmptyBlobRequiredModal(translate, _onRetrySignup, {
        isVPCParentFocused: true
      });
      break;
    default:
      // No action needed for unknown modal types
      break;
  }
};

const SignUpForm = (): JSX.Element => {
  const { translate } = useTranslation();
  const { verifiedSignupCountry } = useIntlAuthCompliance(); // TODO: use `useQuery` in this function
  const [
    isAccountSwitchingEnabledForBrowser
  ] = AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false];
  const {
    birthday,
    username,
    password,
    gender,
    agreementIds,
    metadataV2: storedMetadataV2
  } = useSignup();
  const { loggedInUsers } = useLoggedInUsers(false);

  const birthdate = constructValidUTCBirthdate(birthday);
  const debouncedUsername = useDebounce(username, 250);
  const debouncedPassword = useDebounce(password, 250);
  const locale = intl.getLocale();
  const [signupResponseError, setSignupResponseError] = useState<SignupError | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState<boolean>(false);

  const { data: metadataV2 } = useQuery({
    queryKey: ['metadata-v2'],
    queryFn: async () => {
      const response = await getMetadataV2();
      setMetadataV2(response);
      return response;
    }
  });

  useQuery({
    queryKey: ['user-agreements'],
    queryFn: async () => {
      const userAgreementsResponse = await getUserAgreements();
      if (userAgreementsResponse && userAgreementsResponse.length > 0) {
        // If ParentalConsent exist, it will be added after the parental consent modal flow is finished.
        const ids = userAgreementsResponse
          .filter(agreement => agreement.agreementType !== USER_AGREEMENTS.ParentalConsent)
          .map(agreement => agreement.id);
        setAgreementIds(ids);
      }
      return userAgreementsResponse;
    }
  });

  // To clear signup request UI when anything changes in the signup form
  const resetSignupResponseErrorState = (): void => setSignupResponseError(null);

  useEffect(() => {
    const prefillActiveUserBirthday = async () => {
      if (isAccountSwitchingEnabledForBrowser && authenticatedUser?.isAuthenticated) {
        const activeUserBirthday = await getActiveUserBirthdayToPrefillDate();
        if (activeUserBirthday) {
          setBirthdayYear(activeUserBirthday.getFullYear());
          setBirthdayMonth(activeUserBirthday.getMonth());
          setBirthdayDay(activeUserBirthday.getDate());
        }
      }
    };
    prefillActiveUserBirthday().catch(console.error);
  }, [isAccountSwitchingEnabledForBrowser, authenticatedUser]);

  const isAltAttempt = metadataV2?.IsAltBrowserTracker ?? false;
  const { isAccountLimitReached } = loggedInUsers;

  useEffect(() => {
    if (isAccountSwitchingEnabledForBrowser && isAccountLimitReached) {
      showMaxLoggedInAccountsModal(translate, () => navigateToPage(getReturnUrl()));
    }
  }, [isAccountSwitchingEnabledForBrowser, isAccountLimitReached, translate]);

  const signup = useMutation({
    mutationFn: async (params: TSignupParams) => {
      await signupWithParams(params, getReturnUrl());
    },
    onSuccess: () => {
      resetSignupResponseErrorState();
    },
    onError: (error): SignupError | null => {
      const extractedSignupRequestError = extractSignupRequestError(error);
      setSignupResponseError(extractedSignupRequestError);
      if (extractedSignupRequestError?.displayMethod === 'modal') {
        handleSignupModal({
          modal: extractedSignupRequestError.modal,
          translate,
          // TODO: fire retry signup when signup param creation and signup
          // firing is packaged together
          onRetrySignup: () => {
            return undefined;
          }
        });
      } else if (extractedSignupRequestError?.displayMethod === 'autonavigate') {
        navigateToPage('');
      } else {
        // field error
        return extractedSignupRequestError;
      }
      return null;
    }
  });

  const birthdayValidationErrorMessage =
    birthdate === null ? validationMessages.birthdayInvalid : null;

  const { data: usernameValidationErrorMessage } = useQuery({
    queryKey: ['validate-username', debouncedUsername, birthdate],
    queryFn: async () => {
      const message = await usernameValidationMessage(debouncedUsername, birthdate ?? null);
      if (message) {
        sendAuthMsgShownEvent(lrSignupForm, signupUsername, translate(message));
      } else {
        sendAuthFormInteractionEvent(lrSignupForm, usernameValid);
      }
      return message;
    },
    keepPreviousData: true,
    enabled: debouncedUsername !== ''
  });

  const { data: passwordValidationErrorMessage } = useQuery({
    queryKey: ['validate-password', debouncedUsername, debouncedPassword, verifiedSignupCountry],
    queryFn: async () => {
      const message = await getPasswordValidationMessage(
        debouncedUsername,
        debouncedPassword,
        signup.variables?.password,
        verifiedSignupCountry
      );
      if (message) {
        sendAuthMsgShownEvent(lrSignupForm, signupPassword, translate(message));
      }
      return message;
    },
    keepPreviousData: true,
    enabled: debouncedPassword !== ''
  });

  const signupRequestError: SignupError | null = signupResponseError;
  const birthdayError =
    birthdayValidationErrorMessage ??
    (signupRequestError?.displayMethod === 'field' && signupRequestError.field === 'birthday'
      ? signupRequestError.message
      : null);

  const usernameError =
    usernameValidationErrorMessage ??
    (signupRequestError?.displayMethod === 'field' && signupRequestError.field === 'username'
      ? signupRequestError.message
      : null);

  const passwordError =
    passwordValidationErrorMessage ??
    (signupRequestError?.displayMethod === 'field' && signupRequestError.field === 'password'
      ? signupRequestError.message
      : null);

  const generalError =
    signupRequestError?.displayMethod === 'general' ? signupRequestError.message : null;

  const isFormValid =
    username !== '' &&
    !usernameValidationErrorMessage &&
    password !== '' &&
    !passwordValidationErrorMessage &&
    birthdate != null;

  // We want to keep the loading state active even after success (the redirect is still happening)
  const isPendingOrSuccess = signup.isPending || signup.isSuccess;

  return (
    <form
      className='flex flex-col gap-xlarge'
      onSubmit={e => {
        e.preventDefault();
        if (isPendingOrSuccess) {
          return;
        }

        const { authIntentDataStore } = dataStores || {};
        const hasAuthIntent = authIntentDataStore?.hasUnclaimedAuthIntent?.() ?? false;
        sendSchematizedSignupButtonClickEvent(isAltAttempt, hasAuthIntent);

        if (birthdate == null) {
          return;
        }
        const params: TSignupParams = {
          username,
          password,
          birthday: birthdate,
          gender,
          isTosAgreementBoxChecked: true,
          locale
        };

        const isUserAgreementsEnabled =
          storedMetadataV2?.IsUserAgreementsSignupIntegrationEnabled ?? false;
        if (isUserAgreementsEnabled && agreementIds.length > 0) {
          params.agreementIds = agreementIds;
        }

        if (isAccountSwitchingEnabledForBrowser) {
          // attach accountBlob if it exists
          const accountBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob();
          if (accountBlob) {
            params.accountBlob = accountBlob;
          }
        }

        signup.mutate(params);
      }}>
      <div className='flex flex-col gap-xsmall'>
        <h3 className='text-heading-large padding-none content-emphasis'>
          {translate(signupFormStrings.HeadingCreateANewAccountSentenceCase)}
        </h3>
        <p className='text-body-large content-default'>
          {translate(signupFormStrings.HeadingDiscoverMillionsExperiences)}
        </p>
      </div>
      <div className='flex flex-col gap-small'>
        <BirthdayInput
          birthday={birthday}
          error={birthdayError ? translate(birthdayError) : undefined}
          onChangeYear={year => {
            sendAuthFormInteractionEvent(lrSignupForm, birthdayYear, String(year));
            setBirthdayYear(year);
            resetSignupResponseErrorState();
          }}
          onChangeMonth={month => {
            sendAuthFormInteractionEvent(lrSignupForm, birthdayMonth, String(month));
            setBirthdayMonth(month);
            resetSignupResponseErrorState();
          }}
          onChangeDay={day => {
            sendAuthFormInteractionEvent(lrSignupForm, birthdayDay, String(day));
            setBirthdayDay(day);
            resetSignupResponseErrorState();
          }}
          isDisabled={isPendingOrSuccess}
          onOpenChangeDay={open => {
            if (open) sendAuthFormInteractionEvent(lrSignupForm, birthdayDay, focused);
          }}
          onOpenChangeMonth={open => {
            if (open) sendAuthFormInteractionEvent(lrSignupForm, birthdayMonth, focused);
          }}
          onOpenChangeYear={open => {
            if (open) sendAuthFormInteractionEvent(lrSignupForm, birthdayYear, focused);
          }}
        />
        <UsernameInput
          label={translate(signupFormStrings.Username)}
          placeholder={translate(signupFormStrings.UsernamePlaceholder)}
          id='signup-username'
          name='signupUsername'
          autoComplete='signup-username'
          value={username}
          isSignup
          onChange={(newUsername: string) => {
            resetSignupResponseErrorState();
            setUsername(newUsername);
          }}
          error={username !== '' && usernameError ? translate(usernameError) : undefined}
          isDisabled={isPendingOrSuccess}
          onFocus={() => sendAuthFormInteractionEvent(lrSignupForm, signupUsername, focused)}
          onBlur={() => sendAuthFormInteractionEvent(lrSignupForm, signupUsername, unfocused)}
        />
        <UsernameSuggestions
          username={debouncedUsername}
          birthdate={birthdate ?? undefined}
          onChange={(newUsername: string) => {
            sendAuthButtonClickEvent(usernameSuggestion, newUsername, lrSignupForm);
            setUsername(newUsername);
          }}
          isDisabled={isPendingOrSuccess}
          onSuggestionShown={(suggestions: string[]) => {
            sendUsernameSuggestionShownEvent(
              debouncedUsername,
              suggestions.join(','),
              lrSignupForm
            );
          }}
        />
        <PasswordInput
          label={translate(signupFormStrings.Password)}
          placeholder={translate(signupFormStrings.PasswordPlaceholder)}
          id='signup-password'
          name='signupPassword'
          value={password}
          onChange={setPassword}
          error={password !== '' && passwordError ? translate(passwordError) : undefined}
          isDisabled={isPendingOrSuccess}
          onFocus={() => sendAuthFormInteractionEvent(lrSignupForm, signupPassword, focused)}
          onBlur={() => sendAuthFormInteractionEvent(lrSignupForm, signupPassword, unfocused)}
          onShowPassword={() => sendAuthButtonClickEvent(showPassword, '', lrSignupForm)}
          onHidePassword={() => sendAuthButtonClickEvent(hidePassword, '', lrSignupForm)}
        />
        <GenderInput
          gender={gender}
          onChange={newGender => {
            // Only fire one event per click: unselect if toggling off, select if toggling on
            if (newGender === Gender.unknown) {
              // User clicked currently selected gender to deselect it
              const btn = gender === Gender.male ? genderMale : genderFemale;
              sendAuthButtonClickEvent(btn, unselected, lrSignupForm);
            } else {
              // User selected a gender
              const btn = newGender === Gender.male ? genderMale : genderFemale;
              sendAuthButtonClickEvent(btn, selected, lrSignupForm);
            }
            setGender(newGender);
          }}
          isDisabled={isPendingOrSuccess}
        />
        {generalError && (
          <div className='padding-top-medium'>
            <Button
              size='Medium'
              className='input-validation-large alert-warning font-bold general-error-button'
              onClick={() => setSignupResponseError(null)}>
              {translate(generalError)}
            </Button>
          </div>
        )}
      </div>
      <div className='flex flex-col gap-medium padding-top-small'>
        <LegalText locale={locale} />
        <div className='flex flex-col gap-small'>
          <Button
            isLoading={isPendingOrSuccess}
            isDisabled={!isFormValid}
            size='Medium'
            variant='Emphasis'
            type='submit'
            formNoValidate>
            {translate(signupFormStrings.CreateAccountSentenceCase)}
          </Button>
          <Button
            size='Medium'
            variant='ActionUtility'
            // switch to button to trigger confirmation modal if form is valid, otherwise switch to anchor tag
            as={isFormValid ? 'button' : 'a'}
            href={isFormValid ? undefined : urlConstants.login}
            isDisabled={isPendingOrSuccess}
            onClick={() => {
              sendAuthButtonClickEvent(signIn, '', lrSignupForm);
              if (isFormValid) {
                setShowExitConfirmation(true);
                sendExitSignupConfirmationShownEvent(lrSignupForm);
              }
            }}>
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate(signupFormStrings.AlreadyHaveAccountSignIn, {
                  startTag:
                    '<span style="text-decoration: underline; text-decoration-skip-ink: none;">',
                  endTag: '</span>'
                })
              }}
            />
          </Button>
        </div>
      </div>
      <ExitSignupConfirmationDialog
        open={showExitConfirmation}
        onConfirmExit={() => {
          sendAuthButtonClickEvent(exitSignupConfirmYes, '', lrSignupForm);
          navigateToPage(urlConstants.login);
        }}
        onCancel={() => {
          sendAuthButtonClickEvent(exitSignupConfirmCancel, '', lrSignupForm);
          setShowExitConfirmation(false);
        }}
      />
    </form>
  );
};

export default SignUpForm;
