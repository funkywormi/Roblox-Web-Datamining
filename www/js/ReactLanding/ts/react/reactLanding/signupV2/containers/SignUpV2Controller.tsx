import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce, withTranslations, WithTranslationsProps } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import { AccountIntegrityChallengeService } from 'Roblox';
import { SilentPasskeyUpgradeVariant } from '../../../common/utils/silentPasskeyUpgradeCore';
import { FormFieldStatus, Gender, TSignupParams } from '../../../common/types/signupTypes';
import {
  TCaptchaInputParams,
  TOnCaptchaChallengeCompletedData
} from '../../../common/types/captchaTypes';
import { parseCaptchaData } from '../../../common/utils/errorParsingUtils';
import CaptchaComponent from '../../../common/components/CaptchaComponent';
import useExperiments from '../../../common/hooks/useExperiments';
import EVENT_CONSTANTS from '../../../common/constants/eventsConstants';
import { experimentLayer } from '../../constants/landingConstants';
import {
  reactSignupCaptchaContainer,
  signupFormStrings,
  urlConstants,
  USER_AGREEMENTS,
  validationMessages
} from '../../constants/signupConstants';
import { signupTranslationConfig } from '../../translation.config';
import {
  getLocalizedBirthdayOptionTitle,
  getOrderedBirthdaySelects
} from '../../utils/birthdayUtils';
import {
  getLocale,
  getPasswordValidationMessage,
  getReturnUrl,
  getUsernameValidationMessage,
  isValidBirthday
} from '../../utils/signupUtils';
import {
  buildSignupBirthday,
  buildSignupParams as buildProductionSignupParams
} from '../../utils/signupRequestUtils';
import { classifySignupError } from '../../utils/signupErrorUtils';
import { getProductionSignupAgreementIds, SignupAgreement } from '../../utils/signupAgreementUtils';
import {
  SubmitSignupOptions,
  submitSignup as submitProductionSignup
} from '../../services/signupSubmissionService';
import { getMetadataV2, getUserAgreements } from '../../services/signupService';
import {
  sendAuthButtonClickEvent,
  sendAuthFormInteractionEvent,
  sendPasswordValidationEvent,
  sendSignupErrorShownEvent,
  sendSignupPasskeyRegistrationOutcomeEvent,
  sendSignUpV2FormPageLoadEvent,
  sendUsernameSuggestionShownEvent,
  sendUsernameValidationErrorEvent,
  sendUsernameValidationSuccessEvent
} from '../../services/eventService';
import { parseErrorCode } from '../../../common/utils/requestUtils';
import { navigateToPage } from '../../../common/utils/browserUtils';
import useAuditContentState from '../../state/auditContentState';
import LegalText from '../../components/LegalText';
import useSignupAbandonmentBeacon from '../hooks/useSignupAbandonmentBeacon';
import useUsernameSuggestions from '../hooks/useUsernameSuggestions';
import { SignUpFormV2BirthdayFieldName } from '../components/SignUpFormV2';
import {
  getPasswordRequirements,
  PasswordRequirement,
  passwordRequirementLabels
} from '../utils/passwordRequirementUtils';
import {
  getUsernameRequirements,
  UsernameAvailability,
  usernameRequirementErrorMessages,
  usernameRequirementLabels
} from '../utils/usernameRequirementUtils';
import SignUpContainerV2, {
  SignUpContainerV2FormProps,
  SignUpV2Treatment
} from './SignUpContainerV2';

type SignUpV2ControllerProps = WithTranslationsProps & {
  treatment: SignUpV2Treatment;
};

// Field-level interaction telemetry, matching the shape `revamp/SignUpForm` emits
// so the funnel is comparable against the control arm.
const { focused, unfocused, selected, unselected } = EVENT_CONSTANTS.state;
const {
  birthdayDay,
  birthdayMonth,
  birthdayYear,
  signupUsername,
  signupPassword
} = EVENT_CONSTANTS.field;
const { genderMale, genderFemale, signIn, usernameSuggestion } = EVENT_CONSTANTS.btn;
const formInteractionCtx = EVENT_CONSTANTS.context.signupForm;

const isUsernameUnavailable = (message: string): boolean =>
  message === validationMessages.usernameAlreadyInUse ||
  message === validationMessages.usernameNotAvailable;

const birthdayInteractionField: Record<SignUpFormV2BirthdayFieldName, string> = {
  day: birthdayDay,
  month: birthdayMonth,
  year: birthdayYear
};

// Matches the legacy form: long enough to keep the username endpoint from being
// hit on every keystroke, short enough that errors still surface while typing.
const validationDebounceMs = 200;

const SignUpV2Controller = ({ treatment, translate }: SignUpV2ControllerProps): JSX.Element => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [birthdayStatus, setBirthdayStatus] = useState(FormFieldStatus.Incomplete);
  const [birthdayError, setBirthdayError] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(FormFieldStatus.Incomplete);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailability, setUsernameAvailability] = useState(UsernameAvailability.Unknown);
  const [password, setPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(FormFieldStatus.Incomplete);
  const [passwordError, setPasswordError] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>(() =>
    getPasswordRequirements('', '')
  );
  const [passwordThatFailedServerCheck, setPasswordThatFailedServerCheck] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [gender, setGender] = useState(Gender.unknown);
  const [generalError, setGeneralError] = useState('');
  const [locale] = useState(() => getLocale() ?? '');
  const [isUserAgreementsEnabled, setIsUserAgreementsEnabled] = useState(false);
  const [userAgreements, setUserAgreements] = useState<SignupAgreement[]>([]);
  const [isConditionalCreateSupported, setIsConditionalCreateSupported] = useState(false);
  const [unifiedCaptchaId, setUnifiedCaptchaId] = useState('');
  const [dataExchange, setDataExchange] = useState('');
  const [lastSubmission, setLastSubmission] = useState<SubmitSignupOptions | null>(null);
  const dayRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLSelectElement>(null);
  const birthdayValuesRef = useRef({ day: '', month: '', year: '' });
  const usernameValidationRequestIdRef = useRef(0);
  const debouncedUsername = useDebounce(username, validationDebounceMs);
  const debouncedPassword = useDebounce(password, validationDebounceMs);
  const experiments = useExperiments(experimentLayer);
  // Not the container: this component owns every path that can complete signup,
  // including the post-captcha retry.
  const { markSignupCompleted } = useSignupAbandonmentBeacon();
  const signupSilentUpgradeBrowserCheck =
    (experiments.signupSilentUpgradeBrowserCheck as SilentPasskeyUpgradeVariant | undefined) ??
    SilentPasskeyUpgradeVariant.NotEnrolled;
  const suggestionBirthdate = useMemo(() => {
    if (!isValidBirthday(year, month, day)) {
      return undefined;
    }
    const birthday = buildSignupBirthday(day, month, year);
    return Number.isNaN(birthday.getTime()) ? undefined : birthday;
  }, [day, month, year]);
  const handleSuggestionsShown = useCallback((input: string, suggestions: string[]): void => {
    sendUsernameSuggestionShownEvent(
      input,
      suggestions.join(','),
      EVENT_CONSTANTS.context.schematizedSignupForm
    );
  }, []);
  const usernameSuggestions = useUsernameSuggestions({
    username,
    birthday: suggestionBirthdate,
    isEnabled: usernameError === validationMessages.usernameAlreadyInUse,
    onSuggestionsShown: handleSuggestionsShown
  });
  const usesUsernameRequirements = treatment !== SignUpV2Treatment.FoundationControl;
  const usernameRequirements = usesUsernameRequirements
    ? getUsernameRequirements(username, usernameAvailability).map(({ id, isMet }) => ({
        id,
        isMet,
        label: translate(usernameRequirementLabels[id])
      }))
    : undefined;

  const invalidateUsernameValidation = (): void => {
    usernameValidationRequestIdRef.current += 1;
    setUsernameAvailability(UsernameAvailability.Unknown);
  };

  const handleUsernameChange = (nextUsername: string): void => {
    invalidateUsernameValidation();
    setUsername(nextUsername);
  };

  const validateBirthday = (): boolean => {
    const { day: nextDay, month: nextMonth, year: nextYear } = birthdayValuesRef.current;
    const isValid = isValidBirthday(nextYear, nextMonth, nextDay);
    setBirthdayStatus(isValid ? FormFieldStatus.Valid : FormFieldStatus.Invalid);
    setBirthdayError(isValid ? '' : validationMessages.birthdayInvalid);
    return isValid;
  };

  const validateUsername = async (): Promise<boolean> => {
    const requestId = usernameValidationRequestIdRef.current + 1;
    usernameValidationRequestIdRef.current = requestId;
    setUsernameAvailability(UsernameAvailability.Unknown);
    let didCheckAvailability = false;
    const message = await getUsernameValidationMessage(username, day, month, year, () => {
      didCheckAvailability = true;
    });
    if (requestId !== usernameValidationRequestIdRef.current) {
      return false;
    }

    const isValid = !message;
    let nextAvailability = UsernameAvailability.Unknown;
    if (isValid && didCheckAvailability) {
      nextAvailability = UsernameAvailability.Available;
    } else if (isUsernameUnavailable(message)) {
      nextAvailability = UsernameAvailability.Unavailable;
    }
    setUsernameStatus(isValid ? FormFieldStatus.Valid : FormFieldStatus.Invalid);
    setUsernameError(message ?? '');
    setUsernameAvailability(nextAvailability);
    if (message) {
      sendUsernameValidationErrorEvent(username, translate(message));
    } else {
      sendUsernameValidationSuccessEvent();
    }
    return isValid;
  };

  const validatePassword = async (): Promise<boolean> => {
    const message = await getPasswordValidationMessage(
      username,
      password,
      passwordThatFailedServerCheck,
      '',
      true
    );
    const isValid = !message;
    setPasswordStatus(isValid ? FormFieldStatus.Valid : FormFieldStatus.Invalid);
    setPasswordError(message ?? '');
    setPasswordRequirements(getPasswordRequirements(password, username, message ?? undefined));
    if (message) {
      sendPasswordValidationEvent(translate(message));
    }
    return isValid;
  };

  useEffect(() => {
    sendSignUpV2FormPageLoadEvent(treatment);

    const loadMetadata = async (): Promise<void> => {
      const metadata = await getMetadataV2();
      if (!metadata?.IsUserAgreementsSignupIntegrationEnabled) {
        return;
      }
      setIsUserAgreementsEnabled(true);
      const agreements = await getUserAgreements();
      setUserAgreements(
        (agreements ?? []).filter(
          agreement => agreement.agreementType !== USER_AGREEMENTS.ParentalConsent
        )
      );
    };

    const probeConditionalCreate = async (): Promise<void> => {
      try {
        const capabilities = await (window.PublicKeyCredential as {
          getClientCapabilities?: () => Promise<{ conditionalCreate?: boolean } | undefined>;
        } | null)?.getClientCapabilities?.();
        setIsConditionalCreateSupported(Boolean(capabilities?.conditionalCreate));
      } catch {
        setIsConditionalCreateSupported(false);
      }
    };

    // These production enrichments are non-blocking, matching the legacy form.
    // eslint-disable-next-line no-void
    void loadMetadata();
    // eslint-disable-next-line no-void
    void probeConditionalCreate();
    // `treatment` never changes after first render, so this still runs once.
  }, [treatment]);

  // The birthday dropdown reports its close before the selected value commits, so
  // validating on close alone reads a birthday that is one selection behind.
  // Driving it off the values instead makes the result independent of that order.
  useEffect(() => {
    if (!day || !month || !year) {
      return;
    }

    const isBirthdayValid = isValidBirthday(year, month, day);
    setBirthdayStatus(isBirthdayValid ? FormFieldStatus.Valid : FormFieldStatus.Invalid);
    setBirthdayError(isBirthdayValid ? '' : validationMessages.birthdayInvalid);
  }, [day, month, year]);

  // Validate while the user types rather than only on blur, matching the legacy form.
  // Username validity depends on the birthday, so the birthday values are inputs too.
  useEffect(() => {
    if (!username && usernameStatus === FormFieldStatus.Incomplete) {
      return;
    }
    // eslint-disable-next-line no-void
    void validateUsername();
  }, [debouncedUsername, day, month, year]);

  // Password rules include the username, so it has to re-run when either changes.
  useEffect(() => {
    if (!password && passwordStatus === FormFieldStatus.Incomplete) {
      return;
    }
    // eslint-disable-next-line no-void
    void validatePassword();
  }, [debouncedUsername, debouncedPassword]);

  const birthdayFields: SignUpContainerV2FormProps['birthdayFields'] = getOrderedBirthdaySelects(
    day,
    month,
    year,
    event => setDay(event.target.value),
    event => setMonth(event.target.value),
    event => setYear(event.target.value),
    dayRef,
    monthRef,
    yearRef
  ).map(field => {
    let name: 'day' | 'month' | 'year' = 'year';
    if (field.birthdayName === 'birthdayDay') {
      name = 'day';
    } else if (field.birthdayName === 'birthdayMonth') {
      name = 'month';
    }

    return {
      name,
      value: field.value,
      label: translate(field.placeholder),
      placeholder: translate(field.placeholder),
      options: field.options.map(option => ({
        value: option.value,
        title: getLocalizedBirthdayOptionTitle(field.birthdayName, option, translate)
      })),
      onOpenChange: isOpen => {
        if (isOpen) {
          sendAuthFormInteractionEvent(formInteractionCtx, field.birthdayName, focused);
          return;
        }
        sendAuthFormInteractionEvent(formInteractionCtx, field.birthdayName, unfocused);
        validateBirthday();
      }
    };
  });

  const agreementIds = useMemo(
    () => getProductionSignupAgreementIds(userAgreements, isUserAgreementsEnabled, false),
    [isUserAgreementsEnabled, userAgreements]
  );

  const buildSignupParams = (nextPassword: string): TSignupParams => {
    const { capturedAuditContent, additionalAuditContent } = useAuditContentState.getState();
    const hasAuditContent =
      Object.keys(capturedAuditContent).length > 0 ||
      Object.keys(additionalAuditContent).length > 0;

    return buildProductionSignupParams({
      username,
      password: nextPassword,
      gender,
      birthdayDay: day,
      birthdayMonth: month,
      birthdayYear: year,
      locale,
      agreementIds,
      otpSession: {
        otpSessionToken: '',
        otpContactType: ''
      },
      auditSystemContent: hasAuditContent
        ? { capturedAuditContent, additionalAuditContent }
        : undefined
    });
  };

  const clearCaptcha = (): void => {
    setUnifiedCaptchaId('');
    setDataExchange('');
    setLastSubmission(null);
  };

  const onSignupError = (error: unknown): void => {
    const outcome = classifySignupError(error, () => false);
    // Every branch, including the ones that navigate away or open a captcha
    // rather than rendering a message.
    sendSignupErrorShownEvent(
      EVENT_CONSTANTS.context.schematizedSignupForm,
      outcome,
      parseErrorCode(error)
    );

    if (outcome.type === 'captcha') {
      const captchaData: TCaptchaInputParams = parseCaptchaData(error);
      setUnifiedCaptchaId(captchaData.unifiedCaptchaId);
      setDataExchange(captchaData.dataExchange);
      return;
    }
    if (outcome.type === 'field') {
      if (outcome.field === 'birthday') {
        setBirthdayStatus(FormFieldStatus.Invalid);
        setBirthdayError(outcome.message);
      } else if (outcome.field === 'username') {
        usernameValidationRequestIdRef.current += 1;
        setUsernameStatus(FormFieldStatus.Invalid);
        setUsernameError(outcome.message);
        setUsernameAvailability(
          isUsernameUnavailable(outcome.message)
            ? UsernameAvailability.Unavailable
            : UsernameAvailability.Unknown
        );
      } else {
        setPasswordStatus(FormFieldStatus.Invalid);
        setPasswordError(outcome.message);
        if (outcome.shouldRememberRejectedPassword) {
          setPasswordThatFailedServerCheck(password);
        }
      }
      return;
    }
    if (outcome.type === 'ageRestriction') {
      navigateToPage(getReturnUrl());
      return;
    }
    if (outcome.type === 'general') {
      setGeneralError(outcome.message);
      return;
    }
    setGeneralError(validationMessages.unknownError);
  };

  const submitSignupRequest = async (options: SubmitSignupOptions): Promise<void> => {
    setLastSubmission(options);
    await submitProductionSignup(options);
    markSignupCompleted();
    setLastSubmission(null);
  };

  const formProps: SignUpContainerV2FormProps = {
    labels: {
      heading: translate(signupFormStrings.CreateAccountSentenceCase),
      subheading: translate(signupFormStrings.HeadingPlayCreateConnect),
      birthday: translate(signupFormStrings.Birthday),
      username: translate(signupFormStrings.Username),
      usernamePlaceholder: translate(signupFormStrings.UsernamePlaceholder),
      password: translate(signupFormStrings.Password),
      passwordPlaceholder: translate(signupFormStrings.PasswordPlaceholder),
      gender: translate(signupFormStrings.Gender),
      female: translate('Label.Female'),
      male: translate('Label.Male'),
      continue: translate('Action.Continue'),
      createAccount: translate(signupFormStrings.CreateAccountSentenceCase),
      showPassword: translate('Label.ShowPassword'),
      hidePassword: translate('Label.HidePassword')
    },
    birthdayFields,
    birthdayError: birthdayError ? translate(birthdayError) : undefined,
    username,
    usernameError: usernameError ? translate(usernameError) : undefined,
    usernameRequirements,
    isUsernameErrorCoveredByRequirements:
      usesUsernameRequirements && usernameRequirementErrorMessages.has(usernameError),
    usernameSuggestions,
    usernameSuggestionsLabel: translate(signupFormStrings.Try),
    password,
    passwordError: passwordError ? translate(passwordError) : undefined,
    isPasswordVisible,
    gender,
    legalContent: (
      <LegalText
        translationKey={signupFormStrings.SignUpAgreementCreateAnAccount}
        locale={locale}
        translate={translate}
        usesInlineLinkTags
      />
    ),
    signInContent:
      treatment === SignUpV2Treatment.FoundationControl
        ? undefined
        : ({ isDisabled }) => (
            <Button
              className='width-full'
              size='Medium'
              variant='ActionUtility'
              as='a'
              href={urlConstants.login}
              isDisabled={isDisabled}
              onClick={() => {
                sendAuthButtonClickEvent(signIn, '', EVENT_CONSTANTS.context.schematizedSignupForm);
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
          ),
    generalError: generalError ? translate(generalError) : undefined,
    onBirthdayChange: (field, value) => {
      sendAuthFormInteractionEvent(formInteractionCtx, birthdayInteractionField[field], value);
      invalidateUsernameValidation();
      birthdayValuesRef.current = {
        ...birthdayValuesRef.current,
        [field]: value
      };
      setBirthdayStatus(FormFieldStatus.Incomplete);
      setBirthdayError('');
      if (field === 'day') {
        setDay(value);
      } else if (field === 'month') {
        setMonth(value);
      } else {
        setYear(value);
      }
    },
    onUsernameChange: handleUsernameChange,
    onUsernameSuggestionSelect: suggestion => {
      sendAuthButtonClickEvent(
        usernameSuggestion,
        suggestion,
        EVENT_CONSTANTS.context.schematizedSignupForm
      );
      setUsernameError('');
      handleUsernameChange(suggestion);
    },
    onUsernameFocus: () => {
      sendAuthFormInteractionEvent(formInteractionCtx, signupUsername, focused);
    },
    onUsernameBlur: () => {
      sendAuthFormInteractionEvent(formInteractionCtx, signupUsername, unfocused);
      // eslint-disable-next-line no-void
      void validateUsername();
    },
    onPasswordChange: setPassword,
    onPasswordVisibilityToggle: () => setIsPasswordVisible(current => !current),
    onPasswordFocus: () => {
      sendAuthFormInteractionEvent(formInteractionCtx, signupPassword, focused);
    },
    onPasswordBlur: () => {
      sendAuthFormInteractionEvent(formInteractionCtx, signupPassword, unfocused);
      // eslint-disable-next-line no-void
      void validatePassword();
    },
    onGenderChange: nextGender => {
      // The form reports a deselect as Gender.unknown, so the button is read off current state.
      const isDeselect = nextGender === Gender.unknown;
      const button = (isDeselect ? gender : nextGender) === Gender.male ? genderMale : genderFemale;
      sendAuthButtonClickEvent(
        button,
        isDeselect ? unselected : selected,
        EVENT_CONSTANTS.context.schematizedSignupForm
      );
      setGender(nextGender);
    }
  };

  const isBaseFormValid =
    birthdayStatus === FormFieldStatus.Valid && usernameStatus === FormFieldStatus.Valid;
  const isPasswordValid = passwordStatus === FormFieldStatus.Valid;

  return (
    <React.Fragment>
      <SignUpContainerV2
        treatment={treatment}
        formProps={formProps}
        addAuthMethodLabels={{
          back: translate('Action.Back'),
          heading: translate(signupFormStrings.CreateAccountSentenceCase),
          greeting: translate('Heading.UserGreetingWithName', { username }),
          subheading: translate('Description.ChooseHowYouSignIn'),
          passwordLabel: translate(signupFormStrings.Password),
          passwordPlaceholder: translate(signupFormStrings.PasswordPlaceholder),
          showPassword: translate('Label.ShowPassword'),
          hidePassword: translate('Label.HidePassword'),
          createPassword: translate('Label.AddPassword'),
          createPasskey: translate('Action.CreateAPasskey'),
          or: translate('Description.Or')
        }}
        passwordRequirements={passwordRequirements.map(({ id, isMet }) => ({
          id,
          isMet,
          label: translate(passwordRequirementLabels[id])
        }))}
        passkeyRegistrationError={translate(validationMessages.usernameAlreadyInUse)}
        passkeyAttemptError={translate('Header.PleaseTryAgain')}
        buildSignupParams={buildSignupParams}
        signupCompletionOptions={{
          returnUrl: getReturnUrl(),
          isVerifiedParentConsentSignup: false,
          isVietnamSignup: false,
          isConditionalCreateSupported,
          silentPasskeyUpgradeBrowserCheck: signupSilentUpgradeBrowserCheck
        }}
        submitSignupRequest={submitSignupRequest}
        onSignupError={onSignupError}
        onPasskeyOutcome={sendSignupPasskeyRegistrationOutcomeEvent}
        isInitialSubmitDisabled={!isBaseFormValid}
        isPasswordSubmitDisabled={!isBaseFormValid || !isPasswordValid}
        isPasskeySubmitDisabled={!isBaseFormValid}
      />
      {unifiedCaptchaId && dataExchange && (
        <CaptchaComponent
          containerId={reactSignupCaptchaContainer}
          actionType={AccountIntegrityChallengeService.Captcha.ActionType.Signup}
          unifiedCaptchaId={unifiedCaptchaId}
          dataExchange={dataExchange}
          onCaptchaChallengeCompleted={(data: TOnCaptchaChallengeCompletedData) => {
            if (lastSubmission) {
              const retrySubmission = {
                ...lastSubmission,
                params: {
                  ...lastSubmission.params,
                  captchaId: data.captchaId,
                  captchaToken: data.captchaToken
                }
              };
              // eslint-disable-next-line no-void
              void submitProductionSignup(retrySubmission).then(() => {
                markSignupCompleted();
                clearCaptcha();
              }, onSignupError);
            }
          }}
          onCaptchaChallengeInvalidated={() => {
            setGeneralError(validationMessages.unknownError);
            clearCaptcha();
          }}
          onCaptchaChallengeAbandoned={clearCaptcha}
          onUnknownError={() => {
            setGeneralError(validationMessages.unknownError);
            clearCaptcha();
          }}
        />
      )}
    </React.Fragment>
  );
};

export default withTranslations(SignUpV2Controller, signupTranslationConfig);
