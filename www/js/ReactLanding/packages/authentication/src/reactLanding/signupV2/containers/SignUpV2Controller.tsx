import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useDebounce,
  useTranslation,
  WithTranslationsProps,
} from "@rbx/core-scripts/legacy/react-utilities";
import { AccountIntegrityChallengeService, AccountSwitcherService } from "Roblox";
import { SilentPasskeyUpgradeVariant } from "../../../shared/silentPasskeyUpgradeCore";
import {
  FormFieldStatus,
  Gender,
  TSignupParams,
} from "@rbx/authentication-common/types/signupTypes";
import {
  TCaptchaInputParams,
  TOnCaptchaChallengeCompletedData,
} from "@rbx/authentication-common/types/captchaTypes";
import { parseCaptchaData } from "@rbx/authentication-common/utils/errorParsingUtils";
import CaptchaComponent from "@rbx/authentication-common/components/CaptchaComponent";
import useExperiments from "@rbx/authentication-common/hooks/useExperiments";
import usePasswordPolicyMsgShownEvent from "@rbx/authentication-common/hooks/usePasswordPolicyMsgShownEvent";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import {
  getUsernameRequirements,
  isUsernameUnavailable,
  UsernameAvailability,
  usernameRequirementErrorMessages,
  usernameRequirementLabels,
} from "@rbx/authentication-common/utils/usernameRequirementUtils";
import { experimentLayer } from "../../constants/landingConstants";
import { signupTranslationConfig } from "../../translation.config";
import {
  getLocalizedBirthdayOptionTitle,
  getOrderedBirthdaySelects,
} from "../../utils/birthdayUtils";
import { classifySignupError } from "../../utils/signupErrorUtils";
import {
  getLocale,
  getPasswordValidationMessage,
  getReturnUrl,
  getUsernameValidationMessage,
  handleEmptyAccountSwitchBlobRequired,
  isValidBirthday,
} from "../../utils/signupUtils";
import {
  buildSignupBirthday,
  buildSignupParams as buildProductionSignupParams,
} from "../../utils/signupRequestUtils";
import { getProductionSignupAgreementIds, SignupAgreement } from "../../utils/signupAgreementUtils";
import {
  SubmitSignupOptions,
  submitSignup as submitProductionSignup,
} from "../../services/signupSubmissionService";
import { getMetadataV2, getUserAgreements } from "../../services/signupService";
import {
  sendAuthButtonClickEvent,
  sendAuthFormInteractionEvent,
  sendPasswordPolicyMsgShownEvent,
  sendPasswordValidationEvent,
  sendSignupErrorShownEvent,
  sendSignupPasskeyRegistrationOutcomeEvent,
  sendSignupSsoButtonClickEvent,
  sendSignupSsoButtonShownEvent,
  sendSignUpV2FormPageLoadEvent,
  sendUsernameSuggestionShownEvent,
  sendUsernameValidationErrorEvent,
  sendUsernameValidationSuccessEvent,
} from "../../services/eventService";
import { parseErrorCode } from "@rbx/authentication-common/utils/requestUtils";
import { navigateToPage, navigateToLogin } from "@rbx/authentication-common/utils/browserUtils";
import useAuditContentState from "../../state/auditContentState";
import useLoggedInUsers from "@rbx/authentication-common/hooks/useLoggedInUsers";
import useRedirectHomeIf from "@rbx/authentication-common/hooks/useRedirectHomeIf";
import AccountSwitcherRestrictionComponent from "../../../shared/AccountSwitcherRestrictionComponent";
import { confirmationModalOrigins } from "../../../accountSwitcher/constants/accountSwitcherConstants";
import LegalText from "../../components/LegalText";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import {
  reactSignupCaptchaContainer,
  reactSignupAccountLimitContainer,
  signupFormStrings,
  urlConstants,
  USER_AGREEMENTS,
  validationMessages,
} from "../../constants/signupConstants";
import {
  authFlow,
  authSource,
  authVariant,
  AuthVariant,
  createAuthFlowTelemetry,
} from "../../../shared/telemetry/authFlowTelemetry";
import useSignupAbandonmentBeacon from "../hooks/useSignupAbandonmentBeacon";
import useSignUpV2Compliance from "../hooks/useSignUpV2Compliance";
import useUsernameSuggestions from "@rbx/authentication-common/hooks/useUsernameSuggestions";
import { SignUpFormV2BirthdayFieldName } from "../components/SignUpFormV2";
import SignInPrompt from "../components/SignInPrompt";
import {
  getPasswordRequirements,
  PasswordRequirement,
  passwordRequirementLabels,
} from "../utils/passwordRequirementUtils";
import type { SignUpV2RefreshVariant } from "../utils/signupV2ExperimentUtils";
import { authUiVariants } from "@rbx/authentication-common/utils/authUiVariantUtils";
import AuthenticationMethodDivider from "../../../shared/components/AuthenticationMethodDivider";
import SsoProviderButtons from "../../../shared/components/SsoProviderButtons";
import {
  ssoDividerLabel,
  ssoIdentityProviderIds,
  ssoProviderLabels,
} from "../../../shared/constants/ssoConstants";
import useAuthUiPolicy from "../../../shared/hooks/useAuthUiPolicy";
import { redirectToSsoProvider } from "../../../shared/services/ssoRedirectService";
import { isSsoEligible, isStudioEmbeddedWebView } from "../../../shared/utils/ssoEligibilityUtils";
import { getAvailableSsoProviders } from "../../../shared/utils/ssoProviderUtils";
import SignUpContainerV2, {
  SignUpContainerV2FormProps,
  SignUpV2Treatment,
} from "./SignUpContainerV2";

type SignUpV2ControllerProps = {
  treatment: SignUpV2Treatment;
  authUiVariant?: SignUpV2RefreshVariant;
};

// Field-level interaction telemetry, matching the shape `revamp/SignUpForm` emits
// so the funnel is comparable against the control arm.
const { focused, unfocused, selected, unselected } = EVENT_CONSTANTS.state;
const { birthdayDay, birthdayMonth, birthdayYear, signupUsername, signupPassword } =
  EVENT_CONSTANTS.field;
const { genderMale, genderFemale, signIn, usernameSuggestion } = EVENT_CONSTANTS.btn;
const formInteractionCtx = EVENT_CONSTANTS.context.signupForm;

const birthdayInteractionField: Record<SignUpFormV2BirthdayFieldName, string> = {
  day: birthdayDay,
  month: birthdayMonth,
  year: birthdayYear,
};

// Matches the legacy form: long enough to keep the username endpoint from being
// hit on every keystroke, short enough that errors still surface while typing.
const validationDebounceMs = 200;

const signupVariantByTreatment: Record<SignUpV2Treatment, AuthVariant> = {
  [SignUpV2Treatment.PasswordFirst]: authVariant.passwordFirst,
  [SignUpV2Treatment.PasskeyFirst]: authVariant.passkeyFirst,
  [SignUpV2Treatment.FoundationControl]: authVariant.foundationControl,
};

const signupVariantByAuthUiVariant: Record<SignUpV2RefreshVariant, AuthVariant> = {
  refreshSsoDialog: authVariant.refreshSsoDialog,
  refreshSsoInline: authVariant.refreshSsoInline,
};

const SignUpV2Controller = ({ treatment, authUiVariant }: SignUpV2ControllerProps): JSX.Element => {
  const { translate } = useTranslation();
  // Account-switcher restriction: mirrors the legacy form so a browser at or over the
  // max-logged-in-accounts limit cannot create yet another session, over either submit path.
  const [isAccountSwitchingEnabledForBrowser, isAccountSwitcherHookCompleted] =
    AccountSwitcherService?.useIsAccountSwitcherAvailableForBrowser() ?? [false, false];
  const [hasMaxLoggedInAccountsSignupError, setHasMaxLoggedInAccountsSignupError] = useState(false);
  const { loggedInUsers } = useLoggedInUsers(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [birthdayStatus, setBirthdayStatus] = useState(FormFieldStatus.Incomplete);
  const [birthdayError, setBirthdayError] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(FormFieldStatus.Incomplete);
  const [usernameError, setUsernameError] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState(UsernameAvailability.Unknown);
  const [password, setPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState(FormFieldStatus.Incomplete);
  const [passwordError, setPasswordError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>(() =>
    getPasswordRequirements("", ""),
  );
  const [passwordThatFailedServerCheck, setPasswordThatFailedServerCheck] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [gender, setGender] = useState(Gender.unknown);
  const [generalError, setGeneralError] = useState("");
  const [locale] = useState(() => getLocale() ?? "");
  const [isUserAgreementsEnabled, setIsUserAgreementsEnabled] = useState(false);
  const [userAgreements, setUserAgreements] = useState<SignupAgreement[]>([]);
  const [isConditionalCreateSupported, setIsConditionalCreateSupported] = useState(false);
  const [unifiedCaptchaId, setUnifiedCaptchaId] = useState("");
  const [dataExchange, setDataExchange] = useState("");
  // Latest submission attempt, kept in a ref so callbacks created in the render
  // in which a submit began (the logout-all confirm path) still see the failed
  // attempt even though the state update lands only on later renders.
  const lastSubmissionRef = useRef<SubmitSignupOptions | null>(null);
  const dayRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLSelectElement>(null);
  const birthdayValuesRef = useRef({ day: "", month: "", year: "" });
  const usernameValidationRequestIdRef = useRef(0);
  const debouncedUsername = useDebounce(username, validationDebounceMs);
  const debouncedPassword = useDebounce(password, validationDebounceMs);
  const experiments = useExperiments(experimentLayer);
  const telemetry = useMemo(
    () =>
      createAuthFlowTelemetry({
        flow: authFlow.signup,
        source: authSource.signupV2,
        variant: authUiVariant
          ? signupVariantByAuthUiVariant[authUiVariant]
          : signupVariantByTreatment[treatment],
      }),
    [authUiVariant, treatment],
  );
  // Not the container: this component owns every path that can complete signup,
  // including the post-captcha retry.
  const { markSignupCompleted } = useSignupAbandonmentBeacon(telemetry);
  usePasswordPolicyMsgShownEvent(password ? passwordError : null, state =>
    sendPasswordPolicyMsgShownEvent(EVENT_CONSTANTS.context.schematizedSignupForm, state),
  );
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
      suggestions.join(","),
      EVENT_CONSTANTS.context.schematizedSignupForm,
    );
  }, []);
  const usernameSuggestions = useUsernameSuggestions({
    username,
    birthday: suggestionBirthdate,
    isEnabled: usernameError === validationMessages.usernameAlreadyInUse,
    onSuggestionsShown: handleSuggestionsShown,
  });
  const compliance = useSignUpV2Compliance({
    day,
    month,
    year,
    locale,
    translate,
    defaultLegalContent: (
      <LegalText
        translationKey={signupFormStrings.SignUpAgreementCreateAnAccount}
        locale={locale}
        translate={translate}
        usesInlineLinkTags
      />
    ),
  });
  const authUiPolicy = useAuthUiPolicy();
  const isSsoOffered =
    authUiVariant === authUiVariants.refreshSsoInline &&
    !authUiPolicy.isLoading &&
    !authUiPolicy.isExternalIdentityLoginExcluded &&
    isSsoEligible({ isStudioEmbeddedWebView: isStudioEmbeddedWebView() });
  const ssoProviders = isSsoOffered ? getAvailableSsoProviders(ssoIdentityProviderIds) : [];
  // The account limit is blob-derived, so it only applies in switcher-enabled browsers — the
  // same population whose sessions the signup would otherwise silently extend.
  const isAccountLimitReached =
    isAccountSwitchingEnabledForBrowser && loggedInUsers.isAccountLimitReached;
  useRedirectHomeIf(
    authenticatedUser.isAuthenticated &&
      isAccountSwitcherHookCompleted &&
      !isAccountSwitchingEnabledForBrowser,
  );
  const handleAccountLimitConfirmation = (): void => {
    if (authenticatedUser.isAuthenticated) {
      navigateToPage(getReturnUrl() || "/");
      return;
    }
    navigateToLogin();
  };
  const ssoProvidersKey = ssoProviders.join(",");
  const usesUsernameRequirements = treatment !== SignUpV2Treatment.FoundationControl;
  const usernameRequirements = usesUsernameRequirements
    ? getUsernameRequirements(username, usernameAvailability).map(({ id, isMet }) => ({
        id,
        isMet,
        label: translate(usernameRequirementLabels[id]),
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
    setBirthdayError(isValid ? "" : validationMessages.birthdayInvalid);
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
    setUsernameError(message ?? "");
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
      "",
      true,
    );
    const isValid = !message;
    setPasswordStatus(isValid ? FormFieldStatus.Valid : FormFieldStatus.Invalid);
    setPasswordError(message ?? "");
    setPasswordRequirements(getPasswordRequirements(password, username, message ?? undefined));
    if (message) {
      sendPasswordValidationEvent(translate(message));
    }
    return isValid;
  };

  useEffect(() => {
    sendSignUpV2FormPageLoadEvent(treatment, authUiVariant);
    telemetry.pageMounted();
    telemetry.formReady();

    const loadMetadata = async (): Promise<void> => {
      const metadata = await getMetadataV2();
      if (!metadata?.IsUserAgreementsSignupIntegrationEnabled) {
        return;
      }
      setIsUserAgreementsEnabled(true);
      const agreements = await getUserAgreements();
      setUserAgreements(
        (agreements ?? []).filter(
          agreement => agreement.agreementType !== USER_AGREEMENTS.ParentalConsent,
        ),
      );
    };

    const probeConditionalCreate = async (): Promise<void> => {
      try {
        const capabilities = await (
          window.PublicKeyCredential as {
            getClientCapabilities?: () => Promise<{ conditionalCreate?: boolean } | undefined>;
          } | null
        )?.getClientCapabilities?.();
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
    // The arm never changes after first render, so this still runs once.
  }, [authUiVariant, telemetry, treatment]);

  useEffect(() => {
    ssoProviders.forEach(provider => sendSignupSsoButtonShownEvent(provider));
    // The provider list is rebuilt every render; its joined key is the stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssoProvidersKey]);

  // The birthday dropdown reports its close before the selected value commits, so
  // validating on close alone reads a birthday that is one selection behind.
  // Driving it off the values instead makes the result independent of that order.
  useEffect(() => {
    if (!day || !month || !year) {
      return;
    }

    const isBirthdayValid = isValidBirthday(year, month, day);
    setBirthdayStatus(isBirthdayValid ? FormFieldStatus.Valid : FormFieldStatus.Invalid);
    setBirthdayError(isBirthdayValid ? "" : validationMessages.birthdayInvalid);
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

  const birthdayFields: SignUpContainerV2FormProps["birthdayFields"] = getOrderedBirthdaySelects(
    day,
    month,
    year,
    event => setDay(event.target.value),
    event => setMonth(event.target.value),
    event => setYear(event.target.value),
    dayRef,
    monthRef,
    yearRef,
  ).map(field => {
    let name: "day" | "month" | "year" = "year";
    if (field.birthdayName === "birthdayDay") {
      name = "day";
    } else if (field.birthdayName === "birthdayMonth") {
      name = "month";
    }

    return {
      name,
      value: field.value,
      label: translate(field.placeholder),
      placeholder: translate(field.placeholder),
      options: field.options.map(option => ({
        value: option.value,
        title: getLocalizedBirthdayOptionTitle(field.birthdayName, option, translate),
      })),
      onOpenChange: isOpen => {
        if (isOpen) {
          sendAuthFormInteractionEvent(formInteractionCtx, field.birthdayName, focused);
          return;
        }
        sendAuthFormInteractionEvent(formInteractionCtx, field.birthdayName, unfocused);
        validateBirthday();
      },
    };
  });

  const { parentalConsentAgreements, shouldExcludeOptionalPersonalInformationPolicy } = compliance;
  const agreementIds = useMemo(
    () =>
      getProductionSignupAgreementIds(
        [...userAgreements, ...parentalConsentAgreements],
        isUserAgreementsEnabled,
        shouldExcludeOptionalPersonalInformationPolicy,
      ),
    [
      isUserAgreementsEnabled,
      userAgreements,
      parentalConsentAgreements,
      shouldExcludeOptionalPersonalInformationPolicy,
    ],
  );

  const buildSignupParams = (nextPassword: string): TSignupParams => {
    const { capturedAuditContent, additionalAuditContent } = useAuditContentState.getState();
    const hasAuditContent =
      Object.keys(capturedAuditContent).length > 0 ||
      Object.keys(additionalAuditContent).length > 0;
    const accountBlob = isAccountSwitchingEnabledForBrowser
      ? AccountSwitcherService?.getStoredAccountSwitcherBlob()
      : undefined;

    return buildProductionSignupParams({
      username,
      password: nextPassword,
      gender,
      birthdayDay: day,
      birthdayMonth: month,
      birthdayYear: year,
      locale,
      agreementIds,
      otpSession: compliance.otpSession,
      accountBlob,
      auditSystemContent: hasAuditContent
        ? { capturedAuditContent, additionalAuditContent }
        : undefined,
    });
  };

  const clearCaptcha = (): void => {
    setUnifiedCaptchaId("");
    setDataExchange("");
    lastSubmissionRef.current = null;
  };

  // Code 21 recovery: the logout-all modal's confirm callback resubmits the
  // failed request with params rebuilt after the blob was deleted, matching the
  // legacy form's `handleSubmit(false)` recovery, which drops the stale blob.
  // The rebuilt submission replaces the ref entry so a captcha challenge raised
  // by the retry resends the blob-free params, not the original pre-logout ones.
  const retryLastSubmission = (): void => {
    const lastSubmission = lastSubmissionRef.current;
    if (lastSubmission) {
      const retrySubmission = {
        ...lastSubmission,
        params: buildSignupParams(lastSubmission.params.password),
      };
      lastSubmissionRef.current = retrySubmission;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      submitProductionSignup(retrySubmission).then(() => {
        lastSubmissionRef.current = null;
        markSignupCompleted();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
      }, onSignupError);
    }
  };

  const onSignupError = (error: unknown): void => {
    const outcome = classifySignupError(error, () => false);
    // Every branch, including the ones that navigate away or open a captcha
    // rather than rendering a message.
    sendSignupErrorShownEvent(
      EVENT_CONSTANTS.context.schematizedSignupForm,
      outcome,
      parseErrorCode(error),
    );

    if (outcome.type !== "captcha") {
      compliance.clearParentOtp();
    }
    if (outcome.type === "captcha") {
      const captchaData: TCaptchaInputParams = parseCaptchaData(error);
      setUnifiedCaptchaId(captchaData.unifiedCaptchaId);
      setDataExchange(captchaData.dataExchange);
      return;
    }
    if (outcome.type === "field") {
      if (outcome.field === "birthday") {
        setBirthdayStatus(FormFieldStatus.Invalid);
        setBirthdayError(outcome.message);
      } else if (outcome.field === "username") {
        usernameValidationRequestIdRef.current += 1;
        setUsernameStatus(FormFieldStatus.Invalid);
        setUsernameError(outcome.message);
        setUsernameAvailability(
          isUsernameUnavailable(outcome.message)
            ? UsernameAvailability.Unavailable
            : UsernameAvailability.Unknown,
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
    if (outcome.type === "ageRestriction") {
      navigateToPage(getReturnUrl());
      return;
    }
    if (outcome.type === "general") {
      setGeneralError(outcome.message);
      return;
    }
    if (outcome.type === "accountSwitcher") {
      if (outcome.reason === "maxAccounts") {
        setHasMaxLoggedInAccountsSignupError(true);
        return;
      }
      if (outcome.reason === "emptyBlob") {
        handleEmptyAccountSwitchBlobRequired(retryLastSubmission, translate, false);
        return;
      }
      // parentEmptyBlob is unreachable here: VPC signup fails closed to the legacy form.
    }
    setGeneralError(validationMessages.unknownError);
  };

  const submitSignupRequest = async (options: SubmitSignupOptions): Promise<void> => {
    lastSubmissionRef.current = options;
    await submitProductionSignup(options);
    markSignupCompleted();
    lastSubmissionRef.current = null;
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
      continue: translate("Action.Continue"),
      createAccount: translate(signupFormStrings.CreateAccountSentenceCase),
      showPassword: translate("Label.ShowPassword"),
      hidePassword: translate("Label.HidePassword"),
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
    legalContent: compliance.legalContent,
    signInContent:
      treatment === SignUpV2Treatment.FoundationControl
        ? undefined
        : ({ isDisabled }) => (
            <SignInPrompt
              translate={translate}
              translationKey={signupFormStrings.AlreadyHaveAccountSignIn}
              href={urlConstants.login}
              isDisabled={isDisabled || isAccountLimitReached}
              onClick={() => {
                sendAuthButtonClickEvent(signIn, "", EVENT_CONSTANTS.context.schematizedSignupForm);
              }}
            />
          ),
    alternativeAuthContent:
      ssoProviders.length > 0
        ? ({ isDisabled }) => (
            <React.Fragment>
              <AuthenticationMethodDivider label={translate(ssoDividerLabel)} />
              <SsoProviderButtons
                providers={ssoProviders.map(provider => ({
                  provider,
                  label: translate(ssoProviderLabels[provider]),
                  isDisabled: isDisabled || isAccountLimitReached,
                  onClick: () => {
                    sendSignupSsoButtonClickEvent(provider);
                    // Signup continues at the provider, so leaving for it isn't abandonment.
                    markSignupCompleted();
                    redirectToSsoProvider(
                      provider,
                      ssoIdentityProviderIds,
                      EVENT_CONSTANTS.context.schematizedSignupForm,
                      telemetry,
                    );
                  },
                }))}
              />
            </React.Fragment>
          )
        : undefined,
    generalError: generalError ? translate(generalError) : undefined,
    onBirthdayChange: (field, value) => {
      sendAuthFormInteractionEvent(formInteractionCtx, birthdayInteractionField[field], value);
      invalidateUsernameValidation();
      compliance.reset();
      birthdayValuesRef.current = {
        ...birthdayValuesRef.current,
        [field]: value,
      };
      setBirthdayStatus(FormFieldStatus.Incomplete);
      setBirthdayError("");
      if (field === "day") {
        setDay(value);
      } else if (field === "month") {
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
        EVENT_CONSTANTS.context.schematizedSignupForm,
      );
      setUsernameError("");
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
        EVENT_CONSTANTS.context.schematizedSignupForm,
      );
      setGender(nextGender);
    },
  };

  const isBaseFormValid =
    birthdayStatus === FormFieldStatus.Valid &&
    usernameStatus === FormFieldStatus.Valid &&
    compliance.areAgreementsAccepted;
  const isPasswordValid = passwordStatus === FormFieldStatus.Valid;

  return (
    <React.Fragment>
      {compliance.interstitial}
      {/* Stays mounted under the consent page so the pending Continue can resume. */}
      <div hidden={Boolean(compliance.interstitial)}>
        <SignUpContainerV2
          treatment={treatment}
          formProps={formProps}
          addAuthMethodLabels={{
            back: translate("Action.Back"),
            heading: translate(signupFormStrings.CreateAccountSentenceCase),
            greeting: translate("Heading.UserGreetingWithName", { username }),
            subheading: translate("Description.ChooseHowYouSignIn"),
            passwordLabel: translate(signupFormStrings.Password),
            passwordPlaceholder: translate(signupFormStrings.PasswordPlaceholder),
            showPassword: translate("Label.ShowPassword"),
            hidePassword: translate("Label.HidePassword"),
            createPassword: translate("Label.AddPassword"),
            createPasskey: translate("Action.CreateAPasskey"),
            or: translate("Description.Or"),
          }}
          passwordRequirements={passwordRequirements.map(({ id, isMet }) => ({
            id,
            isMet,
            label: translate(passwordRequirementLabels[id]),
          }))}
          passkeyRegistrationError={translate(validationMessages.usernameAlreadyInUse)}
          passkeyAttemptError={translate("Header.PleaseTryAgain")}
          buildSignupParams={buildSignupParams}
          signupCompletionOptions={{
            returnUrl: getReturnUrl(),
            isVerifiedParentConsentSignup: false,
            isVietnamSignup: false,
            isConditionalCreateSupported,
            silentPasskeyUpgradeBrowserCheck: signupSilentUpgradeBrowserCheck,
            telemetry,
          }}
          telemetry={telemetry}
          submitSignupRequest={submitSignupRequest}
          onSignupError={onSignupError}
          onPasskeyRegistrationRejected={compliance.clearParentOtp}
          onPasskeyOutcome={sendSignupPasskeyRegistrationOutcomeEvent}
          isInitialSubmitDisabled={!isBaseFormValid || isAccountLimitReached}
          isPasswordSubmitDisabled={!isBaseFormValid || !isPasswordValid || isAccountLimitReached}
          isPasskeySubmitDisabled={!isBaseFormValid || isAccountLimitReached}
          beginComplianceInterruption={compliance.beginInterruption}
        />
      </div>
      <AccountSwitcherRestrictionComponent
        origin={confirmationModalOrigins.SignupAccountLimit}
        containerId={reactSignupAccountLimitContainer}
        hasMaxLoggedInAccountsSignupError={hasMaxLoggedInAccountsSignupError}
        isAccountLimitReached={isAccountLimitReached}
        handleRedirectHome={handleAccountLimitConfirmation}
        isParentUser={false}
      />
      {unifiedCaptchaId && dataExchange && (
        <CaptchaComponent
          containerId={reactSignupCaptchaContainer}
          actionType={AccountIntegrityChallengeService.Captcha.ActionType.Signup}
          unifiedCaptchaId={unifiedCaptchaId}
          dataExchange={dataExchange}
          onCaptchaChallengeCompleted={(data: TOnCaptchaChallengeCompletedData) => {
            const lastSubmission = lastSubmissionRef.current;
            if (lastSubmission) {
              const retrySubmission = {
                ...lastSubmission,
                params: {
                  ...lastSubmission.params,
                  captchaId: data.captchaId,
                  captchaToken: data.captchaToken,
                },
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

export default SignUpV2Controller;
